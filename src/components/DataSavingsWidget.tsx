import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataUsageTracker } from '@/hooks/useDataUsageTracker';
import { TrendingDown, Wifi, Calendar, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const DataSavingsWidget: React.FC = () => {
  const { stats, formatDataSize, getDaysSinceInstall, isPWAInstalled } = useDataUsageTracker();
  const navigate = useNavigate();

  if (!isPWAInstalled) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Data Savings Tracker
          </CardTitle>
          <CardDescription>
            Install the app to start tracking your data savings!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/install')}
            className="w-full"
          >
            Learn How to Install
          </Button>
        </CardContent>
      </Card>
    );
  }

  const savingsPercentage = stats.totalVisits > 0 
    ? Math.round((stats.cachedVisits / stats.totalVisits) * 100) 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingDown className="h-5 w-5" />
            Data Savings
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            PWA Active
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          Your offline app is saving you money!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Zap className="h-4 w-4" />
              <span>Data Saved</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatDataSize(stats.estimatedDataSaved)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Wifi className="h-4 w-4" />
              <span>Cached Visits</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {stats.cachedVisits}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-green-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-700">Total visits:</span>
            <span className="font-semibold text-green-900">{stats.totalVisits}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-700">Zero-data visits:</span>
            <span className="font-semibold text-green-900">{savingsPercentage}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-700 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Days active:
            </span>
            <span className="font-semibold text-green-900">{getDaysSinceInstall()}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-green-200">
          <p className="text-xs text-green-700 leading-relaxed">
            💡 <strong>Pro tip:</strong> Every time you return to the app, you're using <strong>0 KB of data</strong> because 
            everything loads from your device. Share this with others to help them save too!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
