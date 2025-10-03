import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';
import { z } from 'zod';

const feedbackSchema = z.object({
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters")
});

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const validation = feedbackSchema.safeParse({ message: feedback });
      
      if (!validation.success) {
        toast({
          title: "Invalid Input",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.functions.invoke('submit-feedback', {
        body: { 
          feedback: validation.data.message,
          userEmail: user?.email || 'anonymous'
        }
      });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });
      
      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Report Issue / Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback or Report Issue</DialogTitle>
            <DialogDescription>
              Share your thoughts, report bugs, or suggest improvements. We value your input!
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe your issue or feedback in detail..."
            className="min-h-[150px]"
            maxLength={1000}
          />
          
          <p className="text-xs text-muted-foreground">
            {feedback.length}/1000 characters
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || feedback.trim().length < 10}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
