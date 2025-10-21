import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  message: string;
  application_id: string;
  employee_username: string;
  employee_email: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bankUsernames, setBankUsernames] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("by-bank");
  const location = useLocation();

  useEffect(() => {
    fetchBankAccounts();
    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          
          // Only show notifications for legal opinion received and application submissions
          if (newNotification.type === 'legal_opinion_received' || newNotification.type === 'application_submitted') {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Special toast for application submitted in admin dashboard
            if (newNotification.type === 'application_submitted' && location.pathname === '/admin-dashboard') {
              showToast.quickToast('New application submitted!');
            } else {
              const message = newNotification.type === 'legal_opinion_received' 
                ? 'New legal opinion notification received!' 
                : 'New application submitted!';
              showToast.success(message);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification updated:', payload);
          const updatedNotification = payload.new as Notification;
          
          if (updatedNotification.type === 'legal_opinion_received' || updatedNotification.type === 'application_submitted') {
            setNotifications(prev => 
              prev.map(n => 
                n.id === updatedNotification.id ? updatedNotification : n
              )
            );
            // Update unread count
            if (updatedNotification.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('username')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching bank accounts:', error);
      } else {
        setBankUsernames(data?.map(account => account.username) || []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('type', ['legal_opinion_received', 'application_submitted'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        showToast.error('Failed to load notifications');
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast.error('Failed to load notifications');
    }
  };

  // Filter notifications - show only application submissions in "By Bank"
  const bankNotifications = notifications.filter(n => 
    n.type === 'application_submitted'
  );

  // Filter notifications - show all other notifications in "Adv-Employees" 
  const advocateNotifications = notifications.filter(n => 
    n.type !== 'application_submitted'
  );

  // Get current filtered notifications based on active tab
  const getCurrentNotifications = () => {
    return activeTab === "by-bank" ? bankNotifications : advocateNotifications;
  };

  // Get unread count for current tab
  const getCurrentUnreadCount = () => {
    const current = getCurrentNotifications();
    return current.filter(n => !n.is_read).length;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const currentNotifications = getCurrentNotifications();
      const unreadIds = currentNotifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        showToast.error('Failed to mark notifications as read');
      } else {
        setNotifications(prev => 
          prev.map(n => 
            unreadIds.includes(n.id) ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - unreadIds.length));
        showToast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast.error('Failed to mark notifications as read');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[1.25rem]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Legal Opinion Notifications</h3>
            {getCurrentUnreadCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-bank" className="text-xs">
                By Bank ({bankNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="adv-employees" className="text-xs">
                Adv-Employees ({advocateNotifications.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="by-bank" className="mt-2">
            <ScrollArea className="h-80">
              {bankNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No notifications from banks
                </div>
              ) : (
                <div className="p-2">
                  {bankNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        !notification.is_read 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white hover:bg-slate-50'
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          {notification.type === 'legal_opinion_received' 
                            ? 'Legal Opinion Received' 
                            : 'Application Submitted'}
                        </p>
                            <p className="text-xs text-slate-600 mb-2 break-words">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>App: {notification.application_id}</span>
                              <span>{format(new Date(notification.created_at), 'MMM dd, HH:mm')}</span>
                            </div>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="adv-employees" className="mt-2">
            <ScrollArea className="h-80">
              {advocateNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No notifications from advocate employees
                </div>
              ) : (
                <div className="p-2">
                  {advocateNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        !notification.is_read 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white hover:bg-slate-50'
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          {notification.type === 'legal_opinion_received' 
                            ? 'Legal Opinion Received' 
                            : 'Application Submitted'}
                        </p>
                            <p className="text-xs text-slate-600 mb-2 break-words">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>App: {notification.application_id}</span>
                              <span>{format(new Date(notification.created_at), 'MMM dd, HH:mm')}</span>
                            </div>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};