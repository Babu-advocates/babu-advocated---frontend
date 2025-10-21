import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import LitigationAccessSidebar from "@/components/LitigationAccessSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Eye, RefreshCw, Building2, User, IndianRupee } from "lucide-react";
import { format } from "date-fns";
interface Application {
  id: string;
  application_id: string;
  bank_name: string;
  borrower_name: string;
  loan_type: string;
  loan_amount: number;
  status: string;
  submission_date: string;
  application_type: string;
  // Additional fields from litigation_cases
  court_name?: string;
  court_district?: string;
  filing_date?: string;
  next_hearing_date?: string;
  branch_name?: string;
  account_no?: string;
  co_borrower_name?: string;
  petitioner_name?: string;
  respondent_name?: string;
  petitioner_address?: string;
  respondent_address?: string;
  total_advocate_fees?: number;
  initial_fees?: number;
  initial_fees_received_on?: string;
  final_fees?: number;
  final_fees_received_on?: string;
  judgement_date?: string;
  present_status?: string;
  details?: string;
}
const LitigationAccessApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  useEffect(() => {
    fetchApplications();
  }, []);
  const fetchApplications = async () => {
    try {
      const username = localStorage.getItem('litigationAccessUsername');
      
      if (!username) {
        toast.error('User not logged in');
        setLoading(false);
        return;
      }

      // First, get all litigation case IDs visible to this user
      const { data: visibilityData, error: visibilityError } = await (supabase as any)
        .from('litigation_case_visibility')
        .select('litigation_case_id')
        .eq('litigation_access_username', username);

      if (visibilityError) {
        console.error('Error fetching visibility:', visibilityError);
        toast.error('Failed to load visibility settings');
        setLoading(false);
        return;
      }

      const visibleCaseIds = visibilityData?.map((v: any) => v.litigation_case_id) || [];

      if (visibleCaseIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Fetch litigation cases that are visible to this user
      const { data: casesData, error: casesError } = await supabase
        .from('litigation_cases')
        .select('*')
        .in('id', visibleCaseIds)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching cases:', casesError);
        toast.error('Failed to load cases');
      } else {
        // Transform litigation cases to match the Application interface
        const transformedData = casesData?.map(litigationCase => ({
          id: litigationCase.id,
          application_id: litigationCase.case_no,
          bank_name: litigationCase.bank_name || '',
          borrower_name: litigationCase.category === 'bank' 
            ? litigationCase.borrower_name 
            : litigationCase.petitioner_name || '',
          loan_type: litigationCase.case_type,
          loan_amount: litigationCase.loan_amount || 0,
          status: litigationCase.status || 'Active',
          submission_date: litigationCase.created_at,
          application_type: litigationCase.category,
          // Additional fields
          court_name: litigationCase.court_name,
          court_district: litigationCase.court_district,
          filing_date: litigationCase.filing_date,
          next_hearing_date: litigationCase.next_hearing_date,
          branch_name: litigationCase.branch_name,
          account_no: litigationCase.account_no,
          co_borrower_name: litigationCase.co_borrower_name,
          petitioner_name: litigationCase.petitioner_name,
          respondent_name: litigationCase.respondent_name,
          petitioner_address: litigationCase.petitioner_address,
          respondent_address: litigationCase.respondent_address,
          total_advocate_fees: litigationCase.total_advocate_fees,
          initial_fees: litigationCase.initial_fees,
          initial_fees_received_on: litigationCase.initial_fees_received_on,
          final_fees: litigationCase.final_fees,
          final_fees_received_on: litigationCase.final_fees_received_on,
          judgement_date: litigationCase.judgement_date,
          present_status: litigationCase.present_status,
          details: litigationCase.details,
        })) || [];
        
        setApplications(transformedData);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApplication(app);
    setIsDetailsOpen(true);
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dashboard">
        <LitigationAccessSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">View Applications</h1>
            <p className="text-muted-foreground mt-2">Litigation cases visible to you</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">No applications are currently visible to you.</p>
              <p className="text-sm text-muted-foreground mt-2">Contact your administrator to grant access to litigation cases.</p>
            </div>
          ) : (
            <div className="bg-card rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Borrower Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.application_id}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{app.borrower_name}</TableCell>
                      <TableCell>{app.bank_name || 'N/A'}</TableCell>
                      <TableCell>{app.loan_type}</TableCell>
                      <TableCell>₹{app.loan_amount?.toLocaleString('en-IN') || 'N/A'}</TableCell>
                      <TableCell>{new Date(app.submission_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleViewDetails(app)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Litigation Case Details</DialogTitle>
                <DialogDescription>Complete information about the litigation case</DialogDescription>
              </DialogHeader>
              
              {selectedApplication && (
                <div className="space-y-6 mt-4">
                  {/* Case Information */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2 text-emerald-600" />
                      Case Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Case No</p>
                        <p className="font-medium">{selectedApplication.application_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Category</p>
                        <Badge className="capitalize">{selectedApplication.application_type}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Case Type</p>
                        <p className="font-medium">{selectedApplication.loan_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Status</p>
                        <Badge className={getStatusColor(selectedApplication.status)}>
                          {selectedApplication.status}
                        </Badge>
                      </div>
                      {selectedApplication.court_name && (
                        <div>
                          <p className="text-sm text-slate-600">Court Name</p>
                          <p className="font-medium">{selectedApplication.court_name}</p>
                        </div>
                      )}
                      {selectedApplication.court_district && (
                        <div>
                          <p className="text-sm text-slate-600">Court District</p>
                          <p className="font-medium">{selectedApplication.court_district}</p>
                        </div>
                      )}
                      {selectedApplication.filing_date && (
                        <div>
                          <p className="text-sm text-slate-600">Filing Date</p>
                          <p className="font-medium">{format(new Date(selectedApplication.filing_date), 'dd MMM yyyy')}</p>
                        </div>
                      )}
                      {selectedApplication.next_hearing_date && (
                        <div>
                          <p className="text-sm text-slate-600">Next Hearing Date</p>
                          <p className="font-medium">{format(new Date(selectedApplication.next_hearing_date), 'dd MMM yyyy')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Details (for bank category) */}
                  {selectedApplication.application_type === 'bank' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                        Bank Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Bank Name</p>
                          <p className="font-medium">{selectedApplication.bank_name || 'N/A'}</p>
                        </div>
                        {selectedApplication.branch_name && (
                          <div>
                            <p className="text-sm text-slate-600">Branch Name</p>
                            <p className="font-medium">{selectedApplication.branch_name}</p>
                          </div>
                        )}
                        {selectedApplication.account_no && (
                          <div>
                            <p className="text-sm text-slate-600">Account No</p>
                            <p className="font-medium">{selectedApplication.account_no}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-slate-600">Loan Amount</p>
                          <p className="font-medium text-emerald-600">
                            ₹{selectedApplication.loan_amount?.toLocaleString('en-IN') || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Borrower Name</p>
                          <p className="font-medium">{selectedApplication.borrower_name}</p>
                        </div>
                        {selectedApplication.co_borrower_name && (
                          <div>
                            <p className="text-sm text-slate-600">Co-Borrower Name</p>
                            <p className="font-medium">{selectedApplication.co_borrower_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Party Details (for private category) */}
                  {selectedApplication.application_type === 'private' && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2 text-purple-600" />
                        Party Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedApplication.petitioner_name && (
                          <div>
                            <p className="text-sm text-slate-600">Petitioner Name</p>
                            <p className="font-medium">{selectedApplication.petitioner_name}</p>
                          </div>
                        )}
                        {selectedApplication.respondent_name && (
                          <div>
                            <p className="text-sm text-slate-600">Respondent Name</p>
                            <p className="font-medium">{selectedApplication.respondent_name}</p>
                          </div>
                        )}
                        {selectedApplication.petitioner_address && (
                          <div className="col-span-2">
                            <p className="text-sm text-slate-600">Petitioner Address</p>
                            <p className="font-medium">{selectedApplication.petitioner_address}</p>
                          </div>
                        )}
                        {selectedApplication.respondent_address && (
                          <div className="col-span-2">
                            <p className="text-sm text-slate-600">Respondent Address</p>
                            <p className="font-medium">{selectedApplication.respondent_address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Advocate Fees */}
                  {(selectedApplication.total_advocate_fees || selectedApplication.initial_fees || selectedApplication.final_fees) && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <IndianRupee className="h-5 w-5 mr-2 text-amber-600" />
                        Advocate Fees
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedApplication.total_advocate_fees && (
                          <div>
                            <p className="text-sm text-slate-600">Total Advocate Fees</p>
                            <p className="font-medium">₹{selectedApplication.total_advocate_fees.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {selectedApplication.initial_fees && (
                          <div>
                            <p className="text-sm text-slate-600">Initial Fees</p>
                            <p className="font-medium">₹{selectedApplication.initial_fees.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {selectedApplication.initial_fees_received_on && (
                          <div>
                            <p className="text-sm text-slate-600">Initial Fees Received On</p>
                            <p className="font-medium">{format(new Date(selectedApplication.initial_fees_received_on), 'dd MMM yyyy')}</p>
                          </div>
                        )}
                        {selectedApplication.final_fees && (
                          <div>
                            <p className="text-sm text-slate-600">Final Fees</p>
                            <p className="font-medium">₹{selectedApplication.final_fees.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {selectedApplication.final_fees_received_on && (
                          <div>
                            <p className="text-sm text-slate-600">Final Fees Received On</p>
                            <p className="font-medium">{format(new Date(selectedApplication.final_fees_received_on), 'dd MMM yyyy')}</p>
                          </div>
                        )}
                        {selectedApplication.judgement_date && (
                          <div>
                            <p className="text-sm text-slate-600">Date of Judgement</p>
                            <p className="font-medium">{format(new Date(selectedApplication.judgement_date), 'dd MMM yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Present Status & Additional Details */}
                  {(selectedApplication.present_status || selectedApplication.details) && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                      {selectedApplication.present_status && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-600 mb-1">Present Status</p>
                          <p className="font-medium">{selectedApplication.present_status}</p>
                        </div>
                      )}
                      {selectedApplication.details && (
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Details</p>
                          <p className="font-medium">{selectedApplication.details}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>;
};
export default LitigationAccessApplications;