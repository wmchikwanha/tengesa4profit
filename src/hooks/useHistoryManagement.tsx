
import { useState, useEffect } from 'react';
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
  const [filteredHistory, setFilteredHistory] = useState<SalesRecord[]>([]);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  
  // Always sync filteredHistory with salesHistory
  useEffect(() => {
    setFilteredHistory(salesHistory);
  }, [salesHistory]);
  
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
  
  const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const applyDateFilter = (data: DateFilterForm) => {
    const { startDate, endDate } = data;
    
    if (!startDate && !endDate) {
      setFilteredHistory(salesHistory);
      setIsDateFilterOpen(false);
      return;
    }

    const startKey = startDate ? toDateKey(startDate) : null;
    const endKey = endDate ? toDateKey(endDate) : null;
    
    const filtered = salesHistory.filter(record => {
      const key = record.date; // already YYYY-MM-DD
      if (startKey && endKey) return key >= startKey && key <= endKey;
      if (startKey) return key >= startKey;
      if (endKey) return key <= endKey;
      return true;
    });
    
    console.log('Date filter applied (string compare):', { 
      startKey, 
      endKey,
      originalCount: salesHistory.length,
      filteredCount: filtered.length,
      filteredDates: filtered.map(r => r.date),
      allDates: salesHistory.map(r => r.date)
    });
    
    setFilteredHistory(filtered);
    setIsDateFilterOpen(false);
  };
  
  const resetDateFilter = () => {
    setFilteredHistory(salesHistory);
  };
  
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
