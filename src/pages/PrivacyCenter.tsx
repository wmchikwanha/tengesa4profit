import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Download, Trash2, Cloud, CloudOff, ArrowLeft, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalOnlyMode } from '@/contexts/LocalOnlyModeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function PrivacyCenter() {
  const navigate = useNavigate();
  const { products, salesHistory } = useAppData();
  const { user, signOut } = useAuth();
  const { localOnly, setLocalOnly } = useLocalOnlyMode();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      userEmail: user?.email,
      products,
      salesHistory,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tengesa4profit-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported', description: 'Your full data has been downloaded to your device.' });
  };

  const deleteEverything = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      localStorage.clear();
      toast({ title: 'Account deleted', description: 'Everything has been permanently removed.' });
      await signOut();
      navigate('/auth');
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message || 'Please contact support.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="mb-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zimbabwe-green/10 mb-3">
            <Shield className="h-8 w-8 text-zimbabwe-darkGreen" />
          </div>
          <h1 className="text-3xl font-bold text-zimbabwe-darkGreen">Privacy Center</h1>
          <p className="text-muted-foreground mt-2">Your Data. Your Phone. Your Control.</p>
        </div>

        {/* What we do / don't */}
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg">What we do and don't</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-zimbabwe-darkGreen shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">What we store</p>
                <p className="text-muted-foreground">Your products, sales records, and business name — so you can use them across devices and share with employees you invite.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Eye className="h-5 w-5 text-zimbabwe-darkGreen shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">What we never store</p>
                <p className="text-muted-foreground">Customer names, phone numbers, GPS location, contacts, photos, or messages. The AI never sees supplier or customer identities.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Download className="h-5 w-5" /> Export all my data</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Download a full copy of your products and sales as a JSON file.</p>
            <Button onClick={exportData} className="w-full">Download my data</Button>
          </CardContent>
        </Card>

        {/* Local-only */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {localOnly ? <CloudOff className="h-5 w-5" /> : <Cloud className="h-5 w-5" />}
              Local-Only Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm text-muted-foreground flex-1">
                Prefer to keep data only on this phone? Turn on Local-Only Mode. Cloud sync pauses,
                employees won't see new entries, and multi-device access stops — but nothing leaves this device.
              </div>
              <Switch checked={localOnly} onCheckedChange={setLocalOnly} />
            </div>
            {localOnly && (
              <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                ⚠️ Local-Only is ON. Data entered now is saved on this device. Turn off to resume cloud sync.
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI transparency */}
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5" /> AI Transparency</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Every time the AI Assistant answers, tap "🔍 What was sent" under the message to see exactly what data
            was shared. We only send product counts, stock levels and profit numbers — never names of suppliers or customers.
          </CardContent>
        </Card>

        {/* Delete everything */}
        <Card className="mb-4 border-destructive/40">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /> Delete everything</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently remove your account, business, products, sales, and all data. This cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete my account and all data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all business data. There is no recovery.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteEverything} disabled={deleting} className="bg-destructive text-destructive-foreground">
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-8">
          Tengesa4Profit — Built for Zimbabwean traders. Data privacy is not optional here.
        </p>
      </div>
    </div>
  );
}
