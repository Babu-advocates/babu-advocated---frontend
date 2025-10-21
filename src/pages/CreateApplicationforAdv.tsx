import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, ChevronDown, Upload, FileText, User, DollarSign, Clock, Save, Send, X } from "lucide-react";
import { getDistrictNames, getTaluksByDistrict } from "@/data/tamilnaduData";
export default function CreateApplicationforAdv() {
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState<string>("");
  const [employeeName, setEmployeeName] = useState<string>("");

  // Get employee name from localStorage
  useEffect(() => {
    const storedEmployeeName = localStorage.getItem("employeeUsername");
    if (storedEmployeeName) {
      setEmployeeName(storedEmployeeName);
    }
  }, []);
  const generateApplicationId = async (employeeNameParam: string) => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('next_application_id', {
        bank: employeeNameParam
      });
      if (error) {
        console.error('Error generating application ID:', error);
        showToast.error("Failed to generate application ID");
        // Fallback to timestamp-based ID
        setApplicationId(`APP${Date.now().toString().slice(-6)}`);
      } else {
        setApplicationId(data);
      }
    } catch (error) {
      console.error('Error calling RPC function:', error);
      // Fallback to timestamp-based ID
      setApplicationId(`APP${Date.now().toString().slice(-6)}`);
    }
  };
  const [formData, setFormData] = useState({
    // Applicant Details
    applicantFullName: "",
    address: "",
    district: "",
    taluk: "",
    village: "",
    // Application Type
    applicationType: "",
    // Vetting Report specific fields
    bankApplicationNo: "",
    ownerName: "",
    // Property Details
    natureOfProperty: "",
    locationOfProperty: "",
    surveyNumber: "",
    extentOfProperty: "",
    plotNo: "",
    layoutName: "",
    // Banking Details
    product: "",
    loanAmount: "",
    accountNumber: "",
    // Sales Representative Details
    salesmanName: "",
    salesmanContact: "",
    salesmanEmail: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    type: string;
    size: number;
  }>>([]);
  // Keep actual File objects for upload to storage
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sectionsOpen, setSectionsOpen] = useState({
    borrower: true,
    recovery: false,
    documents: false
  });

  // Loading states for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [loanTypes, setLoanTypes] = useState<string[]>([]);
  const [availableTaluks, setAvailableTaluks] = useState<string[]>([]);
  const [bankNames, setBankNames] = useState<string[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const submissionDate = new Date();

  // Fetch loan types from Supabase
  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('loan_types').select('name').order('name', {
          ascending: true
        });
        if (error) {
          console.error('Error fetching loan types:', error);
          // Fallback to hardcoded types if fetch fails
          setLoanTypes(["Home Loan", "Personal Loan", "Business Loan", "Vehicle Loan", "Education Loan", "Gold Loan"]);
        } else {
          setLoanTypes(data.map(item => item.name));
        }
      } catch (error) {
        console.error('Error fetching loan types:', error);
        // Fallback to hardcoded types if fetch fails
        setLoanTypes(["Home Loan", "Personal Loan", "Business Loan", "Vehicle Loan", "Education Loan", "Gold Loan"]);
      }
    };
    fetchLoanTypes();
  }, []);

  // Fetch bank names from Supabase
  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('bank_name')
          .order('bank_name', { ascending: true });
        
        if (error) {
          console.error('Error fetching bank names:', error);
        } else {
          // Extract unique bank names
          const uniqueBankNames = [...new Set(data.map(item => item.bank_name))];
          setBankNames(uniqueBankNames);
        }
      } catch (error) {
        console.error('Error fetching bank names:', error);
      }
    };
    fetchBankNames();
  }, []);

  // Initialize taluks when district is set
  useEffect(() => {
    if (formData.district) {
      const taluks = getTaluksByDistrict(formData.district);
      setAvailableTaluks(taluks);
    } else {
      setAvailableTaluks([]);
    }
  }, [formData.district]);
  const recoveryStages = ["Pre-legal Notice", "Legal Action Initiated", "Court Case Filed"];
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If district changes, update available taluks and reset taluk
    if (field === 'district') {
      const taluks = getTaluksByDistrict(value);
      setAvailableTaluks(taluks);
      setFormData(prev => ({
        ...prev,
        [field]: value,
        taluk: '' // Reset taluk when district changes
      }));
    }
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    // Store metadata for UI
    const newFiles = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Keep File objects for uploading to Supabase Storage on submit
    setSelectedFiles(prev => [...prev, ...files]);
  };
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const validateForm = () => {
    if (formData.applicationType === "vetting report") {
      const required = ['bankApplicationNo', 'applicantFullName', 'ownerName', 'product'];
      for (const field of required) {
        if (!formData[field as keyof typeof formData]) {
          return false;
        }
      }
    } else {
      const required = ['applicantFullName', 'address', 'district', 'applicationType', 'product', 'loanAmount', 'accountNumber'];
      for (const field of required) {
        if (!formData[field as keyof typeof formData]) {
          return false;
        }
      }
    }
    return true;
  };
  const handleSubmit = async (isDraft: boolean) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    // Validate bank selection
    if (!selectedBank) {
      showToast.error("Please select a bank.");
      return;
    }
    
    if (!isDraft && !validateForm()) {
      showToast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const submittedBy = localStorage.getItem("employeeUsername") || "unknown";

      // Fetch the bank username based on selected bank name
      const { data: bankData, error: bankError } = await supabase
        .from('bank_accounts')
        .select('username')
        .eq('bank_name', selectedBank)
        .maybeSingle();

      if (bankError || !bankData) {
        console.error('Error fetching bank username:', bankError);
        showToast.error("Failed to fetch bank information.");
        setIsSubmitting(false);
        return;
      }

      const bankUsername = bankData.username;

      // Generate application ID only when actually submitting (not for drafts)
      let finalApplicationId = applicationId;
      if (!isDraft && !applicationId) {
        try {
          const {
            data,
            error
          } = await supabase.rpc('next_application_id', {
            bank: selectedBank
          });
          if (error) {
            console.error('Error generating application ID:', error);
            showToast.error("Failed to generate application ID");
            return;
          } else {
            finalApplicationId = data;
            setApplicationId(data);
          }
        } catch (error) {
          console.error('Error calling RPC function:', error);
          showToast.error("Failed to generate application ID");
          return;
        }
      }

      // Prepare uploaded files: upload to Backblaze via Edge Function when submitting
      let filesMeta: Array<{
        name: string;
        type: string;
        size: number;
        path?: string;
        url?: string;
      }> = uploadedFiles;
      if (!isDraft && selectedFiles.length > 0) {
        const uploadResults = await Promise.all(selectedFiles.map(async (file) => {
          const filePath = `${Date.now()}-${file.name}`;
          
          const { data, error } = await supabase.storage
            .from('application-documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw new Error(`Supabase Storage upload failed: ${error.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('application-documents')
            .getPublicUrl(data.path);

          const json = {
            success: true,
            file: {
              download_url: publicUrl,
              path: data.path
            }
          };

          return {
            name: file.name,
            type: file.type,
            size: file.size,
            url: json.file.download_url,
          };
        }));
        filesMeta = uploadResults;
      }
      const applicationData = {
        application_id: finalApplicationId,
        bank_name: selectedBank,
        application_type: formData.applicationType,
        borrower_name: formData.applicantFullName,
        customer_id: formData.accountNumber,
        phone: formData.salesmanContact || "",
        email: formData.salesmanEmail || "",
        address: formData.address || null,
        loan_type: formData.product,
        loan_amount: parseFloat(formData.loanAmount) || 0,
        sanction_date: null,
        outstanding_amount: null,
        due_since: null,
        recovery_stage: null,
        additional_notes: null,
        // New structured fields
        district: formData.district || null,
        taluk: formData.taluk || null,
        village: formData.village || null,
        nature_of_property: formData.natureOfProperty || null,
        location_of_property: formData.locationOfProperty || null,
        survey_number: formData.surveyNumber || null,
        extent_of_property: formData.extentOfProperty || null,
        plot_no: formData.plotNo || null,
        layout_name: formData.layoutName || null,
        bank_application_no: formData.bankApplicationNo || null,
        salesman_name: formData.salesmanName || null,
        salesman_contact: formData.salesmanContact || null,
        salesman_email: formData.salesmanEmail || null,
        account_number: formData.accountNumber || null,
        uploaded_files: filesMeta,
        status: isDraft ? "draft" : "to_be_assigned",
        submitted_by: bankUsername
      };
      const {
        data,
        error
      } = await supabase.from("applications").insert([applicationData]).select();
      if (error) {
        console.error("Error saving application:", error);
        showToast.error("Failed to save application. Please try again.");
        return;
      }

      // Create initial query entry for submitted applications (not drafts)
      if (!isDraft) {
        try {
          const {
            error: queryError
          } = await supabase.from("queries").insert({
            application_id: finalApplicationId,
            sender_type: 'employee',
            sender_name: submittedBy,
            sender_email: localStorage.getItem("employeeEmail") || 'employee@example.com',
            message: `Application ${finalApplicationId} has been created and is ready for processing.`,
            attached_files: [],
            is_read: true
          });
          if (queryError) {
            console.error("Error creating initial query:", queryError);
            // Don't fail the entire submission if query creation fails
          }
        } catch (queryError) {
          console.error("Error creating initial query:", queryError);
          // Don't fail the entire submission if query creation fails
        }

        // Create notification for admin when advocate employee submits application
        try {
          const {
            error: notificationError
          } = await supabase.from("notifications").insert({
            type: 'application_submitted',
            employee_username: submittedBy,
            // This should be the employee username like 'advocate' or similar
            employee_email: localStorage.getItem("employeeEmail") || 'employee@example.com',
            application_id: finalApplicationId,
            message: `New application ${finalApplicationId} submitted by advocate employee ${employeeName} for ${formData.applicantFullName}`,
            is_read: false
          });
          if (notificationError) {
            console.error("Error creating notification:", notificationError);
            // Don't fail the entire submission if notification creation fails
          }
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Don't fail the entire submission if notification creation fails
        }
      }

      // Show success animation for submissions (not drafts)
      if (!isDraft) {
        setShowSuccessAnimation(true);
        // Auto-hide success animation after 3 seconds
        setTimeout(() => {
          setShowSuccessAnimation(false);
          showToast.success("Application submitted successfully!");
          navigate("/employee/past-applications");
        }, 3000);
      } else {
        showToast.success("Draft saved successfully!");
        navigate("/employee/past-applications");
      }
    } catch (error) {
      console.error("Error saving application:", error);
      showToast.error("Failed to save application. Please try again.");
    } finally {
      if (!showSuccessAnimation) {
        setIsSubmitting(false);
      }
    }
  };
  const progress = formData.applicantFullName ? 25 + (formData.product ? 25 : 0) + (formData.loanAmount ? 25 : 0) + (formData.accountNumber ? 25 : 0) : 0;
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-employee-light font-kontora">
        <EmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Create Application</h1>
              <p className="text-sm text-muted-foreground">Submit new loan legal opinion or recovery application</p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Application Type Selection - Moved to top */}
            <div className="flex gap-4">
              <div className="w-64">
                <Label className="text-xs font-medium text-muted-foreground">Application Type *</Label>
                <Select value={formData.applicationType} onValueChange={value => handleInputChange('applicationType', value)}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal opinion">Legal Opinion</SelectItem>
                    <SelectItem value="vetting report">Vetting Report</SelectItem>
                    <SelectItem value="supplementary opinion">Supplementary Opinion</SelectItem>
                    <SelectItem value="MODT">MODT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-64">
                <Label className="text-xs font-medium text-muted-foreground">Select Bank *</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankNames.map((bankName) => (
                      <SelectItem key={bankName} value={bankName}>
                        {bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Progress Bar */}
            

            {/* Application Form - Conditional Layout Based on Type */}
            {formData.applicationType === "vetting report" ? (/* Vetting Report Form */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <FileText className="h-4 w-4 text-red-600" />
                      Vetting Report Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <FloatingInput 
                        label="Bank Application No *"
                        value={formData.bankApplicationNo} 
                        onChange={e => handleInputChange('bankApplicationNo', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Applicant Name *"
                        value={formData.applicantFullName} 
                        onChange={e => handleInputChange('applicantFullName', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Owner Name *"
                        value={formData.ownerName} 
                        onChange={e => handleInputChange('ownerName', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Product *</Label>
                      <Select value={formData.product} onValueChange={value => handleInputChange('product', value)}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Bank Rep Name"
                        value={formData.salesmanName} 
                        onChange={e => handleInputChange('salesmanName', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Bank Rep Contact No"
                        value={formData.salesmanContact} 
                        onChange={e => handleInputChange('salesmanContact', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Bank Rep Email"
                        value={formData.salesmanEmail} 
                        onChange={e => handleInputChange('salesmanEmail', e.target.value)} 
                        type="email"
                        className="bg-background" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <Upload className="h-4 w-4 text-red-600" />
                      Documents & Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Document Upload */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Documents</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center mt-1">
                        <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                        <label htmlFor="file-upload">
                          <Button variant="outline" size="sm" className="cursor-pointer h-7 text-xs" asChild>
                            <span>
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </span>
                          </Button>
                        </label>
                      </div>
                      
                      {uploadedFiles.length > 0 && <div className="space-y-1 mt-2">
                          {uploadedFiles.slice(0, 3).map((file, index) => <div key={index} className="flex items-center justify-between p-1 bg-muted/30 rounded text-xs">
                              <div className="flex items-center gap-1 truncate">
                                <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-4 w-4 p-0 text-destructive hover:text-destructive/80">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>)}
                          {uploadedFiles.length > 3 && <p className="text-xs text-muted-foreground">+{uploadedFiles.length - 3} more files</p>}
                        </div>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-3">
                      <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || !validateForm()} className="h-8 text-xs bg-red-600 hover:bg-red-700">
                        <Send className="h-3 w-3 mr-1" />
                        Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>) : (/* Default Form for Other Application Types */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                
                {/* Applicant Details */}
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <User className="h-4 w-4 text-red-600" />
                      Applicant Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <FloatingInput 
                        label="Applicant Full Name *"
                        value={formData.applicantFullName} 
                        onChange={e => handleInputChange('applicantFullName', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingTextarea 
                        label="Address *"
                        value={formData.address} 
                        onChange={e => handleInputChange('address', e.target.value)} 
                        className="bg-background min-h-[60px]" 
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">District *</Label>
                      <Select value={formData.district} onValueChange={value => handleInputChange('district', value)}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border shadow-lg z-50">
                          {getDistrictNames().map(district => <SelectItem key={district} value={district}>{district}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Taluk</Label>
                      <Select value={formData.taluk} onValueChange={value => handleInputChange('taluk', value)} disabled={!formData.district}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder={formData.district ? "Select taluk" : "Select district first"} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border shadow-lg z-50">
                          {availableTaluks.map(taluk => <SelectItem key={taluk} value={taluk}>{taluk}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Village"
                        value={formData.village} 
                        onChange={e => handleInputChange('village', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Property Details */}
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <FileText className="h-4 w-4 text-red-600" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <FloatingInput 
                        label="Nature of Property"
                        value={formData.natureOfProperty} 
                        onChange={e => handleInputChange('natureOfProperty', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Location of Property"
                        value={formData.locationOfProperty} 
                        onChange={e => handleInputChange('locationOfProperty', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Survey Number"
                        value={formData.surveyNumber} 
                        onChange={e => handleInputChange('surveyNumber', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Extent of Property"
                        value={formData.extentOfProperty} 
                        onChange={e => handleInputChange('extentOfProperty', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Plot No"
                        value={formData.plotNo} 
                        onChange={e => handleInputChange('plotNo', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Layout Name"
                        value={formData.layoutName} 
                        onChange={e => handleInputChange('layoutName', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Banking Details */}
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      Banking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <FloatingInput 
                        label="Bank Application No"
                        value={formData.bankApplicationNo} 
                        onChange={e => handleInputChange('bankApplicationNo', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Product *</Label>
                      <Select value={formData.product} onValueChange={value => handleInputChange('product', value)}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Loan Amount *"
                        value={formData.loanAmount} 
                        onChange={e => handleInputChange('loanAmount', e.target.value)} 
                        type="number"
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Account Number *"
                        value={formData.accountNumber} 
                        onChange={e => handleInputChange('accountNumber', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Rep Details */}
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base">
                      <User className="h-4 w-4 text-red-600" />
                      Bank Rep Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <FloatingInput 
                        label="Bank Rep Name"
                        value={formData.salesmanName} 
                        onChange={e => handleInputChange('salesmanName', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Bank Rep Contact No"
                        value={formData.salesmanContact} 
                        onChange={e => handleInputChange('salesmanContact', e.target.value)} 
                        className="bg-background" 
                      />
                    </div>
                    
                    <div>
                      <FloatingInput 
                        label="Bank Rep Email"
                        value={formData.salesmanEmail} 
                        onChange={e => handleInputChange('salesmanEmail', e.target.value)} 
                        type="email"
                        className="bg-background" 
                      />
                    </div>

                    {/* Document Upload - Compact */}
                    <div className="pt-2">
                      <Label className="text-xs font-medium text-muted-foreground">Documents</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center mt-1">
                        <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                        <label htmlFor="file-upload">
                          <Button variant="outline" size="sm" className="cursor-pointer h-7 text-xs" asChild>
                            <span>
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </span>
                          </Button>
                        </label>
                      </div>
                      
                      {uploadedFiles.length > 0 && <div className="space-y-1 mt-2">
                          {uploadedFiles.slice(0, 3).map((file, index) => <div key={index} className="flex items-center justify-between p-1 bg-muted/30 rounded text-xs">
                              <div className="flex items-center gap-1 truncate">
                                <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-4 w-4 p-0 text-destructive hover:text-destructive/80">
                                <X className="h-2 w-2" />
                              </Button>
                            </div>)}
                          {uploadedFiles.length > 3 && <p className="text-xs text-muted-foreground">+{uploadedFiles.length - 3} more files</p>}
                        </div>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-3">
                      
                      <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || !validateForm()} className="h-8 text-xs bg-red-600 hover:bg-red-700">
                        <Send className="h-3 w-3 mr-1" />
                        Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>)}

            {/* Success Animation Overlay */}
            {showSuccessAnimation && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <Card className="border-0 shadow-elegant bg-card/95 backdrop-blur-md mx-4 animate-scale-in">
                  <CardContent className="pt-8 pb-8 px-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center animate-pulse">
                      <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Sending to Admin...</h3>
                    <p className="text-muted-foreground">Your application is being submitted</p>
                    <div className="mt-4 w-48 mx-auto bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-600 to-red-700 animate-pulse rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}