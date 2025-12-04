import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type BusinessRole = 'owner' | 'employee' | null;

export interface BusinessPermissions {
  canViewPrices: boolean;
  canViewProfits: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canAddStock: boolean;
  canRecordSales: boolean;
  canClearData: boolean;
  canManageStaff: boolean;
  canAccessReports: boolean;
  canUseAIAssistant: boolean;
}

export interface BusinessInfo {
  id: string;
  name: string;
  inviteCode: string | null;
}

const OWNER_PERMISSIONS: BusinessPermissions = {
  canViewPrices: true,
  canViewProfits: true,
  canAddProducts: true,
  canEditProducts: true,
  canDeleteProducts: true,
  canAddStock: true,
  canRecordSales: true,
  canClearData: true,
  canManageStaff: true,
  canAccessReports: true,
  canUseAIAssistant: true,
};

const EMPLOYEE_PERMISSIONS: BusinessPermissions = {
  canViewPrices: false,
  canViewProfits: false,
  canAddProducts: false,
  canEditProducts: false,
  canDeleteProducts: false,
  canAddStock: false,
  canRecordSales: true,
  canClearData: false,
  canManageStaff: false,
  canAccessReports: false,
  canUseAIAssistant: false,
};

const NO_PERMISSIONS: BusinessPermissions = {
  canViewPrices: false,
  canViewProfits: false,
  canAddProducts: false,
  canEditProducts: false,
  canDeleteProducts: false,
  canAddStock: false,
  canRecordSales: false,
  canClearData: false,
  canManageStaff: false,
  canAccessReports: false,
  canUseAIAssistant: false,
};

export function useBusinessRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<BusinessRole>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<BusinessPermissions>(NO_PERMISSIONS);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setBusinessId(null);
      setBusinessInfo(null);
      setPermissions(NO_PERMISSIONS);
      setLoading(false);
      return;
    }

    const fetchBusinessRole = async () => {
      setLoading(true);
      try {
        // First check if user owns a business
        const { data: ownedBusiness, error: ownerError } = await supabase
          .from('businesses')
          .select('id, name, invite_code')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (ownerError) throw ownerError;

        if (ownedBusiness) {
          setRole('owner');
          setBusinessId(ownedBusiness.id);
          setBusinessInfo({
            id: ownedBusiness.id,
            name: ownedBusiness.name,
            inviteCode: ownedBusiness.invite_code,
          });
          setPermissions(OWNER_PERMISSIONS);
          setLoading(false);
          return;
        }

        // Check if user is an employee
        const { data: membership, error: memberError } = await supabase
          .from('business_members')
          .select('business_id, role, businesses(id, name)')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) throw memberError;

        if (membership) {
          setRole(membership.role as BusinessRole);
          setBusinessId(membership.business_id);
          const business = membership.businesses as any;
          setBusinessInfo({
            id: business.id,
            name: business.name,
            inviteCode: null, // Employees don't see invite code
          });
          setPermissions(membership.role === 'owner' ? OWNER_PERMISSIONS : EMPLOYEE_PERMISSIONS);
        } else {
          // User has no business - they need to create one or join one
          setRole(null);
          setBusinessId(null);
          setBusinessInfo(null);
          setPermissions(NO_PERMISSIONS);
        }
      } catch (error) {
        console.error('Error fetching business role:', error);
        setRole(null);
        setBusinessId(null);
        setBusinessInfo(null);
        setPermissions(NO_PERMISSIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessRole();
  }, [user]);

  const createBusiness = async (name: string = 'My Business') => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({ owner_id: user.id, name })
        .select()
        .single();

      if (error) throw error;

      setRole('owner');
      setBusinessId(data.id);
      setBusinessInfo({
        id: data.id,
        name: data.name,
        inviteCode: data.invite_code,
      });
      setPermissions(OWNER_PERMISSIONS);

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const joinBusiness = async (inviteCode: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('join_business_by_code', {
        p_user_id: user.id,
        p_invite_code: inviteCode.toLowerCase(),
      });

      if (error) throw error;

      // Refresh business role
      const { data: membership } = await supabase
        .from('business_members')
        .select('business_id, role, businesses(id, name)')
        .eq('user_id', user.id)
        .single();

      if (membership) {
        setRole('employee');
        setBusinessId(membership.business_id);
        const business = membership.businesses as any;
        setBusinessInfo({
          id: business.id,
          name: business.name,
          inviteCode: null,
        });
        setPermissions(EMPLOYEE_PERMISSIONS);
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const regenerateInviteCode = async () => {
    if (!user || !businessId || role !== 'owner') {
      return { error: 'Not authorized' };
    }

    try {
      // Generate new random code
      const newCode = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { data, error } = await supabase
        .from('businesses')
        .update({ invite_code: newCode })
        .eq('id', businessId)
        .select()
        .single();

      if (error) throw error;

      setBusinessInfo(prev => prev ? { ...prev, inviteCode: data.invite_code } : null);

      return { data: data.invite_code, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  return {
    role,
    businessId,
    businessInfo,
    permissions,
    loading,
    isOwner: role === 'owner',
    isEmployee: role === 'employee',
    hasBusiness: !!businessId,
    createBusiness,
    joinBusiness,
    regenerateInviteCode,
  };
}
