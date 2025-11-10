
import * as React from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithPhone: (phone: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
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

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState({
    subscribed: false,
    tier: null as string | null,
    trialEnd: null as string | null,
    subscriptionEnd: null as string | null,
  });
  const { toast } = useToast();

  const cleanupAuthState = () => {
    // Clear ONLY auth-related items, NOT user data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth') || 
          key.includes('sb-auth') ||
          key.startsWith('auth-token')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage auth items only
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth') || 
          key.includes('sb-auth') ||
          key.startsWith('auth-token')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const refreshSubscription = async () => {
    if (!session?.user) return;
    
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        console.error('No access token available');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });
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

  React.useEffect(() => {
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
          // Complete cleanup on sign out
          cleanupAuthState();
          setUser(null);
          setSession(null);
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
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered') ||
          error.message.includes('email address is already registered')) {
        // Don't show success for duplicate registrations
        return { error };
      } else {
        toast({
          title: "Sign up error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account created!",
        description: "Check your email to sign into your account.",
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

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      // Force complete cleanup before sign in
      cleanupAuthState();
      
      // Multiple cleanup attempts
      try {
        await supabase.auth.signOut({ scope: 'global' });
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      if (data.user) {
        // Store remember me preference
        if (!rememberMe) {
          sessionStorage.setItem('auth-no-persist', 'true');
          // Add event listener to clear session on browser close
          window.addEventListener('beforeunload', () => {
            if (sessionStorage.getItem('auth-no-persist') === 'true') {
              supabase.auth.signOut({ scope: 'local' });
            }
          });
        } else {
          sessionStorage.removeItem('auth-no-persist');
        }
        
        // Force complete page reload to ensure clean state
        window.location.replace('/');
      }
      
      return { error: null };
    } catch (error) {
      console.error('SignIn failed:', error);
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
      // Force complete cleanup
      cleanupAuthState();
      
      // Reset all state immediately
      setUser(null);
      setSession(null);
      setSubscriptionStatus({
        subscribed: false,
        tier: null,
        trialEnd: null,
        subscriptionEnd: null,
      });
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      } catch (err) {
        // Continue even if this fails
      }
      
      // Force complete page reload
      window.location.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload even on error
      window.location.replace('/auth');
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
