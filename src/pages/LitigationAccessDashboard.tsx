import { SidebarProvider } from "@/components/ui/sidebar";
import LitigationAccessSidebar from "@/components/LitigationAccessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, AlertCircle, TrendingUp, LogOut, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
const LitigationAccessDashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('litigationAccessUsername') || 'User';
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('litigationAccessLogin');
    localStorage.removeItem('litigationAccessId');
    localStorage.removeItem('litigationAccessUsername');
    navigate('/bank-login');
  };
  const stats = [{
    title: "Applications Submitted",
    value: "12",
    description: "Total applications submitted",
    icon: Upload,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50"
  }];
  const recentNotifications = [{
    title: "New query from advocate on case #LA-2024-001",
    time: "2 hours ago",
    type: "query"
  }, {
    title: "Application #LA-2024-003 has been approved",
    time: "1 day ago",
    type: "success"
  }, {
    title: "Document verification pending for case #LA-2024-002",
    time: "2 days ago",
    type: "warning"
  }];
  const quickStats = [{
    label: "Active Cases",
    value: "7",
    icon: FileText
  }, {
    label: "Approval Rate",
    value: "85%",
    icon: TrendingUp
  }, {
    label: "Avg. Processing Time",
    value: "3.5 days",
    icon: Clock
  }];
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dashboard">
        <LitigationAccessSidebar />
        <main className="flex-1">
          {/* Header */}
          <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to {username}</h1>
            </div>
            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-6 text-lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to logout? You will need to login again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </header>

          {/* Main Content */}
          <div className="p-8">
            {/* Welcome Alert */}
            

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notifications Section */}
              

              {/* Quick Stats Section */}
              
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>;
};
export default LitigationAccessDashboard;