
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zimbabwe-darkGreen">
            Welcome, {user.email}
          </h1>
          <Button 
            onClick={signOut}
            variant="outline"
            className="border-zimbabwe-green text-zimbabwe-green hover:bg-zimbabwe-green hover:text-white"
          >
            Sign Out
          </Button>
        </div>
        
        <div className="mb-8">
          <SubscriptionStatus />
        </div>
        
        <AppLayout />
      </div>
    </div>
  );
}
