
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export const ReportHeader: React.FC = () => {
  const { t } = useLanguage();
  const today = new Date();

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-blue-700">{t.tallyProfit}</h2>
      <div className="flex items-center gap-2 text-blue-600">
        <CalendarIcon className="h-5 w-5" />
        <span>{format(today, 'PPP')}</span>
      </div>
    </div>
  );
};
