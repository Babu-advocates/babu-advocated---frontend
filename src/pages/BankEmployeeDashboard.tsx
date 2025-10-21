import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { 
  Upload, 
  Clock, 
  HelpCircle, 
  CheckCircle,
  FileText,
  DollarSign,
  AlertTriangle,
  Eye,
  Reply,
  Download,
  TrendingUp,
  Calendar,
  Building2,
  LogOut
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function BankEmployeeDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [kpiData, setKpiData] = useState({
    documentsSubmitted: { today: 0, thisMonth: 0, total: 0 },
    pendingDocuments: 0,
    queriesReceived: 0,
    completedDocuments: 156
  });
  const [loading, setLoading] = useState(true);
  const [queryNotifications, setQueryNotifications] = useState([]);

  // Get bank name from localStorage (assuming it's stored during login)
  const bankName = localStorage.getItem('bankName') || 'HDFC Bank'; // fallback for demo

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchApplicationStats();
  }, [bankName]);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const fetchApplicationStats = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching stats for bank:', bankName);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log('Today:', today);
      
      // Get start of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      console.log('Start of month:', startOfMonth);
      
      // Fetch applications for this bank
      const { data: applications, error } = await supabase
        .from('applications')
        .select('submitted_date, submission_date, status, application_id')
        .eq('bank_name', bankName);

      console.log('Applications data:', applications);
      console.log('Applications error:', error);

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      // Calculate today's submissions
      const todaySubmissions = applications?.filter(app => {
        const submissionDate = app.submitted_date || app.submission_date;
        if (!submissionDate) return false;
        const appDate = submissionDate.split('T')[0];
        console.log('Comparing app date:', appDate, 'with today:', today);
        return appDate === today;
      }).length || 0;

      // Calculate this month's submissions
      const thisMonthSubmissions = applications?.filter(app => {
        const submissionDate = app.submitted_date || app.submission_date;
        if (!submissionDate) return false;
        const appDate = new Date(submissionDate);
        console.log('Comparing app date:', appDate, 'with start of month:', startOfMonth);
        return appDate >= startOfMonth;
      }).length || 0;

      // Total submissions for this bank
      const totalSubmissions = applications?.length || 0;

      // Pending documents (in review status)
      const pendingDocs = applications?.filter(app => 
        app.status && (
          app.status.toLowerCase().includes('review') || 
          app.status.toLowerCase().includes('pending') ||
          app.status === 'submitted'
        )
      ).length || 0;

      console.log('Today submissions:', todaySubmissions);
      console.log('This month submissions:', thisMonthSubmissions);
      console.log('Total submissions:', totalSubmissions);
      console.log('Pending documents:', pendingDocs);

      // Fetch queries for applications from this bank
      const applicationIds = applications?.map(app => app.application_id) || [];
      
      let queriesCount = 0;
      let queryDetails = [];
      if (applicationIds.length > 0) {
        const { data: queries, error: queriesError } = await supabase
          .from('queries')
          .select('id, application_id, message, sender_name, created_at, is_read')
          .in('application_id', applicationIds)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('Queries data:', queries);
        console.log('Queries error:', queriesError);

        if (queries) {
          queriesCount = queries.length;
          queryDetails = queries.map(query => {
            const timeAgo = getTimeAgo(query.created_at);
            return {
              type: query.is_read ? "info" : "urgent",
              message: `Query from ${query.sender_name}: ${query.message.substring(0, 50)}...`,
              time: timeAgo,
              applicationId: query.application_id
            };
          });
        }
      }

      console.log('Queries received:', queriesCount);

      setKpiData(prev => ({
        ...prev,
        documentsSubmitted: {
          today: todaySubmissions,
          thisMonth: thisMonthSubmissions,
          total: totalSubmissions,
        },
        pendingDocuments: pendingDocs,
        queriesReceived: queriesCount
      }));

      setQueryNotifications(queryDetails);
    } catch (error) {
      console.error('Error fetching application stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const submissions = [
    { id: "DOC001", type: "Loan Legal Opinion", submittedDate: "2024-01-15", status: "Under Review", priority: "high" },
    { id: "DOC002", type: "Loan Recovery", submittedDate: "2024-01-14", status: "Pending Assignment", priority: "medium" },
    { id: "DOC003", type: "Legal Opinion", submittedDate: "2024-01-13", status: "Completed", priority: "low" },
    { id: "DOC004", type: "Loan Recovery", submittedDate: "2024-01-12", status: "Query Raised", priority: "high" },
  ];

  const queries = [
    { 
      id: "Q001", 
      documentId: "DOC001", 
      raisedBy: "John Smith", 
      dateRaised: "2024-01-16", 
      deadline: "2024-01-18", 
      status: "Open",
      isOverdue: false
    },
    { 
      id: "Q002", 
      documentId: "DOC004", 
      raisedBy: "Sarah Johnson", 
      dateRaised: "2024-01-14", 
      deadline: "2024-01-16", 
      status: "Open",
      isOverdue: true
    },
    { 
      id: "Q003", 
      documentId: "DOC002", 
      raisedBy: "Mike Davis", 
      dateRaised: "2024-01-13", 
      deadline: "2024-01-17", 
      status: "Answered",
      isOverdue: false
    },
  ];

  const loanRecovery = [
    { id: "LR001", borrowerName: "ABC Enterprises", amount: "₹2,50,000", submissionDate: "2024-01-15", status: "In Progress" },
    { id: "LR002", borrowerName: "XYZ Corp", amount: "₹5,00,000", submissionDate: "2024-01-14", status: "Pending" },
    { id: "LR003", borrowerName: "Tech Solutions", amount: "₹1,75,000", submissionDate: "2024-01-13", status: "Completed" },
  ];


  // Chart data
  const monthlyData = [
    { month: "Nov", submitted: 45, completed: 42 },
    { month: "Dec", submitted: 52, completed: 48 },
    { month: "Jan", submitted: 47, completed: 44 },
  ];

  const documentTypeData = [
    { name: "Legal Opinion", value: 65, color: "hsl(var(--bank-navy))" },
    { name: "Loan Recovery", value: 35, color: "hsl(var(--bank-success))" },
  ];

  const queriesOverTime = [
    { day: "Mon", queries: 4 },
    { day: "Tue", queries: 6 },
    { day: "Wed", queries: 3 },
    { day: "Thu", queries: 8 },
    { day: "Fri", queries: 5 },
    { day: "Sat", queries: 2 },
    { day: "Sun", queries: 1 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-bank-success text-bank-success-foreground">Completed</Badge>;
      case "Under Review":
        return <Badge className="bg-bank-warning text-bank-warning-foreground">Under Review</Badge>;
      case "Pending Assignment":
        return <Badge variant="secondary">Pending</Badge>;
      case "Query Raised":
        return <Badge variant="destructive">Query Raised</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bank-light font-kontora">
        <BankEmployeeSidebar />
        
        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground">{bankName}</h1>
                <p className="text-sm text-muted-foreground">Bank Employee Dashboard</p>
              </div>
              
              {/* Logout Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600 ml-auto"
                  >
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
                      navigate('/');
                    }} className="bg-red-600 hover:bg-red-700">
                      Yes, Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-auto">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Documents Submitted</CardTitle>
                    <Upload className="h-4 w-4 text-bank-navy" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading ? "..." : kpiData.documentsSubmitted.total}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total applications for {bankName}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
                    <Clock className="h-4 w-4 text-bank-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading ? "..." : kpiData.pendingDocuments}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Applications in review</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Queries Received</CardTitle>
                    <HelpCircle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading ? "..." : kpiData.queriesReceived}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">From advocates on applications</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed Documents</CardTitle>
                    <CheckCircle className="h-4 w-4 text-bank-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{kpiData.completedDocuments}</div>
                    <p className="text-xs text-muted-foreground mt-1">Digitally signed & closed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Notifications & Alerts</CardTitle>
                      <CardDescription>Recent updates and important notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {queryNotifications.length > 0 ? (
                          queryNotifications.map((notification, index) => (
                            <div 
                              key={index}
                              className={`p-4 rounded-lg border ${
                                notification.type === 'urgent' ? 'bg-red-50 border-red-200' :
                                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                notification.type === 'success' ? 'bg-green-50 border-green-200' :
                                'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {notification.type === 'urgent' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                                {notification.type === 'warning' && <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />}
                                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                                {notification.type === 'info' && <FileText className="h-5 w-5 text-blue-600 mt-0.5" />}
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{notification.message}</p>
                                  <p className="text-sm text-muted-foreground">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 text-center">
                            <p className="text-muted-foreground">No recent notifications</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Quick Stats</CardTitle>
                      <CardDescription>Performance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-bank-navy" />
                            <span className="text-sm text-muted-foreground">Active Cases</span>
                          </div>
                          <span className="text-xl font-bold text-foreground">24</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-bank-success" />
                            <span className="text-sm text-muted-foreground">Completion Rate</span>
                          </div>
                          <span className="text-xl font-bold text-bank-success">94%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-bank-warning" />
                            <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                          </div>
                          <span className="text-xl font-bold text-foreground">2.3 hrs</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-bank-navy" />
                            <span className="text-sm text-muted-foreground">Recovery Amount</span>
                          </div>
                          <span className="text-xl font-bold text-foreground">₹8.25L</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-muted-foreground">Open Queries</span>
                          </div>
                          <span className="text-xl font-bold text-destructive">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}