import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, User, Building, Eye } from "lucide-react";
import { DocumentViewer } from "@/components/DocumentViewer";
import { useState, useEffect } from "react";
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
  uploaded_files: any;
  opinion_files: any;
  assigned_to_username?: string;
  bank_application_no?: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    "submitted": { variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
    "assigned": { variant: "outline" as const, className: "bg-blue-100 text-blue-800" },
    "completed": { variant: "default" as const, className: "bg-green-100 text-green-800" },
    "draft": { variant: "outline" as const, className: "bg-gray-100 text-gray-800" },
    "waiting_for_approval": { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
    "in_review": { variant: "outline" as const, className: "bg-blue-100 text-blue-800" },
    "to_be_assigned": { variant: "outline" as const, className: "bg-purple-100 text-purple-800" }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["submitted"];
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {status === "submitted" ? "Submitted" : 
       status === "assigned" ? "Under review" :
       status === "completed" ? "Submitted" : 
       status === "waiting_for_approval" ? "Waiting for approval" :
       status === "in_review" ? "In review" :
       status === "to_be_assigned" ? "To be assigned" :
       status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function MySubmissions() {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
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
        .in('status', ['waiting_for_approval', 'in_review', 'assigned', 'to_be_assigned'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
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

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsViewerOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <BankEmployeeSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
                <p className="text-gray-600">Track your submitted loan applications</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Review</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === "submitted").length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === "completed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submissions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Applications</CardTitle>
                <CardDescription>
                  View all your submitted loan applications and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Advocate-application id</TableHead>
                        <TableHead>Bank application no</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Owner of the property</TableHead>
                        <TableHead>Loan Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Submitted Date</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          Loading submissions...
                        </TableCell>
                      </TableRow>
                    ) : applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No submissions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.application_id}</TableCell>
                          <TableCell>{application.bank_application_no || '-'}</TableCell>
                          <TableCell>{application.borrower_name}</TableCell>
                          <TableCell>{application.borrower_name}</TableCell>
                          <TableCell>{application.loan_type}</TableCell>
                          <TableCell className="font-semibold">₹{application.loan_amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(application.submission_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {application.uploaded_files && application.uploaded_files.length > 0 ? (
                                application.uploaded_files.map((file: any, index: number) => (
                                  <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {file.name || `Document ${index + 1}`}
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-500">No documents</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleViewDetails(application)}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <DocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        application={selectedApplication}
        onApplicationUpdate={fetchSubmissions}
      />
    </SidebarProvider>
  );
}