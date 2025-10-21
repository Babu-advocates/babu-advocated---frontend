import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BankManagerSidebar } from "@/components/BankManagerSidebar";
import { showToast } from "@/lib/toast";
import { 
  FileText, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  LogOut,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BankManagerDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("documents");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bankManagerLogin");
    showToast.success("Successfully logged out!");
    navigate("/bank-login");
  };

  // Document Analytics Data
  const documentAnalytics = {
    totalDocuments: {
      month: 284,
      quarter: 892,
      overall: 3547
    },
    pendingOpinions: 47,
    completedOpinions: 237,
    averageTurnaround: 4.8,
    delayedCases: 12
  };

  // Chart Data
  const documentTypeData = [
    { name: 'Loan Legal Opinion', value: 142, color: '#1e40af' },
    { name: 'Loan Recovery', value: 89, color: '#dc2626' }
  ];

  const statusTrendData = [
    { month: 'Jan', pending: 45, completed: 89 },
    { month: 'Feb', pending: 52, completed: 95 },
    { month: 'Mar', pending: 38, completed: 112 },
    { month: 'Apr', pending: 47, completed: 98 },
    { month: 'May', pending: 41, completed: 118 },
    { month: 'Jun', pending: 47, completed: 105 }
  ];

  const delayedCasesData = [
    { 
      caseId: "LC001234", 
      documentType: "Loan Legal Opinion", 
      submissionDate: "2024-01-05", 
      daysDelayed: 18,
      advocate: "Sharma & Associates"
    },
    { 
      caseId: "RV001156", 
      documentType: "Loan Recovery", 
      submissionDate: "2024-01-08", 
      daysDelayed: 15,
      advocate: "Legal Solutions LLP"
    },
    { 
      caseId: "LC001267", 
      documentType: "Loan Legal Opinion", 
      submissionDate: "2024-01-15", 
      daysDelayed: 8,
      advocate: "Metro Legal Services"
    }
  ];

  const getDelayColor = (days: number) => {
    if (days >= 15) return "text-red-600 bg-red-50";
    if (days >= 10) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const COLORS = ['#1e40af', '#dc2626', '#16a34a'];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <BankManagerSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Bank Manager
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="overall">Overall</SelectItem>
                </SelectContent>
              </Select>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    <LogOut className="h-4 w-4" />
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
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Yes, Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="documents"></TabsTrigger>
            <TabsTrigger value="advocates"></TabsTrigger>
            <TabsTrigger value="recovery"></TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
                  <FileText className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {documentAnalytics.totalDocuments[selectedPeriod as keyof typeof documentAnalytics.totalDocuments]}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-medium">+8.2%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Legal Opinions</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-yellow-600">{documentAnalytics.pendingOpinions}</span>
                    <span className="text-sm text-gray-400">/</span>
                    <span className="text-2xl font-bold text-green-600">{documentAnalytics.completedOpinions}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pending / Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Turnaround</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{documentAnalytics.averageTurnaround}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    days <span className="text-green-600 font-medium">-0.3 improved</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Delayed Cases</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{documentAnalytics.delayedCases}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-red-600 font-medium">+2</span> from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Documents by Type
                  </CardTitle>
                  <CardDescription>Distribution of document types submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={documentTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {documentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Document Status Trend
                  </CardTitle>
                  <CardDescription>Pending vs Completed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#16a34a" name="Completed" />
                      <Bar dataKey="pending" fill="#dc2626" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Delayed Cases Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Top Delayed Cases
                </CardTitle>
                <CardDescription>Cases requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Case ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Document Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Submission Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Days Delayed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delayedCasesData.map((caseItem) => (
                        <tr key={caseItem.caseId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-blue-600">{caseItem.caseId}</td>
                          <td className="py-3 px-4 text-gray-700">{caseItem.documentType}</td>
                          <td className="py-3 px-4 text-gray-600">{caseItem.submissionDate}</td>
                          <td className="py-3 px-4">
                            <Badge className={getDelayColor(caseItem.daysDelayed)}>
                              {caseItem.daysDelayed} days
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advocates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advocate Performance Analytics</CardTitle>
                <CardDescription>Coming soon - Comprehensive advocate performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Advocate performance dashboard in development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Recovery Analytics</CardTitle>
                <CardDescription>Coming soon - Detailed loan recovery insights</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Loan recovery analytics dashboard in development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BankManagerDashboard;