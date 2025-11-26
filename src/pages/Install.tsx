import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  Download, 
  Wifi, 
  Zap, 
  HardDrive,
  Chrome,
  Globe
} from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { AboutDialog } from '@/components/AboutDialog';

export default function Install() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      <AboutDialog />
      <div className="container max-w-4xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-primary">
            Install Tengesa4Profit
          </h1>
          <p className="text-lg text-muted-foreground">
            Use our app like a real mobile app - works offline and saves your data!
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mb-3 flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Works Offline</h3>
              <p className="text-sm text-muted-foreground">
                Use the app even without internet connection
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mb-3 flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Zero Data Usage</h3>
              <p className="text-sm text-muted-foreground">
                After first install, uses 0 KB on return visits
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mb-3 flex justify-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Super Fast</h3>
              <p className="text-sm text-muted-foreground">
                Loads instantly from your device
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-6">
          {/* Android Chrome */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>Android Phone (Chrome Browser)</CardTitle>
                  <CardDescription>Most common for Android users</CardDescription>
                </div>
                <Badge variant="secondary">Popular</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Open the app in Chrome browser</p>
                  <p className="text-sm text-muted-foreground">Make sure you're viewing this website in Chrome</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Tap the menu icon (3 dots) at top-right</p>
                  <p className="text-sm text-muted-foreground">Look for ⋮ in the browser toolbar</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">Select "Add to Home screen" or "Install app"</p>
                  <p className="text-sm text-muted-foreground">You might see a popup asking you to install</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  4
                </div>
                <div>
                  <p className="font-medium">Tap "Install" or "Add"</p>
                  <p className="text-sm text-muted-foreground">The app icon will appear on your home screen!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* iPhone/iPad */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>iPhone / iPad (Safari Browser)</CardTitle>
                  <CardDescription>For Apple devices</CardDescription>
                </div>
                <Badge variant="secondary">iOS</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Open the app in Safari browser</p>
                  <p className="text-sm text-muted-foreground">Must use Safari - won't work in Chrome on iPhone</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">Square icon with arrow pointing up at bottom of screen</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">Look for the + icon next to the text</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  4
                </div>
                <div>
                  <p className="font-medium">Tap "Add" at top-right</p>
                  <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Chrome/Edge */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Monitor className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>Computer (Chrome or Edge Browser)</CardTitle>
                  <CardDescription>For desktop/laptop users</CardDescription>
                </div>
                <Badge variant="outline">Desktop</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Look for the install icon in the address bar</p>
                  <p className="text-sm text-muted-foreground">
                    Small <Download className="inline h-3 w-3" /> or <Chrome className="inline h-3 w-3" /> icon next to the URL
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Click the install icon and confirm</p>
                  <p className="text-sm text-muted-foreground">Or use menu (⋮) → "Install Tengesa4Profit"</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">App opens in its own window</p>
                  <p className="text-sm text-muted-foreground">Works like a desktop application!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Browsers */}
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-muted-foreground" />
                <div>
                  <CardTitle>Other Browsers</CardTitle>
                  <CardDescription>Firefox, Opera, Samsung Internet, etc.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Most modern browsers support app installation through their menu options. 
                Look for options like "Install app", "Add to Home screen", or similar in your browser's menu (usually the ⋮ or ☰ icon).
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Can't find the install option?</strong> Make sure you're using a supported browser (Chrome, Safari, Edge, Firefox).
            </p>
            <p>
              <strong>Still having issues?</strong> You can still use the app in your regular browser - it will work the same way!
            </p>
            <p className="text-muted-foreground">
              💡 The installed app saves you data costs because it doesn't need to download the app files every time you visit.
            </p>
          </CardContent>
        </Card>
      </div>
      <AppFooter />
    </div>
  );
}

