
import { useState } from 'react';
import { SalesRecord } from '@/contexts/AppDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { parseISO, isAfter, isBefore, startOfDay, endOfDay, isEqual } from 'date-fns';

interface DateFilterForm {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export function useHistoryManagement(salesHistory: SalesRecord[]) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [viewingHistory, setViewingHistory] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState(salesHistory);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  
  const handleToggleHistory = () => {
    setViewingHistory(!viewingHistory);
    // Reset filter when toggling history
    if (!viewingHistory) {
      setFilteredHistory(salesHistory);
    }
  };

  const handleClearAllData = (clearFunction: () => void) => {
    if (window.confirm(t.confirmClearAll)) {
      clearFunction();
      toast({
        title: "Success",
        description: "All data has been cleared",
      });
    }
  };
  
  const applyDateFilter = (data: DateFilterForm) => {
    const { startDate, endDate } = data;
    
    if (!startDate && !endDate) {
      setFilteredHistory(salesHistory);
      return;
    }
    
    const filtered = salesHistory.filter(record => {
      const recordDate = parseISO(record.date);
      
      if (startDate && endDate) {
        return (
          (isAfter(recordDate, startOfDay(startDate)) || isEqual(recordDate, startDate)) && 
          (isBefore(recordDate, endOfDay(endDate)) || isEqual(recordDate, endDate))
        );
      }
      
      if (startDate && !endDate) {
        return isAfter(recordDate, startOfDay(startDate)) || isEqual(recordDate, startDate);
      }
      
      if (!startDate && endDate) {
        return isBefore(recordDate, endOfDay(endDate)) || isEqual(recordDate, endDate);
      }
      
      return true;
    });
    
    setFilteredHistory(filtered);
    setIsDateFilterOpen(false);
  };
  
  const resetDateFilter = () => {
    setFilteredHistory(salesHistory);
  };
  
  // Update filtered history when sales history changes
  if (JSON.stringify(salesHistory) !== JSON.stringify(filteredHistory) && !viewingHistory) {
    setFilteredHistory(salesHistory);
  }
  
  return {
    viewingHistory,
    filteredHistory,
    isDateFilterOpen,
    setIsDateFilterOpen,
    handleToggleHistory,
    handleClearAllData,
    applyDateFilter,
    resetDateFilter
  };
}
