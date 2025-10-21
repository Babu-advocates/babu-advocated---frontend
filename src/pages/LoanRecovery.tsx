import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Search, Filter, Building2, User, Calendar, RefreshCw, IndianRupee, Eye, ChevronDown, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";
const LoanRecovery = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [litigationCases, setLitigationCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [litigationAccessAccounts, setLitigationAccessAccounts] = useState<any[]>([]);
  const [visibleToAccounts, setVisibleToAccounts] = useState<string[]>([]);

  useEffect(() => {
    fetchLitigationCases();
    fetchLitigationAccessAccounts();

    // Set up real-time subscription
    const channel = supabase
      .channel('litigation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'litigation_cases'
        },
        () => {
          fetchLitigationCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLitigationCases = async () => {
    try {
      const { data, error } = await supabase
        .from('litigation_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching litigation cases:', error);
        showToast.error('Failed to load litigation cases');
      } else {
        setLitigationCases(data || []);
      }
    } catch (error) {
      console.error('Error fetching litigation cases:', error);
      showToast.error('Failed to load litigation cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchLitigationAccessAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('litigation_access_accounts')
        .select('username')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching litigation access accounts:', error);
      } else {
        setLitigationAccessAccounts(data || []);
      }
    } catch (error) {
      console.error('Error fetching litigation access accounts:', error);
    }
  };

  const banks = Array.from(new Set(
    litigationCases
      .filter(c => c.bank_name)
      .map(c => c.bank_name)
  ));
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Legal Notice Sent":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Settlement Negotiation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Defaulted":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  const filteredApplications = litigationCases.filter(litigationCase => {
    const name = litigationCase.category === 'bank' 
      ? litigationCase.borrower_name 
      : litigationCase.petitioner_name;
    const bank = litigationCase.bank_name || '';
    
    const matchesSearch = 
      name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      litigationCase.case_no?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      litigationCase.case_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleExportToExcel = () => {
    // Prepare data for Excel export
    const exportData = litigationCases.map((litigationCase) => {
      const name = litigationCase.category === 'bank' 
        ? litigationCase.borrower_name 
        : litigationCase.petitioner_name;
      
      return {
        "Case No": litigationCase.case_no,
        "Status": litigationCase.status,
        "Name": name,
        "Bank": litigationCase.bank_name || '-',
        "Court": litigationCase.court_name,
        "Court District": litigationCase.court_district,
        "Case Type": litigationCase.case_type,
        "Category": litigationCase.category,
        "Filing Date": litigationCase.filing_date ? new Date(litigationCase.filing_date).toLocaleDateString() : '-',
        "Next Hearing Date": litigationCase.next_hearing_date ? new Date(litigationCase.next_hearing_date).toLocaleDateString() : '-',
        "Loan Amount": litigationCase.loan_amount || '-',
        "Created At": litigationCase.created_at ? new Date(litigationCase.created_at).toLocaleDateString() : '-',
      };
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Litigation Cases");

    // Generate Excel file
    XLSX.writeFile(workbook, `Litigation_Cases_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleViewDetails = async (litigationCase: any) => {
    setSelectedCase(litigationCase);
    // Fetch existing visibility settings for this case
    try {
      const { data, error } = await (supabase as any)
        .from('litigation_case_visibility')
        .select('litigation_access_username')
        .eq('litigation_case_id', litigationCase.id);
      
      if (error) {
        console.error('Error fetching visibility:', error);
        setVisibleToAccounts([]);
      } else {
        const usernames = data?.map((v: any) => v.litigation_access_username) || [];
        setVisibleToAccounts(usernames);
      }
    } catch (error) {
      console.error('Error fetching visibility:', error);
      setVisibleToAccounts([]);
    }
    setIsDetailsOpen(true);
  };

  const toggleAccountVisibility = async (username: string) => {
    if (!selectedCase) return;

    const isCurrentlyVisible = visibleToAccounts.includes(username);
    
    try {
      if (isCurrentlyVisible) {
        // Remove visibility
        const { error } = await (supabase as any)
          .from('litigation_case_visibility')
          .delete()
          .eq('litigation_case_id', selectedCase.id)
          .eq('litigation_access_username', username);
        
        if (error) {
          console.error('Error removing visibility:', error);
          showToast.error('Failed to update visibility');
          return;
        }
        
        setVisibleToAccounts(prev => prev.filter(u => u !== username));
        showToast.success(`Removed visibility for ${username}`);
      } else {
        // Add visibility
        const { error } = await (supabase as any)
          .from('litigation_case_visibility')
          .insert({
            litigation_case_id: selectedCase.id,
            litigation_access_username: username
          });
        
        if (error) {
          console.error('Error adding visibility:', error);
          showToast.error('Failed to update visibility');
          return;
        }
        
        setVisibleToAccounts(prev => [...prev, username]);
        showToast.success(`Added visibility for ${username}`);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showToast.error('Failed to update visibility');
    }
  };

  const handleNoVisible = async () => {
    if (!selectedCase) return;
    
    try {
      // Remove all visibility entries for this case
      const { error } = await (supabase as any)
        .from('litigation_case_visibility')
        .delete()
        .eq('litigation_case_id', selectedCase.id);
      
      if (error) {
        console.error('Error clearing visibility:', error);
        showToast.error('Failed to clear visibility');
        return;
      }
      
      setVisibleToAccounts([]);
      showToast.success('Cleared all visibility settings');
    } catch (error) {
      console.error('Error clearing visibility:', error);
      showToast.error('Failed to clear visibility');
    }
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">Litigation Applications</h1>
                      <p className="text-sm text-slate-600">Manage Litigation cases</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleExportToExcel}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              {/* Filters Section */}
              <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 p-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Filter by case number, name, or case type..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-10 bg-white/50 border-slate-200 focus:border-blue-300 focus:ring-blue-200" 
                  />
                </div>
              </div>

              {/* Litigation Applications Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 overflow-hidden">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
                    <p className="text-slate-600">Loading litigation cases...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-green-50 hover:from-slate-50 hover:to-green-50">
                        <TableHead className="font-semibold text-slate-700">Case No</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Name</TableHead>
                        <TableHead className="font-semibold text-slate-700">Bank</TableHead>
                        <TableHead className="font-semibold text-slate-700">Court</TableHead>
                        <TableHead className="font-semibold text-slate-700">Case Type</TableHead>
                        <TableHead className="font-semibold text-slate-700">Filing Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map(litigationCase => {
                        const name = litigationCase.category === 'bank' 
                          ? litigationCase.borrower_name 
                          : litigationCase.petitioner_name;
                        
                        return (
                          <TableRow key={litigationCase.id} className="hover:bg-green-50/50 transition-colors duration-200">
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <RefreshCw className="h-4 w-4 text-emerald-600" />
                                <span className="text-slate-800">{litigationCase.case_no}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(litigationCase.status)} font-medium`}>
                                {litigationCase.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-700">{name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-700">{litigationCase.bank_name || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700">{litigationCase.court_name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700">{litigationCase.case_type}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {format(new Date(litigationCase.filing_date), 'yyyy-MM-dd')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                className="bg-[#334155] hover:bg-[#475569] text-white" 
                                size="sm"
                                onClick={() => handleViewDetails(litigationCase)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* No Results */}
              {!loading && filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <RefreshCw className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No litigation cases found</h3>
                  <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Case Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">Litigation Case Details</DialogTitle>
                <DialogDescription>Complete information about the litigation case</DialogDescription>
              </div>
            </div>
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Visible to
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white z-50">
                  <DropdownMenuItem onClick={handleNoVisible} className="cursor-pointer hover:bg-slate-100">
                    <span className="text-red-600 font-medium">No Visible</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {litigationAccessAccounts.map((account) => (
                    <DropdownMenuCheckboxItem
                      key={account.username}
                      checked={visibleToAccounts.includes(account.username)}
                      onCheckedChange={() => toggleAccountVisibility(account.username)}
                      className="cursor-pointer"
                    >
                      {account.username}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    <Badge className={getStatusColor(selectedCase.status)}>{selectedCase.status}</Badge>
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
    </SidebarProvider>;
};
export default LoanRecovery;