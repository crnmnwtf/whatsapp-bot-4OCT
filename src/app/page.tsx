'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, MessageSquare, Send, Camera, RefreshCw, CheckCircle, XCircle, AlertCircle, Users, Wifi, WifiOff } from 'lucide-react';

export default function Home() {
  const [number, setNumber] = useState('60123456789');
  const [message, setMessage] = useState('Hello from WhatsApp Bot! 🚀');
  const { 
    connected, 
    messages, 
    status, 
    screenshot, 
    error, 
    chats,
    sendMessage, 
    getScreenshot, 
    getStatus, 
    getChats,
    clearError 
  } = useSocket();

  const handleSendMessage = () => {
    if (number.trim() && message.trim()) {
      sendMessage(number.trim(), message.trim());
    }
  };

  const handleGetScreenshot = () => {
    getScreenshot();
  };

  const handleRefreshStatus = () => {
    getStatus();
    getChats();
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Smartphone className="w-8 h-8 text-green-600" />
            WhatsApp Bot Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time WhatsApp automation with full functionality
          </p>
        </div>

        {/* Enhanced Status Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={connected ? "default" : "destructive"} className="flex items-center gap-2">
                  {connected ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {connected ? 'Connected' : 'Disconnected'}
                </Badge>
                {status && (
                  <>
                    <Badge variant={status.initialized ? "default" : "secondary"} className="flex items-center gap-2">
                      <Smartphone className="w-3 h-3" />
                      Bot {status.initialized ? 'Ready' : 'Not Ready'}
                    </Badge>
                    {status.demoMode && (
                      <Badge variant="outline" className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        Demo Mode
                      </Badge>
                    )}
                    {status.whatsappConnected !== undefined && (
                      <Badge variant={status.whatsappConnected ? "default" : "secondary"} className="flex items-center gap-2">
                        {status.whatsappConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        WhatsApp {status.whatsappConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    )}
                    {status.activeChats && status.activeChats.length > 0 && (
                      <Badge variant="outline" className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {status.activeChats.length} Active Chats
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefreshStatus}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Mode Alert */}
        {status?.demoMode && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode Active:</strong> WhatsApp features are simulated for demonstration purposes. 
              To enable full functionality, ensure Chrome/Chromium is properly installed on the server.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Message
              </CardTitle>
              <CardDescription>
                {status?.demoMode 
                  ? 'Simulate sending WhatsApp messages (demo mode)'
                  : 'Send WhatsApp messages through the bot'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="number" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="number"
                  type="tel"
                  placeholder="e.g., 60123456789"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!connected || !status?.initialized}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {status?.demoMode ? 'Simulate Send' : 'Send Message'}
                </Button>
                <Button
                  variant="outline"
                  asChild
                >
                  <a 
                    href={`whatsapp://send?phone=${number}&text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bot Status & Screenshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Bot Status
              </CardTitle>
              <CardDescription>
                {status?.demoMode 
                  ? 'View simulated bot status and placeholder'
                  : 'Monitor bot status and take screenshots'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetScreenshot}
                disabled={!connected || !status?.initialized}
                variant="outline"
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                {status?.demoMode ? 'Show Placeholder' : 'Take Screenshot'}
              </Button>
              
              {screenshot && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    {status?.demoMode ? 'Demo Placeholder:' : 'Current View:'}
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={screenshot} 
                      alt={status?.demoMode ? 'Demo placeholder' : 'WhatsApp Bot Screenshot'} 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
              
              {!status?.initialized && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {status?.demoMode 
                      ? 'Demo mode is active. Features are simulated for demonstration.'
                      : 'Bot is not initialized. Check the server console for QR code scanning instructions.'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Active Chats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Chats
              </CardTitle>
              <CardDescription>
                {status?.demoMode 
                  ? 'Simulated chat list (demo mode)'
                  : 'Recent WhatsApp conversations'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={getChats}
                disabled={!connected || !status?.initialized}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Chats
              </Button>
              
              <ScrollArea className="h-64 w-full border rounded-lg p-3">
                <div className="space-y-3">
                  {chats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      {status?.demoMode 
                        ? 'No demo chats available'
                        : 'No active chats found'
                      }
                    </p>
                  ) : (
                    chats.map((chat, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{chat.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                          </div>
                        </div>
                        {index < chats.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Logs
            </CardTitle>
            <CardDescription>
              {status?.demoMode 
                ? 'Simulated message activity and system events'
                : 'Real-time message activity and system events'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {status?.demoMode 
                      ? 'No messages yet. Try sending a simulated message to see activity here.'
                      : 'No messages yet. Send a message to see activity here.'
                    }
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant={
                            msg.from === 'bot' ? 'default' : 
                            msg.from === 'system' ? 'secondary' : 
                            msg.from === 'Demo Contact' || msg.from.startsWith('+') ? 'outline' :
                            'outline'
                          }
                          className="mt-1"
                        >
                          {msg.from}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{msg.body}</p>
                          {msg.timestamp && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTime(msg.timestamp)}
                            </p>
                          )}
                        </div>
                        {msg.direction && (
                          <Badge variant={msg.direction === 'out' ? 'default' : 'secondary'}>
                            {msg.direction}
                          </Badge>
                        )}
                      </div>
                      {index < messages.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}