
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LanguageToggle: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-lg bg-zimbabwe-lightGreen p-1">
        <Button
          variant="ghost"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            language === 'en' ? "bg-white shadow text-zimbabwe-darkGreen" : "hover:bg-white/50 text-zimbabwe-darkGreen"
          )}
          onClick={() => changeLanguage('en')}
        >
          English
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            language === 'sn' ? "bg-white shadow text-zimbabwe-darkGreen" : "hover:bg-white/50 text-zimbabwe-darkGreen"
          )}
          onClick={() => changeLanguage('sn')}
        >
          Shona
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            language === 'nd' ? "bg-white shadow text-zimbabwe-darkGreen" : "hover:bg-white/50 text-zimbabwe-darkGreen"
          )}
          onClick={() => changeLanguage('nd')}
        >
          Ndebele
        </Button>
      </div>
    </div>
  );
};

export default LanguageToggle;
