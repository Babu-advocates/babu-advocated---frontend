import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LitigationSidebar } from "@/components/LitigationSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Scale, FileText, Clock, TrendingUp, AlertCircle, LogOut } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { showToast } from "@/lib/toast";
export default function LitigationDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 500);
  }, []);
  const analyticsData = {
    totalCases: 0,
    activeCases: 0,
    pendingHearings: 0,
    closedCases: 0
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-100 font-kontora">
        <LitigationSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Litigation Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your legal cases</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/litigation/create')} className="bg-green-600 hover:bg-green-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Create New Case
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be redirected to the login page and will need to sign in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                    showToast.success("Successfully logged out!");
                    navigate('/advocate-login');
                  }} className="bg-red-600 hover:bg-red-700">
                      Yes, Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Cases
                  </CardTitle>
                  <Scale className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : analyticsData.totalCases}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All registered cases
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      All Time
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Cases
                  </CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : analyticsData.activeCases}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently ongoing
                  </p>
                  <div className="mt-2">
                    <Badge variant="default" className="bg-green-600">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Hearings
                  </CardTitle>
                  <Clock className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : analyticsData.pendingHearings}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scheduled hearings
                  </p>
                  <div className="mt-2">
                    <Badge variant="destructive">
                      Upcoming
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Closed Cases
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : analyticsData.closedCases}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successfully resolved
                  </p>
                  <div className="flex items-center mt-2 text-green-600">
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-green-600 to-emerald-700 text-white">
              
              
            </Card>

            {/* Recent Activity Placeholder */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Recent Cases</CardTitle>
                <CardDescription>Your latest litigation cases will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <div className="text-center">
                    <Scale className="h-12 w-12 mx-auto mb-4 text-green-600/50" />
                    <p>No cases found</p>
                    <p className="text-sm">Create your first litigation case to get started</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>;
}