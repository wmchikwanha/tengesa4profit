import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage('Email verification failed. The link may have expired.');
          return;
        }

        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Verification Complete'}
            {status === 'error' && 'Verification Failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirecting to home page...
            </p>
          )}
          {status === 'error' && (
            <div className="flex gap-2">
              <Button onClick={() => navigate('/auth')} variant="outline">
                Back to Login
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
