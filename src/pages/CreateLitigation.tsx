import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LitigationSidebar } from "@/components/LitigationSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { Scale, Save, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDistrictNames } from "@/data/tamilnaduData";

interface LitigationAccessAccount {
  id: string;
  username: string;
}

export default function CreateLitigation() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("");
  const [litigationAccessAccounts, setLitigationAccessAccounts] = useState<LitigationAccessAccount[]>([]);
  const [selectedAccessAccounts, setSelectedAccessAccounts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    bankName: "",
    branchName: "",
    accountNo: "",
    borrowerName: "",
    coBorrowerName: "",
    loanAmount: "",
    petitionerName: "",
    petitionerAddress: "",
    respondentName: "",
    respondentAddress: "",
    caseType: "",
    courtName: "",
    courtDistrict: "",
    caseNo: "",
    filingDate: "",
    nextHearingDate: "",
    presentStatus: "",
    totalAdvocateFees: "",
    initialFees: "",
    initialFeesReceivedOn: "",
    finalFees: "",
    finalFeesReceivedOn: "",
    judgementDate: "",
    details: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch litigation access accounts
  useEffect(() => {
    fetchLitigationAccessAccounts();
  }, []);

  const fetchLitigationAccessAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('litigation_access_accounts')
        .select('id, username')
        .eq('is_active', true)
        .order('username');

      if (error) {
        console.error('Error fetching litigation access accounts:', error);
        return;
      }

      setLitigationAccessAccounts(data || []);
    } catch (error) {
      console.error('Error fetching litigation access accounts:', error);
    }
  };

  const toggleAccessAccount = (accountId: string) => {
    setSelectedAccessAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Reset form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        bankName: "",
        branchName: "",
        accountNo: "",
        borrowerName: "",
        coBorrowerName: "",
        loanAmount: "",
        petitionerName: "",
        petitionerAddress: "",
        respondentName: "",
        respondentAddress: "",
        caseType: "",
        courtName: "",
        courtDistrict: "",
        caseNo: "",
        filingDate: "",
        nextHearingDate: "",
        presentStatus: "",
        totalAdvocateFees: "",
        initialFees: "",
        initialFeesReceivedOn: "",
        finalFees: "",
        finalFeesReceivedOn: "",
        judgementDate: "",
        details: ""
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      showToast.error("Please select a category");
      return;
    }

    // Validate required fields
    const requiredFields = category === "bank" 
      ? ['bankName', 'branchName', 'accountNo', 'borrowerName', 'loanAmount', 'caseType', 'courtName', 'courtDistrict', 'caseNo', 'filingDate']
      : ['petitionerName', 'petitionerAddress', 'respondentName', 'respondentAddress', 'caseType', 'courtName', 'courtDistrict', 'caseNo', 'filingDate'];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        showToast.error(`Please fill in all required fields`);
        return;
      }
    }

    try {
      // Save to database
      const { data: caseData, error } = await supabase
        .from('litigation_cases')
        .insert({
          category: category,
          // Bank fields
          bank_name: category === 'bank' ? formData.bankName : null,
          branch_name: category === 'bank' ? formData.branchName : null,
          account_no: category === 'bank' ? formData.accountNo : null,
          borrower_name: category === 'bank' ? formData.borrowerName : null,
          co_borrower_name: category === 'bank' ? formData.coBorrowerName : null,
          loan_amount: category === 'bank' && formData.loanAmount ? parseFloat(formData.loanAmount) : null,
          // Private fields
          petitioner_name: category === 'private' ? formData.petitionerName : null,
          petitioner_address: category === 'private' ? formData.petitionerAddress : null,
          respondent_name: category === 'private' ? formData.respondentName : null,
          respondent_address: category === 'private' ? formData.respondentAddress : null,
          // Common fields
          case_type: formData.caseType,
          court_name: formData.courtName,
          court_district: formData.courtDistrict,
          case_no: formData.caseNo,
          filing_date: formData.filingDate,
          next_hearing_date: formData.nextHearingDate || null,
          present_status: formData.presentStatus || null,
          // Fees
          total_advocate_fees: formData.totalAdvocateFees ? parseFloat(formData.totalAdvocateFees) : null,
          initial_fees: formData.initialFees ? parseFloat(formData.initialFees) : null,
          initial_fees_received_on: formData.initialFeesReceivedOn || null,
          final_fees: formData.finalFees ? parseFloat(formData.finalFees) : null,
          final_fees_received_on: formData.finalFeesReceivedOn || null,
          judgement_date: formData.judgementDate || null,
          details: formData.details || null,
          status: 'Active',
          created_by: localStorage.getItem('litigationUsername') || 'unknown'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating litigation case:', error);
        showToast.error("Failed to create litigation case");
        return;
      }

      // Create visibility records for selected litigation access accounts
      if (selectedAccessAccounts.length > 0 && caseData) {
        const visibilityRecords = selectedAccessAccounts.map(username => ({
          litigation_case_id: caseData.id,
          litigation_access_username: litigationAccessAccounts.find(acc => acc.id === username)?.username || ''
        }));

        const { error: visibilityError } = await (supabase as any)
          .from('litigation_case_visibility')
          .insert(visibilityRecords);

        if (visibilityError) {
          console.error('Error creating visibility records:', visibilityError);
          showToast.error("Case created but failed to set visibility");
          return;
        }
      }

      showToast.success("Litigation case created successfully!");
      navigate('/litigation-dashboard');
    } catch (error) {
      console.error('Error creating litigation case:', error);
      showToast.error("Failed to create litigation case");
    }
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
              <h1 className="text-xl font-semibold text-foreground">Create Litigation Case</h1>
              <p className="text-sm text-muted-foreground">Register a new litigation case</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-hidden">
            <Card className="h-full border-0 shadow-card bg-gradient-to-br from-card to-card/80 flex flex-col">
              <CardHeader className="border-b border-border/50 py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Scale className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Litigation Case Form</CardTitle>
                    <CardDescription className="text-xs">Fill in the details for the new litigation case</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Category Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                      <Label htmlFor="category" className="text-sm">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm">View Litigation Access (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-9 justify-between text-sm"
                            type="button"
                          >
                            {selectedAccessAccounts.length > 0
                              ? `${selectedAccessAccounts.length} account(s) selected`
                              : "Select access accounts"}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0 bg-card border-border z-50" align="start">
                          <div className="p-3 border-b border-border bg-muted/50">
                            <p className="text-sm font-medium">Select accounts</p>
                            <p className="text-xs text-muted-foreground">Choose who can view this case</p>
                          </div>
                          <div className="max-h-[240px] overflow-y-auto">
                            {litigationAccessAccounts.length === 0 ? (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                No litigation access accounts available
                              </div>
                            ) : (
                              <div className="p-2 space-y-1">
                                {litigationAccessAccounts.map((account) => (
                                  <div
                                    key={account.id}
                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                                    onClick={() => toggleAccessAccount(account.id)}
                                  >
                                    <Checkbox
                                      checked={selectedAccessAccounts.includes(account.id)}
                                      onCheckedChange={() => toggleAccessAccount(account.id)}
                                    />
                                    <label className="text-sm flex-1 cursor-pointer">
                                      {account.username}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {category && (
                    <>
                      {/* Bank Details - Only for Bank Category */}
                      {category === "bank" && (
                        <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-green-900 text-sm">Bank Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <FloatingInput
                              id="bankName"
                              label="Bank Name *"
                              value={formData.bankName}
                              onChange={(e) => handleInputChange('bankName', e.target.value)}
                              required
                            />
                            <FloatingInput
                              id="branchName"
                              label="Branch Name *"
                              value={formData.branchName}
                              onChange={(e) => handleInputChange('branchName', e.target.value)}
                              required
                            />
                            <FloatingInput
                              id="accountNo"
                              label="Account No *"
                              value={formData.accountNo}
                              onChange={(e) => handleInputChange('accountNo', e.target.value)}
                              required
                            />
                            <FloatingInput
                              id="loanAmount"
                              label="Loan Amount *"
                              type="number"
                              value={formData.loanAmount}
                              onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Borrower Details - Only for Bank Category */}
                      {category === "bank" && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground text-sm">Borrower Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FloatingInput
                              id="borrowerName"
                              label="Borrower Name *"
                              value={formData.borrowerName}
                              onChange={(e) => handleInputChange('borrowerName', e.target.value)}
                              required
                            />
                            <FloatingInput
                              id="coBorrowerName"
                              label="Co-Borrower Name"
                              value={formData.coBorrowerName}
                              onChange={(e) => handleInputChange('coBorrowerName', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Petitioner/Respondent Details - Only for Private Category */}
                      {category === "private" && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground text-sm">Party Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FloatingInput
                              id="petitionerName"
                              label="Petitioner Name *"
                              value={formData.petitionerName}
                              onChange={(e) => handleInputChange('petitionerName', e.target.value)}
                              required
                            />
                            <FloatingInput
                              id="respondentName"
                              label="Respondent Name *"
                              value={formData.respondentName}
                              onChange={(e) => handleInputChange('respondentName', e.target.value)}
                              required
                            />
                            <FloatingTextarea
                              id="petitionerAddress"
                              label="Petitioner Address *"
                              value={formData.petitionerAddress}
                              onChange={(e) => handleInputChange('petitionerAddress', e.target.value)}
                              rows={2}
                              required
                            />
                            <FloatingTextarea
                              id="respondentAddress"
                              label="Respondent Address *"
                              value={formData.respondentAddress}
                              onChange={(e) => handleInputChange('respondentAddress', e.target.value)}
                              rows={2}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Case Details */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">Case Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FloatingSelect
                            id="courtDistrict"
                            label="Court District"
                            value={formData.courtDistrict}
                            onValueChange={(value) => handleInputChange('courtDistrict', value)}
                            required
                          >
                            {getDistrictNames().map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </FloatingSelect>
                          <FloatingInput
                            id="courtName"
                            label="Court Name"
                            value={formData.courtName}
                            onChange={(e) => handleInputChange('courtName', e.target.value)}
                            required
                          />
                          <FloatingSelect
                            id="caseType"
                            label="Case Type"
                            value={formData.caseType}
                            onValueChange={(value) => handleInputChange('caseType', value)}
                            required
                          >
                            <SelectItem value="AP">AP</SelectItem>
                            <SelectItem value="AS">AS</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="CC">CC</SelectItem>
                            <SelectItem value="CMA">CMA</SelectItem>
                            <SelectItem value="CP">CP</SelectItem>
                            <SelectItem value="CRLA">CRLA</SelectItem>
                            <SelectItem value="CRLMP">CRLMP</SelectItem>
                            <SelectItem value="CRLR">CRLR</SelectItem>
                            <SelectItem value="CRP">CRP</SelectItem>
                            <SelectItem value="Dist. Application">Dist. Application</SelectItem>
                            <SelectItem value="DVC">DVC</SelectItem>
                            <SelectItem value="EOCC">EOCC</SelectItem>
                            <SelectItem value="EP">EP</SelectItem>
                            <SelectItem value="IP">IP</SelectItem>
                            <SelectItem value="JC">JC</SelectItem>
                            <SelectItem value="MC">MC</SelectItem>
                            <SelectItem value="MCOP">MCOP</SelectItem>
                            <SelectItem value="MJC">MJC</SelectItem>
                            <SelectItem value="MTA">MTA</SelectItem>
                            <SelectItem value="NT Application">NT Application</SelectItem>
                            <SelectItem value="OA">OA</SelectItem>
                            <SelectItem value="OP">OP</SelectItem>
                            <SelectItem value="OS">OS</SelectItem>
                            <SelectItem value="PRC">PRC</SelectItem>
                            <SelectItem value="PWA">PWA</SelectItem>
                            <SelectItem value="RC">RC</SelectItem>
                            <SelectItem value="RCA">RCA</SelectItem>
                            <SelectItem value="RCS">RCS</SelectItem>
                            <SelectItem value="RP">RP</SelectItem>
                            <SelectItem value="RTA">RTA</SelectItem>
                            <SelectItem value="SA">SA</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="SCC">SCC</SelectItem>
                            <SelectItem value="SOA">SOA</SelectItem>
                            <SelectItem value="SPLCC">SPLCC</SelectItem>
                            <SelectItem value="SPL.SC">SPL.SC</SelectItem>
                            <SelectItem value="STC">STC</SelectItem>
                          </FloatingSelect>
                          <FloatingInput
                            id="caseNo"
                            label="Case No *"
                            value={formData.caseNo}
                            onChange={(e) => handleInputChange('caseNo', e.target.value)}
                            required
                          />
                          <DatePicker
                            id="filingDate"
                            label="Filing Date *"
                            value={formData.filingDate}
                            onChange={(date) => handleInputChange('filingDate', date)}
                            required
                          />
                          <DatePicker
                            id="nextHearingDate"
                            label="Next Date of Hearing"
                            value={formData.nextHearingDate}
                            onChange={(date) => handleInputChange('nextHearingDate', date)}
                          />
                          <FloatingTextarea
                            id="presentStatus"
                            label="Present Status (Update Every Hearing)"
                            value={formData.presentStatus}
                            onChange={(e) => handleInputChange('presentStatus', e.target.value)}
                            rows={2}
                            className="md:col-span-2"
                          />
                        </div>
                      </div>

                      {/* Advocate Fees */}
                      <div className="space-y-2 p-3 bg-amber-50 rounded-lg">
                        <h3 className="font-semibold text-amber-900 text-sm">Advocate Fees</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FloatingInput
                            id="totalAdvocateFees"
                            label="Total Advocate Fees"
                            type="number"
                            value={formData.totalAdvocateFees}
                            onChange={(e) => handleInputChange('totalAdvocateFees', e.target.value)}
                          />
                          <FloatingInput
                            id="initialFees"
                            label="Initial Fees"
                            type="number"
                            value={formData.initialFees}
                            onChange={(e) => handleInputChange('initialFees', e.target.value)}
                          />
                          <DatePicker
                            id="initialFeesReceivedOn"
                            label="Initial Fees Received On"
                            value={formData.initialFeesReceivedOn}
                            onChange={(date) => handleInputChange('initialFeesReceivedOn', date)}
                          />
                          <FloatingInput
                            id="finalFees"
                            label="Final Fees"
                            type="number"
                            value={formData.finalFees}
                            onChange={(e) => handleInputChange('finalFees', e.target.value)}
                          />
                          <DatePicker
                            id="finalFeesReceivedOn"
                            label="Final Fees Received On"
                            value={formData.finalFeesReceivedOn}
                            onChange={(date) => handleInputChange('finalFeesReceivedOn', date)}
                          />
                          <DatePicker
                            id="judgementDate"
                            label="Date of Judgement"
                            value={formData.judgementDate}
                            onChange={(date) => handleInputChange('judgementDate', date)}
                          />
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">Additional Information</h3>
                        <FloatingTextarea
                          id="details"
                          label="Details if Any"
                          value={formData.details}
                          onChange={(e) => handleInputChange('details', e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Create Litigation Case
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/litigation-dashboard')}
                          className="h-9"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
