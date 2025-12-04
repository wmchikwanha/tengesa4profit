-- Phase 1: Create business role enum
CREATE TYPE public.business_role AS ENUM ('owner', 'employee');

-- Phase 2: Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Business',
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 3: Create business_members table (for employees)
CREATE TABLE public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role business_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Phase 4: Create products table (migrating from localStorage)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  supplier TEXT,
  description TEXT,
  purchase_date DATE,
  quantity_bought INTEGER NOT NULL DEFAULT 0,
  unit_of_measurement TEXT NOT NULL DEFAULT 'piece',
  buying_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  transport_cost DECIMAL(12,2) DEFAULT 0,
  stall_fee DECIMAL(12,2) DEFAULT 0,
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  selling_price DECIMAL(12,2),
  quantity_sold INTEGER DEFAULT 0,
  quantity_discarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 5: Create sales_history table
CREATE TABLE public.sales_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  recorded_by UUID NOT NULL,
  date DATE NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  total_profit DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;

-- Phase 6: Create security definer functions to avoid RLS recursion

-- Function to check if user is owner of a business
CREATE OR REPLACE FUNCTION public.is_business_owner(p_user_id UUID, p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM businesses WHERE id = p_business_id AND owner_id = p_user_id
  );
$$;

-- Function to check if user is member of a business
CREATE OR REPLACE FUNCTION public.is_business_member(p_user_id UUID, p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members WHERE business_id = p_business_id AND user_id = p_user_id
  );
$$;

-- Function to get user's business ID (as owner or member)
CREATE OR REPLACE FUNCTION public.get_user_business_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT id FROM businesses WHERE owner_id = p_user_id LIMIT 1),
    (SELECT business_id FROM business_members WHERE user_id = p_user_id LIMIT 1)
  );
$$;

-- Function to get user's role in their business
CREATE OR REPLACE FUNCTION public.get_user_business_role(p_user_id UUID)
RETURNS business_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM businesses WHERE owner_id = p_user_id) THEN 'owner'::business_role
      WHEN EXISTS (SELECT 1 FROM business_members WHERE user_id = p_user_id) THEN 
        (SELECT role FROM business_members WHERE user_id = p_user_id LIMIT 1)
      ELSE NULL
    END;
$$;

-- Function to join business by invite code
CREATE OR REPLACE FUNCTION public.join_business_by_code(p_user_id UUID, p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_id UUID;
BEGIN
  -- Find business with this invite code
  SELECT id INTO v_business_id FROM businesses WHERE invite_code = p_invite_code;
  
  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if user is already a member or owner
  IF EXISTS (SELECT 1 FROM businesses WHERE id = v_business_id AND owner_id = p_user_id) THEN
    RAISE EXCEPTION 'You are the owner of this business';
  END IF;
  
  IF EXISTS (SELECT 1 FROM business_members WHERE business_id = v_business_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'You are already a member of this business';
  END IF;
  
  -- Add user as employee
  INSERT INTO business_members (business_id, user_id, role)
  VALUES (v_business_id, p_user_id, 'employee');
  
  RETURN v_business_id;
END;
$$;

-- Phase 7: RLS Policies for businesses table
CREATE POLICY "Owners can view their business"
ON public.businesses FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Members can view their business"
ON public.businesses FOR SELECT
USING (public.is_business_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create business"
ON public.businesses FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their business"
ON public.businesses FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their business"
ON public.businesses FOR DELETE
USING (owner_id = auth.uid());

-- Phase 8: RLS Policies for business_members table
CREATE POLICY "Owners can view their employees"
ON public.business_members FOR SELECT
USING (public.is_business_owner(auth.uid(), business_id));

CREATE POLICY "Members can view their own membership"
ON public.business_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owners can add employees"
ON public.business_members FOR INSERT
WITH CHECK (public.is_business_owner(auth.uid(), business_id));

CREATE POLICY "Owners can remove employees"
ON public.business_members FOR DELETE
USING (public.is_business_owner(auth.uid(), business_id));

-- Phase 9: RLS Policies for products table
CREATE POLICY "Business members can view products"
ON public.products FOR SELECT
USING (
  public.is_business_owner(auth.uid(), business_id) OR 
  public.is_business_member(auth.uid(), business_id)
);

CREATE POLICY "Owners can insert products"
ON public.products FOR INSERT
WITH CHECK (public.is_business_owner(auth.uid(), business_id));

CREATE POLICY "Owners can update products"
ON public.products FOR UPDATE
USING (public.is_business_owner(auth.uid(), business_id))
WITH CHECK (public.is_business_owner(auth.uid(), business_id));

CREATE POLICY "Employees can update sales quantities only"
ON public.products FOR UPDATE
USING (public.is_business_member(auth.uid(), business_id));

CREATE POLICY "Owners can delete products"
ON public.products FOR DELETE
USING (public.is_business_owner(auth.uid(), business_id));

-- Phase 10: RLS Policies for sales_history table
CREATE POLICY "Owners can view all sales history"
ON public.sales_history FOR SELECT
USING (public.is_business_owner(auth.uid(), business_id));

CREATE POLICY "Business members can insert sales"
ON public.sales_history FOR INSERT
WITH CHECK (
  (public.is_business_owner(auth.uid(), business_id) OR public.is_business_member(auth.uid(), business_id))
  AND recorded_by = auth.uid()
);

CREATE POLICY "Owners can delete sales history"
ON public.sales_history FOR DELETE
USING (public.is_business_owner(auth.uid(), business_id));

-- Create trigger for updated_at on businesses
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create trigger for updated_at on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();