
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import ProductForm from '@/components/ProductForm';
import TallyProfit from '@/components/profit-tally/TallyProfit';
import Marketplace from '@/components/marketplace/Marketplace';
import { JoinBusiness } from '@/components/staff/JoinBusiness';
import { Badge } from '@/components/ui/badge';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { hasBusiness, loading: businessLoading, isOwner, isEmployee, businessInfo, permissions } = useBusiness();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zimbabwe-green mx-auto mb-4"></div>
          <p className="text-zimbabwe-darkGreen">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // If user doesn't have a business, show the join/create flow
  if (!hasBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-zimbabwe-darkGreen mb-8">
          Welcome to Tengesa4Profit
        </h1>
        <JoinBusiness />
        <Button
          variant="ghost"
          onClick={signOut}
          className="mt-8 text-muted-foreground"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zimbabwe-darkGreen">
              {businessInfo?.name || 'My Business'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isOwner ? 'default' : 'secondary'}>
                {isOwner ? 'Owner' : 'Employee'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
          <Button 
            onClick={signOut}
            variant="outline"
            className="border-zimbabwe-green text-zimbabwe-green hover:bg-zimbabwe-green hover:text-white"
          >
            Sign Out
          </Button>
        </div>
        
        {/* Only show subscription status for owners */}
        {isOwner && (
          <div className="mb-8">
            <SubscriptionStatus />
          </div>
        )}
        
        {/* Employee view - simplified with only sales recording */}
        {isEmployee && (
          <div className="bg-muted/50 border rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              You are logged in as an employee. You can view stock and record sales.
            </p>
          </div>
        )}
        
        <AppLayout 
          addProductContent={permissions.canAddProducts ? <ProductForm /> : null}
          tallyProfitContent={<TallyProfit />}
          marketplaceContent={permissions.canAccessReports ? <Marketplace /> : null}
        />
      </div>
    </div>
  );
}
