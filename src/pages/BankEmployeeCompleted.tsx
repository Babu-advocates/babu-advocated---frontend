import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, CheckCircle, Download, Filter, DollarSign, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { ApplicationDetailsModal } from "@/components/ApplicationDetailsModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  application_id: string;
  bank_name: string;
  borrower_name: string;
  application_type: string;
  loan_type: string;
  loan_amount: number;
  submission_date: string;
  status: string;
  submitted_by: string;
  created_at: string;
}

const BankEmployeeCompleted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCompletedApplications();
  }, []);

  const fetchCompletedApplications = async () => {
    try {
      setLoading(true);
      
      // Get the current bank user from localStorage
      const currentBank = localStorage.getItem("bankUsername");
      
      if (!currentBank) {
        toast({
          title: "Error",
          description: "Bank authentication required",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('submitted_by', currentBank)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch completed applications",
          variant: "destructive",
        });
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on search and filters
  const filteredDocuments = applications.filter(app => {
    const matchesSearch = searchTerm === "" || 
      app.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.bank_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "submitted":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Submitted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Application Number", "Application Type", "Applicant Name", "Amount", "Submitted Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredDocuments.map(app => [
        app.application_id,
        app.application_type,
        app.borrower_name,
        app.loan_amount,
        new Date(app.submission_date).toLocaleDateString(),
        app.status
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `completed_documents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAmount = filteredDocuments
    .reduce((sum, app) => sum + Number(app.loan_amount), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bank-light">
        <BankEmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex justify-between items-center flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Completed Documents</h1>
                  <p className="text-sm text-muted-foreground">All approved applications with payment status</p>
                </div>
              </div>
              
              <Button 
                onClick={handleDownload}
                className="bg-bank-success hover:bg-bank-success/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-6 w-6 text-bank-success" />
                      <h3 className="font-semibold text-muted-foreground">Total Approved</h3>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{filteredDocuments.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Applications approved</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                      <h3 className="font-semibold text-muted-foreground">Payment Received</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total amount paid</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileCheck className="h-6 w-6 text-bank-navy" />
                      <h3 className="font-semibold text-muted-foreground">Payment Rate</h3>
                    </div>
                    <p className="text-2xl font-bold text-bank-navy">
                      {filteredDocuments.length > 0 ? Math.round((filteredDocuments.length / filteredDocuments.length) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Successful payments</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6 border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-bank-navy" />
                    <span>Filter Documents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by applicant, type, case ID, or advocate..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Table */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Completed Applications</CardTitle>
                  <CardDescription>
                    All approved applications with their payment status and details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application Number</TableHead>
                          <TableHead>Application Type</TableHead>
                          <TableHead>Applicant Name</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Completed Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                       <TableBody>
                         {loading ? (
                           <TableRow>
                             <TableCell colSpan={7} className="text-center py-8">
                               Loading applications...
                             </TableCell>
                           </TableRow>
                         ) : filteredDocuments.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                               No completed applications found
                             </TableCell>
                           </TableRow>
                         ) : (
                            filteredDocuments.map((app) => (
                              <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium text-bank-navy">{app.application_id}</TableCell>
                                <TableCell>{app.application_type}</TableCell>
                                <TableCell>{app.borrower_name}</TableCell>
                                <TableCell className="font-semibold">₹{Number(app.loan_amount).toLocaleString()}</TableCell>
                                <TableCell>{new Date(app.submission_date).toLocaleDateString()}</TableCell>
                                <TableCell>{getStatusBadge(app.status)}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDetails(app.application_id)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                       </TableBody>
                    </Table>
                  </div>
                  
                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No completed documents found matching your criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        {/* Application Details Modal */}
        {selectedApplicationId && (
          <ApplicationDetailsModal
            applicationId={selectedApplicationId}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedApplicationId(null);
            }}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default BankEmployeeCompleted;