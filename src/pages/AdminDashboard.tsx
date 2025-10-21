import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Scale, FileText, LogOut, Gavel, Download, DollarSign, Building2, UserCheck, Search, Clock, Eye, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { DocumentViewer } from "@/components/DocumentViewer";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { showToast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState("all");
  const [bankSearch, setBankSearch] = useState("");
  const [activeMenuTab, setActiveMenuTab] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankCounters, setBankCounters] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchBankAccounts();
    fetchBankCounters();

    // Set up real-time subscription for application status changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Update the applications state with the new data
          setApplications(prevApps => 
            prevApps.map(app => 
              app.id === payload.new.id 
                ? { ...app, ...payload.new }
                : app
            )
          );

          // Show toast notification for status changes
          if (payload.old.status !== payload.new.status) {
            showToast.success(
              `Application ${payload.new.application_id} status updated to ${payload.new.status}`
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        showToast.error('Failed to load applications');
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast.error('Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('username, bank_name, is_active')
        .eq('is_active', true)
        .order('username', { ascending: true });

      if (error) {
        console.error('Error fetching bank accounts:', error);
        showToast.error('Failed to load bank accounts');
      } else {
        setBankAccounts(data || []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      showToast.error('Failed to load bank accounts');
    }
  };

  const fetchBankCounters = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_application_counters')
        .select('*')
        .order('bank_name', { ascending: true });

      if (error) {
        console.error('Error fetching bank counters:', error);
        showToast.error('Failed to load bank counters');
      } else {
        setBankCounters(data || []);
      }
    } catch (error) {
      console.error('Error fetching bank counters:', error);
      showToast.error('Failed to load bank counters');
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application status:', error);
        showToast.error('Failed to update application status');
      } else {
        showToast.success(`Application ${newStatus} successfully`);
        fetchApplications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      showToast.error('Failed to update application status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    showToast.success("Successfully logged out!");
    navigate('/advocate-login');
  };

  const handleDownloadDocument = (application: any) => {
    // Mock download functionality - in real app, this would download the actual document
    showToast.success(`Downloading document for ${application.application_id}`);
  };

  const handleViewDocument = (application: any) => {
    setSelectedApplication(application);
    setIsDocumentViewerOpen(true);
  };

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.bank_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    // Filter by bank account username - find the matching bank account and check if bank names match
    const matchesBank = bankFilter === "all" || (() => {
      const selectedBankAccount = bankAccounts.find(account => account.username === bankFilter);
      return selectedBankAccount && app.bank_name.toLowerCase().includes(selectedBankAccount.bank_name.toLowerCase());
    })();
    
    return matchesSearch && matchesStatus && matchesBank;
  });

  // Create dynamic banks list from bank_accounts
  const banks = [
    { id: "all", name: "All Banks" },
    ...bankAccounts.map(account => ({
      id: account.username,
      name: account.bank_name
    }))
  ];

  // Calculate dynamic bank-wise data
  const getBankWiseData = (bankId: string) => {
    if (bankId === "all") {
      const totalCases = applications.length;
      const totalDocuments = bankCounters.reduce((total, counter) => total + counter.last_sequence, 0);
      return {
        amount: 1640000, // Mock revenue - can be calculated based on cases
        cases: totalCases,
        documents: totalDocuments
      };
    }

    // Find matching bank account
    const bankAccount = bankAccounts.find(account => account.username === bankId);
    if (!bankAccount) {
      return { amount: 0, cases: 0, documents: 0 };
    }

    // Filter applications by bank name
    const bankApplications = applications.filter(app => 
      app.bank_name.toLowerCase().includes(bankAccount.bank_name.toLowerCase())
    );

    // Find counter for this bank
    const bankCounter = bankCounters.find(counter => 
      counter.bank_name.toLowerCase().includes(bankAccount.bank_name.toLowerCase())
    );

    return {
      amount: bankApplications.length * 10000, // Mock revenue calculation
      cases: bankApplications.length,
      documents: bankCounter?.last_sequence || 0
    };
  };

  // Calculate monthly bank cases from actual applications data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthApplications = applications.filter(app => {
    const appDate = new Date(app.created_at);
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
  });
  
  const monthlyBankCases = thisMonthApplications
    .reduce((acc, app) => {
      const bankName = app.bank_name;
      acc[bankName] = (acc[bankName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Get top 5 banks by monthly cases
  const topBanks = Object.entries(monthlyBankCases)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([bankName, cases]) => ({
      id: bankName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: bankName,
      cases: cases as number
    }));

  // Filter banks based on search
  const filteredBanks = Object.entries(monthlyBankCases)
    .filter(([bankName]) => 
      bankName.toLowerCase().includes(bankSearch.toLowerCase())
    )
    .map(([bankName, cases]) => ({
      id: bankName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: bankName,
      cases: cases as number
    }))
    .sort((a, b) => b.cases - a.cases);

  // Get current selected bank data
  const selectedBankData = getBankWiseData(selectedBank);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover-scale transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200">
                      <Scale className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <div className="transition-transform duration-200 group-hover:translate-x-1">
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-600">Babu Advocates</h1>
                      <p className="text-sm text-slate-600 transition-colors duration-200 group-hover:text-blue-600">Admin Dashboard</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => navigate('/attendance')}
                    variant="ghost" 
                    className="text-slate-600 hover-scale transition-all duration-200 hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 group" 
                    title="Employee Attendance"
                  >
                    <UserCheck className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden sm:inline">Attendance</span>
                  </Button>
                  <NotificationDropdown />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2 transition-transform duration-200" />
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

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              {/* Welcome Section */}
              <div className="mb-8 animate-fade-in">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 transition-all duration-300 hover:from-purple-600 hover:via-pink-500 hover:to-orange-500 cursor-pointer">Welcome back, Admin!</h2>
                <p className="text-slate-600 transition-colors duration-200 hover:text-blue-600 cursor-pointer">Here's what's happening in your law firm today.</p>
              </div>

              {/* Dashboard Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Cases */}
                <Card className="bg-gradient-to-br from-white/95 to-blue-50/50 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 group cursor-pointer hover-scale animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gavel className="h-6 w-6 text-blue-600 transition-all duration-300 group-hover:text-purple-600 group-hover:rotate-12 group-hover:scale-110" />
                      <h3 className="font-semibold text-slate-700 transition-colors duration-200 group-hover:text-blue-600">Total Cases</h3>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600 group-hover:scale-105 transform">
                      {applications.length}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 transition-colors duration-200 group-hover:text-blue-500">Across all banks</p>
                  </CardContent>
                </Card>

                {/* Total Sales */}
                <Card className="bg-gradient-to-br from-white/95 to-emerald-50/30 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 group cursor-pointer hover-scale animate-fade-in" style={{animationDelay: '100ms'}}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-6 w-6 text-emerald-600 transition-all duration-300 group-hover:text-green-600 group-hover:scale-110 group-hover:rotate-12" />
                      <h3 className="font-semibold text-slate-700 transition-colors duration-200 group-hover:text-emerald-600">Total Sales</h3>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-green-600 group-hover:to-emerald-600 group-hover:scale-105 transform">
                      ₹{getBankWiseData("all").amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 transition-colors duration-200 group-hover:text-emerald-500">From all banks</p>
                  </CardContent>
                </Card>

                {/* Monthly Cases */}
                <Card className="bg-gradient-to-br from-white/95 to-orange-50/30 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-300 group cursor-pointer hover-scale animate-fade-in" style={{animationDelay: '200ms'}}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-6 w-6 text-orange-600 transition-all duration-300 group-hover:text-amber-600 group-hover:scale-110 group-hover:rotate-6" />
                      <h3 className="font-semibold text-slate-700 transition-colors duration-200 group-hover:text-orange-600">This Month</h3>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-amber-600 group-hover:to-orange-600 group-hover:scale-105 transform">
                      {thisMonthApplications.length}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 transition-colors duration-200 group-hover:text-orange-500">New cases</p>
                  </CardContent>
                </Card>

                {/* Total Documents */}
                <Card className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300 group cursor-pointer hover-scale animate-fade-in" style={{animationDelay: '300ms'}}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Download className="h-6 w-6 text-purple-600 transition-all duration-300 group-hover:text-pink-600 group-hover:rotate-12 group-hover:scale-110" />
                      <h3 className="font-semibold text-slate-700 transition-colors duration-200 group-hover:text-purple-600">Documents</h3>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-pink-600 group-hover:to-purple-600 group-hover:scale-105 transform">
                      {bankCounters.reduce((total, counter) => total + counter.last_sequence, 0)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 transition-colors duration-200 group-hover:text-purple-500">Total processed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Bank-wise Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{animationDelay: '400ms'}}>
                {/* Bank Selection & Sales */}
                <Card className="bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 group">
                      <Building2 className="h-5 w-5 text-blue-600 transition-all duration-300 group-hover:text-indigo-600 group-hover:scale-110 group-hover:rotate-6" />
                      <span className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-600">Bank-wise Sales</span>
                    </CardTitle>
                    <CardDescription className="text-slate-600 transition-colors duration-200 group-hover:text-blue-600">Select a bank to view detailed metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger className="w-full hover:border-blue-400 hover:shadow-md transition-all duration-200 group">
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border border-blue-100">
                        {banks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 space-y-3 group">
                      <div className="flex items-center justify-between p-2 rounded hover:bg-white/50 transition-all duration-200">
                        <span className="text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-700">Revenue</span>
                        <span className="text-lg font-bold text-emerald-600 transition-all duration-200 group-hover:scale-105 transform">
                          ₹{selectedBankData.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-white/50 transition-all duration-200">
                        <span className="text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-700">Cases</span>
                        <span className="text-lg font-bold text-blue-600 transition-all duration-200 group-hover:scale-105 transform">
                          {selectedBankData.cases}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-white/50 transition-all duration-200">
                        <span className="text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-700">Documents</span>
                        <span className="text-lg font-bold text-purple-600 transition-all duration-200 group-hover:scale-105 transform">
                          {selectedBankData.documents}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Bank-wise Cases */}
                <Card className="bg-gradient-to-br from-white/95 to-emerald-50/30 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 group">
                      <Gavel className="h-5 w-5 text-emerald-600 transition-all duration-300 group-hover:text-green-600 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-emerald-600 group-hover:to-green-600">Monthly Cases by Bank</span>
                    </CardTitle>
                    <CardDescription className="text-slate-600 transition-colors duration-200 group-hover:text-emerald-600">Top 5 banks with search for others</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search Input */}
                    <div className="relative group">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 transition-colors duration-200 group-hover:text-emerald-500" />
                      <Input
                        placeholder="Search banks..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 focus:shadow-md focus:shadow-emerald-100"
                      />
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {bankSearch ? (
                        // Show filtered search results
                        filteredBanks.length > 0 ? (
                          filteredBanks.map((bank, index) => (
                            <div 
                              key={bank.id} 
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform group cursor-pointer"
                              style={{animationDelay: `${index * 50}ms`}}
                            >
                              <span className="text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-blue-700">{bank.name}</span>
                              <Badge variant="secondary" className="bg-blue-600 text-white transition-all duration-200 group-hover:bg-blue-700 group-hover:scale-110 transform">{bank.cases.toString()}</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-slate-500 animate-fade-in">No banks found matching your search.</div>
                        )
                      ) : (
                        // Show top 5 banks by default
                        topBanks.map((bank, index) => (
                          <div 
                            key={bank.id} 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform group cursor-pointer animate-fade-in"
                            style={{animationDelay: `${index * 100}ms`}}
                          >
                            <span className="text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-blue-700">{bank.name}</span>
                            <Badge variant="secondary" className="bg-blue-600 text-white transition-all duration-200 group-hover:bg-blue-700 group-hover:scale-110 transform">{bank.cases.toString()}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {!bankSearch && (
                      <div className="text-center pt-2 animate-fade-in" style={{animationDelay: '500ms'}}>
                        <p className="text-xs text-slate-500 transition-colors duration-200 hover:text-emerald-600 cursor-default">Showing top 5 banks. Use search to find others.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </main>
        </div>

        {/* Document Viewer Modal */}
        {isDocumentViewerOpen && selectedApplication && (
          <DocumentViewer 
            application={selectedApplication}
            isOpen={isDocumentViewerOpen}
            onClose={() => {
              setIsDocumentViewerOpen(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;