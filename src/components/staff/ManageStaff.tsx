import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Copy, RefreshCw, Trash2, UserPlus, Lock } from 'lucide-react';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Employee {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export function ManageStaff() {
  const { businessInfo, permissions, regenerateInviteCode, businessId } = useBusiness();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { canUseEmployeeSystem, isFree } = useSubscriptionPermissions();
  const { trackEvent } = useAnalytics();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);

  useEffect(() => {
    if (businessId && permissions.canManageStaff) {
      fetchEmployees();
    }
  }, [businessId, permissions.canManageStaff]);

  const fetchEmployees = async () => {
    if (!businessId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_members')
        .select(`
          id,
          user_id,
          created_at,
          profiles!inner(user_id)
        `)
        .eq('business_id', businessId);

      if (error) throw error;

      // Get emails from auth (we'll use profiles for display)
      const employeeList: Employee[] = (data || []).map(member => ({
        id: member.id,
        user_id: member.user_id,
        email: `Employee ${member.user_id.slice(0, 8)}...`,
        created_at: member.created_at,
      }));

      setEmployees(employeeList);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (businessInfo?.inviteCode) {
      navigator.clipboard.writeText(businessInfo.inviteCode);
      trackEvent('staff_invite_shared', { action: 'copy_code' });
      toast({
        title: 'Copied!',
        description: 'Invite code copied to clipboard',
      });
    }
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    const { error } = await regenerateInviteCode();
    setRegenerating(false);

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Invite code regenerated',
      });
    }
  };

  const handleRemoveEmployee = async () => {
    if (!employeeToRemove || !businessId) return;

    try {
      const { error } = await supabase
        .from('business_members')
        .delete()
        .eq('id', employeeToRemove.id)
        .eq('business_id', businessId);

      if (error) throw error;

      setEmployees(prev => prev.filter(e => e.id !== employeeToRemove.id));
      toast({
        title: 'Employee Removed',
        description: 'The employee has been removed from your business',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove employee',
        variant: 'destructive',
      });
    } finally {
      setEmployeeToRemove(null);
    }
  };

  if (!permissions.canManageStaff) {
    return null;
  }

  // Show upgrade prompt for free tier
  if (isFree) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            {t.tierPremiumFeature || 'Premium Feature'}
          </CardTitle>
          <CardDescription>
            {t.employeeSystemDescription || 'The employee/staff system is a premium feature that allows you to invite employees to record sales.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t.tierEmployeeSystem || 'Employee/Staff System'} {t.tierIncludes || 'includes'}:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ {t.tierInviteEmployees || 'Invite employees with secure codes'}</li>
              <li>✓ {t.tierEmployeeSalesRecording || 'Employees can record sales'}</li>
              <li>✓ {t.tierProtectFinancials || 'Protect your financial data'}</li>
              <li>✓ {t.tierManageStaff || 'Manage staff access'}</li>
            </ul>
          </div>
          <Button
            className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
            onClick={() => {
              const subscriptionSection = document.querySelector('[data-subscription-status]');
              if (subscriptionSection) {
                subscriptionSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {t.upgradeToPlansAction || 'Upgrade to Premium'} - $1.99/{t.month || 'month'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Staff
          </CardTitle>
          <CardDescription>
            Invite employees to record sales. They cannot see prices or profits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Code Section */}
          <div className="space-y-3">
            <Label>Employee Invite Code</Label>
            <p className="text-sm text-muted-foreground">
              Share this code with your employees so they can join your business
            </p>
            <div className="flex gap-2">
              <Input
                value={businessInfo?.inviteCode || 'Loading...'}
                readOnly
                className="font-mono text-lg tracking-wider uppercase"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                disabled={!businessInfo?.inviteCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRegenerateCode}
                disabled={regenerating}
              >
                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Regenerating the code will invalidate the old one
            </p>
          </div>

          {/* Employee List */}
          <div className="space-y-3">
            <Label>Current Employees ({employees.length})</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading employees...</p>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No employees yet. Share your invite code to add staff.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{employee.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(employee.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setEmployeeToRemove(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Employee Permissions Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What employees can do:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ View product names and stock quantities</li>
              <li>✓ Record sales (mark items as sold)</li>
              <li>✗ Cannot see buying prices or costs</li>
              <li>✗ Cannot see profit margins</li>
              <li>✗ Cannot add, edit, or delete products</li>
              <li>✗ Cannot access reports or AI assistant</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!employeeToRemove} onOpenChange={() => setEmployeeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the employee from your business. They will no longer be able to record sales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
