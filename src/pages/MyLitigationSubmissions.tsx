import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LitigationSidebar } from "@/components/LitigationSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Scale, Search, Filter, Eye, User, Building2, Calendar, RefreshCw, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";

export default function MyLitigationSubmissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [myCases, setMyCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const currentUsername = localStorage.getItem('litigationUsername') || '';

  useEffect(() => {
    fetchMyCases();

    // Set up real-time subscription
    const channel = supabase
      .channel('my-litigation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'litigation_cases',
          filter: `created_by=eq.${currentUsername}`
        },
        () => {
          fetchMyCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUsername]);

  const fetchMyCases = async () => {
    if (!currentUsername) {
      showToast.error('User not logged in');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('litigation_cases')
        .select('*')
        .eq('created_by', currentUsername)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my cases:', error);
        showToast.error('Failed to load your cases');
      } else {
        setMyCases(data || []);
      }
    } catch (error) {
      console.error('Error fetching my cases:', error);
      showToast.error('Failed to load your cases');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = myCases.filter((caseItem) => {
    const name = caseItem.category === 'bank' 
      ? caseItem.borrower_name 
      : caseItem.petitioner_name;
    
    const matchesSearch =
      caseItem.case_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.court_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || caseItem.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Pending: "bg-blue-100 text-blue-800 border-blue-200",
      Closed: "bg-slate-100 text-slate-800 border-slate-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
      "Legal Notice Sent": "bg-orange-100 text-orange-800 border-orange-200",
      "Settlement Negotiation": "bg-purple-100 text-purple-800 border-purple-200",
      Defaulted: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <Badge className={`${statusColors[status] || "bg-muted text-muted-foreground"} capitalize`}>
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsDetailsOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-100 font-kontora">
        <LitigationSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">My Submissions</h1>
              <p className="text-sm text-muted-foreground">View cases you've created</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Scale className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">My Cases</CardTitle>
                    <CardDescription>
                      {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""} created by you
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by case no, name, or court..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Legal Notice Sent">Legal Notice Sent</SelectItem>
                      <SelectItem value="Settlement Negotiation">Settlement Negotiation</SelectItem>
                      <SelectItem value="Defaulted">Defaulted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
                    <p className="text-slate-600">Loading your cases...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Case No</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead>Court</TableHead>
                          <TableHead>Case Type</TableHead>
                          <TableHead>Filing Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No cases found. Try adjusting your filters or create a new case.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCases.map((caseItem) => {
                            const name = caseItem.category === 'bank' 
                              ? caseItem.borrower_name 
                              : caseItem.petitioner_name;
                            
                            return (
                              <TableRow key={caseItem.id}>
                                <TableCell className="font-medium">{caseItem.case_no}</TableCell>
                                <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                                <TableCell>{name}</TableCell>
                                <TableCell>{caseItem.bank_name || '-'}</TableCell>
                                <TableCell>{caseItem.court_name}</TableCell>
                                <TableCell>{caseItem.case_type}</TableCell>
                                <TableCell>{format(new Date(caseItem.filing_date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(caseItem)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Case Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Litigation Case Details</DialogTitle>
            <DialogDescription>Complete information about the litigation case</DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
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
                    <p className="font-medium">{selectedCase.case_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <Badge className="capitalize">{selectedCase.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Case Type</p>
                    <p className="font-medium">{selectedCase.case_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    {getStatusBadge(selectedCase.status)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Court Name</p>
                    <p className="font-medium">{selectedCase.court_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Court District</p>
                    <p className="font-medium">{selectedCase.court_district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Filing Date</p>
                    <p className="font-medium">{format(new Date(selectedCase.filing_date), 'dd MMM yyyy')}</p>
                  </div>
                  {selectedCase.next_hearing_date && (
                    <div>
                      <p className="text-sm text-slate-600">Next Hearing Date</p>
                      <p className="font-medium">{format(new Date(selectedCase.next_hearing_date), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details (for bank category) */}
              {selectedCase.category === 'bank' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Bank Name</p>
                      <p className="font-medium">{selectedCase.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Branch Name</p>
                      <p className="font-medium">{selectedCase.branch_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Account No</p>
                      <p className="font-medium">{selectedCase.account_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Loan Amount</p>
                      <p className="font-medium text-emerald-600">₹{selectedCase.loan_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Borrower Name</p>
                      <p className="font-medium">{selectedCase.borrower_name}</p>
                    </div>
                    {selectedCase.co_borrower_name && (
                      <div>
                        <p className="text-sm text-slate-600">Co-Borrower Name</p>
                        <p className="font-medium">{selectedCase.co_borrower_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Party Details (for private category) */}
              {selectedCase.category === 'private' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Party Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Petitioner Name</p>
                      <p className="font-medium">{selectedCase.petitioner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Respondent Name</p>
                      <p className="font-medium">{selectedCase.respondent_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600">Petitioner Address</p>
                      <p className="font-medium">{selectedCase.petitioner_address}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600">Respondent Address</p>
                      <p className="font-medium">{selectedCase.respondent_address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advocate Fees */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-amber-600" />
                  Advocate Fees
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedCase.total_advocate_fees && (
                    <div>
                      <p className="text-sm text-slate-600">Total Advocate Fees</p>
                      <p className="font-medium">₹{selectedCase.total_advocate_fees.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedCase.initial_fees && (
                    <div>
                      <p className="text-sm text-slate-600">Initial Fees</p>
                      <p className="font-medium">₹{selectedCase.initial_fees.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedCase.initial_fees_received_on && (
                    <div>
                      <p className="text-sm text-slate-600">Initial Fees Received On</p>
                      <p className="font-medium">{format(new Date(selectedCase.initial_fees_received_on), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                  {selectedCase.final_fees && (
                    <div>
                      <p className="text-sm text-slate-600">Final Fees</p>
                      <p className="font-medium">₹{selectedCase.final_fees.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedCase.final_fees_received_on && (
                    <div>
                      <p className="text-sm text-slate-600">Final Fees Received On</p>
                      <p className="font-medium">{format(new Date(selectedCase.final_fees_received_on), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                  {selectedCase.judgement_date && (
                    <div>
                      <p className="text-sm text-slate-600">Date of Judgement</p>
                      <p className="font-medium">{format(new Date(selectedCase.judgement_date), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Present Status & Additional Details */}
              {(selectedCase.present_status || selectedCase.details) && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                  {selectedCase.present_status && (
                    <div className="mb-3">
                      <p className="text-sm text-slate-600 mb-1">Present Status</p>
                      <p className="font-medium">{selectedCase.present_status}</p>
                    </div>
                  )}
                  {selectedCase.details && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Details</p>
                      <p className="font-medium">{selectedCase.details}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
