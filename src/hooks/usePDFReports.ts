
import { useRef } from 'react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { downloadPDF, sharePDF } from '@/utils/pdfUtils';

export function usePDFReports() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handleSharePDF = async () => {
    try {
      toast({
        title: "Share",
        description: "Generating PDF for sharing...",
      });
      
      const reportElement = document.getElementById('report-content');
      if (reportElement) {
        await sharePDF('report-content', `trader-profit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        
        toast({
          title: "Success",
          description: "Report shared successfully",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("Share PDF error:", error);
      
      // Even if there's an error, try to use the Web Share API directly if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Zim Market Trader - Daily Report',
            text: `Daily sales report for ${format(new Date(), 'PPP')}. Total profit: ${t.currency}${0}`,
          });
          
          toast({
            title: "Success",
            description: "Shared successfully",
          });
          return;
        } catch (shareError) {
          console.error("Share API error:", shareError);
        }
      }
      
      toast({
        title: "Warning",
        description: "Could not generate report, but sharing options will appear",
      });
    }
  };
  
  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Download",
        description: "Downloading PDF report...",
      });
      
      const reportElement = document.getElementById('report-content');
      if (reportElement) {
        await downloadPDF('report-content', `trader-profit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("Download PDF error:", error);
      toast({
        title: "Error",
        description: "Could not generate or download the report",
        variant: "destructive",
      });
    }
  };
  
  return {
    reportRef,
    handleSharePDF,
    handleDownloadPDF
  };
}
