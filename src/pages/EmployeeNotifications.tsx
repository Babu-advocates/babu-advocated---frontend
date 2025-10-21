import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Bell, BellOff, Check, X, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const employeeUsername = localStorage.getItem("employeeUsername");
      
      if (!employeeUsername) {
        toast({
          title: "Error",
          description: "Employee not logged in",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_username', employeeUsername)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const employeeUsername = localStorage.getItem("employeeUsername");
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('employee_username', employeeUsername)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-employee-light font-kontora">
        <EmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="border-employee-legal text-employee-legal hover:bg-employee-legal hover:text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-employee-red"></div>
                <p className="mt-2 text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">You'll see work assignments and updates here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`border-0 shadow-card transition-all duration-200 ${
                      !notification.is_read 
                        ? 'bg-gradient-to-br from-employee-red/5 to-employee-red/10 border-l-4 border-l-employee-red' 
                        : 'bg-card/50'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            notification.type === 'work_assignment' 
                              ? 'bg-employee-red/10 text-employee-red' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {notification.type === 'work_assignment' ? (
                              <FileText className="h-5 w-5" />
                            ) : (
                              <Bell className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-sm font-semibold text-foreground">
                                {notification.type === 'work_assignment' ? 'New Work Assignment' : 'Notification'}
                              </CardTitle>
                              {!notification.is_read && (
                                <Badge variant="destructive" className="text-xs px-2 py-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            
                            <CardDescription className="text-sm text-muted-foreground">
                              {notification.message}
                            </CardDescription>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(notification.created_at).toLocaleDateString('en-IN')} at{' '}
                                {new Date(notification.created_at).toLocaleTimeString('en-IN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Application: {notification.application_id}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {!notification.is_read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeNotifications;