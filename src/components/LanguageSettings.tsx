
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

const LanguageSettings: React.FC = () => {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-trader-primary" />
            <h2 className="text-xl font-semibold">{t.language}</h2>
          </div>
          
          <RadioGroup
            value={language}
            onValueChange={(value) => changeLanguage(value as any)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-lg">
              <RadioGroupItem value="en" id="english" />
              <Label htmlFor="english" className="flex-1">English</Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-lg">
              <RadioGroupItem value="sn" id="shona" />
              <Label htmlFor="shona" className="flex-1">Shona</Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-lg">
              <RadioGroupItem value="nd" id="ndebele" />
              <Label htmlFor="ndebele" className="flex-1">Ndebele</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Zim Market Trader</h3>
          <p className="text-trader-neutral">Version 1.0</p>
          <p className="text-trader-neutral text-sm mt-4">
            {language === 'en' && "An app for Zimbabwean traders"}
            {language === 'sn' && "App yevatengesi vemuZimbabwe"}
            {language === 'nd' && "I-app yabathengisi baseZimbabwe"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSettings;
