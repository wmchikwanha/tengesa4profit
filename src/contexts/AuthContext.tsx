
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithPhone: (phone: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  subscriptionStatus: {
    subscribed: boolean;
    tier: string | null;
    trialEnd: string | null;
    subscriptionEnd: string | null;
  };
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    subscribed: false,
    tier: null as string | null,
    trialEnd: null as string | null,
    subscriptionEnd: null as string | null,
  });
  const { toast } = useToast();

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('marketplace-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const refreshSubscription = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setSubscriptionStatus({
        subscribed: data.subscribed || false,
        tier: data.subscription_tier || null,
        trialEnd: data.trial_end || null,
        subscriptionEnd: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            refreshSubscription();
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          // Clear marketplace data on sign out
          cleanupAuthState();
          setSubscriptionStatus({
            subscribed: false,
            tier: null,
            trialEnd: null,
            subscriptionEnd: null,
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          refreshSubscription();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it's 9 digits, assume it's a local number and add +263
    if (digits.length === 9) {
      return `+263${digits}`;
    }
    
    // If it already starts with country code, return as is
    if (digits.startsWith('263') && digits.length === 12) {
      return `+${digits}`;
    }
    
    // Default case - return with +263 prefix
    return `+263${digits.slice(-9)}`;
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account created!",
        description: "You can now sign in to your account.",
      });
    }
    
    return { error };
  };

  const signUpWithPhone = async (phone: string, password: string) => {
    const formattedPhone = formatPhoneNumber(phone);
    
    const { error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password,
    });
    
    if (!error) {
      toast({
        title: "Account created!",
        description: "Please check your phone for a verification code.",
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        window.location.href = '/';
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithPhone = async (phone: string, password: string) => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const formattedPhone = formatPhoneNumber(phone);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        window.location.href = '/';
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signUpWithPhone,
    signIn,
    signInWithPhone,
    signOut,
    subscriptionStatus,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
