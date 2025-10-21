import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Filter, Building2, FileText, User, Calendar, CreditCard, RefreshCw, Phone, Mail, MapPin, Download, MessageSquare, Upload, Check, Trash2, ArrowUpRight, Loader2, FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useLocation } from "react-router-dom";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QueryForm } from "@/components/QueryForm";
import { useState as useFileState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

const LoanApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignWork, setShowAssignWork] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [uploadingOpinion, setUploadingOpinion] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [submittingOpinion, setSubmittingOpinion] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFileName, setDownloadingFileName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Fetch applications from database
  useEffect(() => {
    fetchApplications();
    fetchBankAccounts();

    // Real-time sync: update list when application status changes anywhere
    const channel = supabase.channel('applications-updates').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'applications'
    }, payload => {
      setLoanApplications(prev => prev.map(app => {
        if (app.id !== payload.new.id) return app;
        const updated = payload.new as any;
        return {
          ...app,
          ...updated,
          id: updated.id,
          applicationNumber: updated.application_id,
          name: updated.borrower_name,
          bankName: updated.bank_name,
          amount: `₹${Number(updated.loan_amount).toLocaleString('en-IN')}`,
          status: updated.status,
          date: new Date(updated.submission_date).toISOString().split('T')[0],
          loanType: updated.loan_type,
          applicationType: updated.application_type
        };
      }));

      // Notify on status change
      if ((payload.old as any)?.status !== (payload.new as any)?.status) {
        toast({
          title: 'Status updated',
          description: `Application ${(payload.new as any).application_id} is now ${(payload.new as any).status}.`
        });
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reset scroll position when modal opens with new application
  useEffect(() => {
    if (selectedApplication) {
      // Reset scroll position when dialog opens
      const scrollToTop = () => {
        const dialogContent = document.querySelector('[role="dialog"] .overflow-y-auto');
        if (dialogContent) {
          dialogContent.scrollTop = 0;
        }
      };
      
      // Multiple attempts to ensure scroll reset
      scrollToTop();
      const timer1 = setTimeout(scrollToTop, 50);
      const timer2 = setTimeout(scrollToTop, 150);
      const timer3 = setTimeout(scrollToTop, 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [selectedApplication]);
  const fetchApplications = async () => {
    try {
      setLoading(true);

      // Check if this is an employee viewing their assignments
      const isEmployeeLogin = localStorage.getItem("employeeLogin") === "true";
      const employeeUsername = localStorage.getItem("employeeUsername");
      let query = supabase.from('applications').select('*');

      // If employee is logged in, filter to show applications assigned to them OR redirected from them
      if (isEmployeeLogin && employeeUsername && !isAdminRoute) {
        query = query.or(`assigned_to_username.eq.${employeeUsername},original_assigned_to_username.eq.${employeeUsername}`);
      } else {
        // For admin/legal opinion view, show applications that need to be assigned or are under review
        query = query.in('status', ['to_be_assigned', 'in_review', 'under_review', 'redirected']);
      }
      const {
        data,
        error
      } = await query.order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive"
        });
        return;
      }

      // Transform data to match component expectations while keeping original data
      const transformedData = data?.map(app => {
        // Determine display status based on redirect and current user
        let displayStatus = app.status;
        if (app.status === 'redirected' && isEmployeeLogin && employeeUsername) {
          if (app.original_assigned_to_username === employeeUsername) {
            displayStatus = `redirected to ${app.assigned_to_username}`;
          } else if (app.assigned_to_username === employeeUsername) {
            displayStatus = 'in_review'; // Show as in review for the new assignee
          }
        }
        return {
          id: app.id,
          applicationNumber: app.application_id,
          name: app.borrower_name,
          bankName: app.bank_name,
          amount: `₹${Number(app.loan_amount).toLocaleString('en-IN')}`,
          status: displayStatus,
          date: new Date(app.submission_date).toISOString().split('T')[0],
          loanType: app.loan_type,
          applicationType: app.application_type,
          // Keep original database fields for detailed view
          ...app
        };
      }) || [];
      setLoanApplications(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const {
        data,
        error
      } = await supabase.from('employee_accounts').select('id, username').eq('is_active', true).order('username');
      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive"
        });
        return;
      }
      setEmployees(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    } finally {
      setLoadingEmployees(false);
    }
  };
  const handleAssignWork = async (employeeId: string, employeeUsername: string) => {
    try {
      // Update the application with assigned employee
      const {
        error
      } = await supabase.from('applications').update({
        assigned_to: employeeId,
        assigned_to_username: employeeUsername,
        assigned_at: new Date().toISOString(),
        status: 'in_review',
        updated_at: new Date().toISOString()
      }).eq('id', selectedApplication.id);
      if (error) {
        console.error('Error assigning work:', error);
        toast({
          title: "Error",
          description: "Failed to assign work",
          variant: "destructive"
        });
        return;
      }

      // Send notification to the assigned employee
      try {
        const {
          error: notificationError
        } = await supabase.from('notifications').insert({
          type: 'work_assignment',
          employee_username: employeeUsername,
          application_id: selectedApplication.application_id,
          message: `New work assigned: ${selectedApplication.application_type} for ${selectedApplication.borrower_name} (${selectedApplication.bank_name})`
        });
        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        // Call the edge function to send email notification
        const {
          error: emailError
        } = await supabase.functions.invoke('send-assignment-notification', {
          body: {
            employeeUsername,
            applicationId: selectedApplication.application_id,
            applicationDetails: {
              applicationType: selectedApplication.application_type,
              borrowerName: selectedApplication.borrower_name,
              bankName: selectedApplication.bank_name,
              loanAmount: selectedApplication.loan_amount
            }
          }
        });
        if (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      } catch (notificationError) {
        console.error('Error with notifications:', notificationError);
        // Don't fail the assignment if notification fails
      }
      toast({
        title: "Success",
        description: `Work assigned to ${employeeUsername} and notification sent`,
        variant: "default"
      });
      setShowAssignWork(false);
      fetchApplications(); // Refresh the applications list
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to assign work",
        variant: "destructive"
      });
    }
  };
  const handleFileView = async (file: any, bucketName = 'application-documents') => {
    try {
      const fileName = file?.name || 'document';
      console.log('Attempting to access file:', fileName);

      // Check if file has a direct URL (newer uploads)
      if (file?.url) {
        await downloadFile(file.url, fileName);
        return;
      }

      // Check if file has a storage path (newer uploads)
      if (file?.path) {
        const {
          data: signedUrlData,
          error: signedError
        } = await supabase.storage.from(bucketName).createSignedUrl(file.path, 3600);
        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast({
            title: 'Error',
            description: 'Could not access file',
            variant: 'destructive'
          });
          return;
        }
        if (signedUrlData?.signedUrl) {
          await downloadFile(signedUrlData.signedUrl, fileName);
          return;
        }
      }

      // Legacy fallback - search for file in storage
      const {
        data: fileList,
        error: listError
      } = await supabase.storage.from('application-documents').list('', {
        limit: 1000,
        search: fileName
      });
      if (listError) {
        console.error('Error checking file existence:', listError);
        toast({
          title: 'Error',
          description: 'Could not check file availability',
          variant: 'destructive'
        });
        return;
      }
      const foundFile = fileList?.find(f => f.name === fileName);
      if (!foundFile) {
        // Search in subdirectories
        const {
          data: subdirs,
          error: subdirError
        } = await supabase.storage.from('application-documents').list('');
        if (!subdirError && subdirs) {
          for (const dir of subdirs) {
            if (dir.name && dir.metadata?.isDirectory) {
              const {
                data: subFiles
              } = await supabase.storage.from('application-documents').list(dir.name, {
                search: fileName
              });
              if (subFiles?.length > 0) {
                const fullPath = `${dir.name}/${subFiles[0].name}`;
                const {
                  data: signedUrlData,
                  error: signedError
                } = await supabase.storage.from(bucketName).createSignedUrl(fullPath, 3600);
                if (!signedError && signedUrlData?.signedUrl) {
                  await downloadFile(signedUrlData.signedUrl, fileName);
                  return;
                }
              }
            }
          }
        }
        toast({
          title: 'File Not Found',
          description: 'The document was not found in storage. It may have been uploaded before the storage system was implemented.',
          variant: 'destructive'
        });
        return;
      }

      // File found at root level
      const {
        data: signedUrlData,
        error: signedError
      } = await supabase.storage.from(bucketName).createSignedUrl(fileName, 3600);
      if (signedError) {
        console.error('Error creating signed URL:', signedError);
        toast({
          title: 'Error',
          description: 'Could not access file',
          variant: 'destructive'
        });
        return;
      }
      if (signedUrlData?.signedUrl) {
        await downloadFile(signedUrlData.signedUrl, fileName);
      } else {
        toast({
          title: 'Error',
          description: 'Could not access file',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in handleFileView:', error);
      toast({
        title: 'Error',
        description: 'Failed to access document',
        variant: 'destructive'
      });
    }
  };
  const downloadFile = async (url: string, fileName: string) => {
    return new Promise<void>(async (resolve, reject) => {
      setIsDownloading(true);
      setDownloadingFileName(fileName);
      setDownloadProgress(0);

      try {
        const SUPABASE_URL = 'https://supabaseforbabu.techverseinfo.tech';
        const SUPABASE_PUBLISHABLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MDcxNTkwMCwiZXhwIjo0OTE2Mzg5NTAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.HgnCghXTEGW8zbkvg6MlEwNpK1GcIzh-OCNBBkfLr8o';
        
        const functionUrl = `${SUPABASE_URL}/functions/v1/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;

        // Get the current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', functionUrl, true);
        xhr.responseType = 'blob';
        
        // Add authentication headers
        if (session?.access_token) {
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        } else {
          xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_PUBLISHABLE_KEY}`);
        }
        xhr.setRequestHeader('apikey', SUPABASE_PUBLISHABLE_KEY);

        // Track download progress
        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setDownloadProgress(Math.round(percentComplete));
          } else {
            // If length is not computable, show indeterminate progress
            setDownloadProgress(50);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setDownloadProgress(100);
            
            const blob = xhr.response;
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
            
            setTimeout(() => {
              setIsDownloading(false);
              setDownloadProgress(0);
              toast({ 
                title: 'Success', 
                description: `${fileName} downloaded successfully` 
              });
              resolve();
            }, 500);
          } else {
            setIsDownloading(false);
            setDownloadProgress(0);
            toast({ 
              title: 'Download Failed', 
              description: `Failed to download ${fileName}. Status: ${xhr.status}`,
              variant: 'destructive' 
            });
            reject(new Error(`Download failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          setIsDownloading(false);
          setDownloadProgress(0);
          toast({ 
            title: 'Download Failed', 
            description: 'Unable to download file. Please try again.',
            variant: 'destructive' 
          });
          reject(new Error('Download failed'));
        };

        xhr.send();
      } catch (error) {
        console.error('Download error:', error);
        setIsDownloading(false);
        setDownloadProgress(0);
        toast({
          title: 'Error',
          description: 'Could not download the file',
          variant: 'destructive'
        });
        reject(error);
      }
    });
  };
  const handleOpinionUpload = async (file: File, applicationId: string) => {
    try {
      setUploadingOpinion(true);

      // Process file and apply digital signature automatically
      let processedFile = file;
      let fileName = file.name;

      // Add "_signed" to filename
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(`.${fileExt}`, '');
      const signedFileName = `${baseName}_signed.${fileExt}`;

      // If it's a PDF, apply digital signature
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          // Get current location for digital signature
          let latitude = null;
          let longitude = null;
          if (navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 60000
                });
              });
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
            } catch (error) {
              console.warn('Could not get location:', error);
            }
          }

          // Create a temporary file object for the signature process
          const tempFile = {
            name: file.name,
            path: '',
            // Empty path since it's not uploaded yet
            url: URL.createObjectURL(file),
            // Create blob URL for processing
            size: file.size,
            type: file.type
          };

          // Apply digital signature
          const signedPdfBytes = await addDigitalSignatureToPDF(tempFile, latitude, longitude);
          processedFile = new File([new Blob([signedPdfBytes.buffer as ArrayBuffer])], signedFileName, {
            type: 'application/pdf'
          });
          fileName = signedFileName;

          // Clean up blob URL
          URL.revokeObjectURL(tempFile.url);
        } catch (signError) {
          console.error('Error signing PDF during upload:', signError);
          // Continue with original file if signing fails
        }
      }
      const finalFileName = `${applicationId}_opinion_${Date.now()}_${fileName}`;

      // Upload processed file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('opinion-documents')
        .upload(finalFileName, new File([processedFile], finalFileName, { type: processedFile.type }), {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload opinion document to storage",
          variant: "destructive"
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('opinion-documents')
        .getPublicUrl(uploadData.path);

      const opinionFile = {
        name: fileName,
        url: publicUrl,
        size: processedFile.size,
        type: processedFile.type,
        uploaded_at: new Date().toISOString(),
        signed: fileName.includes('_signed'),
        ...(fileName.includes('_signed') && {
          digitalSignature: {
            signerName: localStorage.getItem("employeeUsername") || "Unknown",
            signDate: new Date().toLocaleDateString('en-CA').replace(/-/g, '.'),
            signTime: new Date().toLocaleTimeString('en-GB', {
              hour12: false
            }),
            verified: true
          }
        })
      };

      // Update application with opinion file and set digital signature as applied
      const currentApp = loanApplications.find(app => app.id === selectedApplication?.id);
      const currentOpinionFiles = currentApp?.opinion_files || [];
      const updatedOpinionFiles = [...currentOpinionFiles, opinionFile];
      const {
        error: updateError
      } = await supabase.from('applications').update({
        opinion_files: updatedOpinionFiles,
        digital_signature_applied: fileName.includes('_signed'),
        status: 'waiting_for_approval',
        updated_at: new Date().toISOString()
      }).eq('id', selectedApplication?.id);
      if (updateError) {
        console.error('Error updating application:', updateError);
        toast({
          title: "Update Error",
          description: "Failed to save opinion document reference",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Success",
        description: fileName.includes('_signed') ? "Opinion document uploaded and digitally signed successfully" : "Opinion document uploaded successfully",
        variant: "default"
      });

      // Update local state instead of fetching all applications
      setLoanApplications(prevApps => prevApps.map(app => app.id === selectedApplication?.id ? {
        ...app,
        opinion_files: updatedOpinionFiles,
        digital_signature_applied: fileName.includes('_signed'),
        status: 'waiting_for_approval',
        updated_at: new Date().toISOString()
      } : app));

      // Update selected application to reflect new file
      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          opinion_files: updatedOpinionFiles,
          digital_signature_applied: fileName.includes('_signed'),
          status: 'waiting_for_approval',
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in handleOpinionUpload:', error);
      toast({
        title: "Error",
        description: "Failed to upload opinion document",
        variant: "destructive"
      });
    } finally {
      setUploadingOpinion(false);
    }
  };
  const handleRemoveOpinion = async (fileIndex: number, file: any) => {
    try {
      if (!selectedApplication) return;

      // Note: We don't delete from Backblaze B2 here as files are managed separately
      // Only remove from the application's opinion_files array

      // Update application to remove file from opinion_files array
      const currentApp = loanApplications.find(app => app.id === selectedApplication?.id);
      const currentOpinionFiles = currentApp?.opinion_files || [];
      const updatedOpinionFiles = currentOpinionFiles.filter((_: any, index: number) => index !== fileIndex);

      // Determine if status should be changed based on digital signature and current status
      const shouldChangeStatus = currentApp?.digital_signature_applied && currentApp?.status === 'waiting_for_approval';
      const newStatus = shouldChangeStatus ? 'in_review' : currentApp?.status;
      const {
        error: updateError
      } = await supabase.from('applications').update({
        opinion_files: updatedOpinionFiles,
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', selectedApplication?.id);
      if (updateError) {
        console.error('Error updating application:', updateError);
        toast({
          title: "Update Error",
          description: "Failed to remove opinion document",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Success",
        description: "Opinion document removed successfully",
        variant: "default"
      });

      // Update local state instead of fetching all applications
      setLoanApplications(prevApps => prevApps.map(app => app.id === selectedApplication?.id ? {
        ...app,
        opinion_files: updatedOpinionFiles,
        status: newStatus,
        updated_at: new Date().toISOString()
      } : app));

      // Update selected application to reflect removed file
      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          opinion_files: updatedOpinionFiles,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in handleRemoveOpinion:', error);
      toast({
        title: "Error",
        description: "Failed to remove opinion document",
        variant: "destructive"
      });
    }
  };
  const addDigitalSignatureToPDF = async (file: any, latitude?: number | null, longitude?: number | null) => {
    try {
      // Import pdf-lib modules
      const {
        PDFDocument,
        rgb,
        StandardFonts
      } = await import('pdf-lib');

      // Use default name for all digital signatures
      const employeeUsername = 'SELVA RAJ BABU';

      // Fetch the PDF file
      let pdfArrayBuffer;
      if (file.url) {
        const response = await fetch(file.url);
        pdfArrayBuffer = await response.arrayBuffer();
      } else {
        throw new Error('File URL not available');
      }

      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const {
        width,
        height
      } = lastPage.getSize();

      // Load font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Create signature text with timestamp
      const currentDate = new Date();

      // Format date as YYYY.MM.DD HH:mm:ss (without timezone)
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const timestamp = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
      const baseSignatureLines = [`${employeeUsername}`,
      // Name prominently displayed first
      `Digitally signed`, `by ${employeeUsername}`, `Date:`, `${timestamp}`];

      // Add location if available
      const signatureLines = latitude && longitude ? [...baseSignatureLines, `Location: Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`] : baseSignatureLines;

      // Calculate signature block dimensions
      const nameFontSize = 16; // Larger font for name
      const fontSize = 10;
      const lineHeight = 12;
      const nameLineHeight = 18; // More space for the larger name
      const padding = 12;

      // Calculate width considering different font sizes
      const nameWidth = boldFont.widthOfTextAtSize(signatureLines[0], nameFontSize);
      const otherLinesWidth = Math.max(...signatureLines.slice(1).map(line => font.widthOfTextAtSize(line, fontSize)));
      const maxLineWidth = Math.max(nameWidth, otherLinesWidth);
      const blockWidth = maxLineWidth + padding * 2;
      const blockHeight = nameLineHeight + (signatureLines.length - 1) * lineHeight + padding * 2;

      // Position at bottom-right corner with margin
      const margin = 20;
      const x = width - blockWidth - margin;
      const y = margin + padding;

      // Draw signature block background
      lastPage.drawRectangle({
        x: x - padding,
        y: y - padding,
        width: blockWidth,
        height: blockHeight,
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 1,
        color: rgb(0.95, 0.95, 0.95)
      });

      // Draw signature text
      signatureLines.forEach((line, index) => {
        const isName = index === 0; // First line is the name
        const currentFontSize = isName ? nameFontSize : fontSize;
        const currentLineHeight = isName ? nameLineHeight : lineHeight;

        // Calculate y position - name gets more space
        let yPosition;
        if (index === 0) {
          yPosition = y + blockHeight - padding - nameLineHeight;
        } else {
          yPosition = y + blockHeight - padding - nameLineHeight - index * lineHeight;
        }
        lastPage.drawText(line, {
          x: x,
          y: yPosition,
          size: currentFontSize,
          font: isName ? boldFont : font,
          color: isName ? rgb(0, 0.5, 0) : rgb(0, 0, 0) // Green color for name, black for others
        });
      });

      // Return the modified PDF as Uint8Array
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error adding digital signature:', error);
      throw error;
    }
  };
  const handleSubmitOpinion = async () => {
    try {
      setSubmittingOpinion(true);

      // Get current location (latitude and longitude)
      let latitude = null;
      let longitude = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.warn('Could not get location:', error);
        }
      }

      // Process opinion files to add digital signatures
      const updatedOpinionFiles = [];
      const opinionFiles = selectedApplication?.opinion_files || [];
      for (const file of opinionFiles) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            // Add digital signature to PDF
            const signedPdfBytes = await addDigitalSignatureToPDF(file, latitude, longitude);

            // Create new filename for signed document
            const fileExt = file.name.split('.').pop();
            const baseName = file.name.replace(`.${fileExt}`, '');
            const signedFileName = `${baseName}_signed.${fileExt}`;

            // Upload signed PDF to Supabase Storage
            const signedFile = new File([new Blob([signedPdfBytes.buffer as ArrayBuffer])], signedFileName, { type: 'application/pdf' });
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('signed-documents')
              .upload(signedFileName, signedFile, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Supabase Storage upload error:', uploadError);
              throw new Error('Failed to upload signed document to storage');
            }

            const { data: { publicUrl } } = supabase.storage
              .from('signed-documents')
              .getPublicUrl(uploadData.path);

            const uploadResult = {
              success: true,
              file: {
                download_url: publicUrl,
                path: uploadData.path
              }
            };

            updatedOpinionFiles.push({
              ...file,
              name: signedFileName,
              url: uploadResult.file.download_url,
              signed: true,
              signed_at: new Date().toISOString(),
              digitalSignature: {
                signerName: localStorage.getItem("employeeUsername") || "Unknown",
                signDate: new Date().toLocaleDateString('en-CA').replace(/-/g, '.'),
                signTime: new Date().toLocaleTimeString('en-GB', {
                  hour12: false
                }),
                latitude: latitude,
                longitude: longitude,
                verified: true
              }
            });
          } catch (signError) {
            console.error('Error signing PDF:', signError);
            // Keep original file if signing fails
            updatedOpinionFiles.push(file);
          }
        } else {
          // Keep non-PDF files as is
          updatedOpinionFiles.push(file);
        }
      }

      // Update application with signed files and waiting for approval status
      const {
        error: updateError
      } = await supabase.from('applications').update({
        status: 'waiting_for_approval',
        opinion_files: updatedOpinionFiles,
        digital_signature_applied: true,
        updated_at: new Date().toISOString()
      }).eq('id', selectedApplication?.id);
      if (updateError) {
        console.error('Error submitting opinion:', updateError);
        toast({
          title: "Submit Error",
          description: "Failed to submit opinion",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Success",
        description: "Opinion submitted successfully with digital signature",
        variant: "default"
      });

      // Update the local state instead of fetching all applications
      setLoanApplications(prevApps => prevApps.map(app => app.id === selectedApplication?.id ? {
        ...app,
        status: 'waiting_for_approval',
        opinion_files: updatedOpinionFiles,
        digital_signature_applied: true,
        updated_at: new Date().toISOString()
      } : app));

      // Update selected application to reflect new status
      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          status: 'waiting_for_approval',
          opinion_files: updatedOpinionFiles,
          digital_signature_applied: true,
          updated_at: new Date().toISOString()
        });
      }
      setShowSubmitConfirmation(false);
      // Removed fetchApplications() call to prevent potential navigation side effects
    } catch (error) {
      console.error('Error in handleSubmitOpinion:', error);
      toast({
        title: "Error",
        description: "Failed to submit opinion",
        variant: "destructive"
      });
    } finally {
      setSubmittingOpinion(false);
    }
  };
  const fetchBankAccounts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('bank_accounts').select('username, bank_name, is_active').eq('is_active', true).order('username', {
        ascending: true
      });
      if (error) {
        console.error('Error fetching bank accounts:', error);
        toast({
          title: "Error",
          description: "Failed to load bank accounts",
          variant: "destructive"
        });
        return;
      }
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive"
      });
    }
  };
  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'to be assigned':
      case 'to_be_assigned':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_review':
      case 'under review':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'waiting for approval':
      case 'waiting_for_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending documents':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'redirected':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        if (s.startsWith('redirected to ')) {
          return 'bg-purple-100 text-purple-800 border-purple-200';
        }
        return 'bg-muted text-muted-foreground';
    }
  };

  // Determine if this is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Map DB status to display status for admin view
  const getDisplayStatus = (app: any) => {
    const s = (app?.status || '').toLowerCase();
    if (isAdminRoute) {
      // Show true backend status for admin
      if (s === 'to_be_assigned') return 'To be assigned';
      if (s === 'submitted') return 'Submitted';
      if (s === 'in_review') return 'Under Review';
      if (s === 'completed') return 'Completed';
      if (s === 'rejected') return 'Rejected';
      if (s === 'redirected') return 'Redirected';
      if (s.startsWith('redirected to ')) return s.charAt(0).toUpperCase() + s.slice(1);
    }
    // Default: return as-is (capitalize first letter)
    return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '';
  };
  const filteredApplications = loanApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || app.bankName.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by bank name - check if selected bank matches application bank name
    const matchesBank = selectedBank === "all" || app.bankName.toLowerCase().includes(selectedBank.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = isAdminRoute || applicationTypeFilter === "all" || app.applicationType === applicationTypeFilter;

    // Date range filtering
    let matchesDateRange = true;
    if (startDate || endDate) {
      const appDate = new Date(app.submission_date || app.date);
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = appDate >= start && appDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = appDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = appDate <= end;
      }
    }

    // Exclude submitted applications from Loan Applications page
    const isNotSubmitted = app.status !== 'submitted';
    return matchesSearch && matchesBank && matchesStatus && matchesType && matchesDateRange && isNotSubmitted;
  });

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredApplications.map(app => ({
        'Application ID': app.applicationNumber,
        'Status': getDisplayStatus(app),
        'Borrower Name': app.borrower_name || app.name,
        'Bank Name': app.bankName,
        'Loan Amount': app.loan_amount || app.amount,
        'Loan Type': app.loanType,
        'Application Type': app.applicationType,
        'Applied On': format(new Date(app.submission_date || app.date), 'dd-MM-yyyy'),
        'Assigned To': app.assigned_to_username || 'Not Assigned',
        'Contact Number': app.borrower_phone || '',
        'Email': app.borrower_email || '',
        'Address': app.borrower_address || '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Application ID
        { wch: 15 }, // Status
        { wch: 25 }, // Borrower Name
        { wch: 25 }, // Bank Name
        { wch: 15 }, // Loan Amount
        { wch: 20 }, // Loan Type
        { wch: 20 }, // Application Type
        { wch: 12 }, // Applied On
        { wch: 20 }, // Assigned To
        { wch: 15 }, // Contact Number
        { wch: 25 }, // Email
        { wch: 30 }, // Address
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Loan Applications');

      // Generate filename with date range if applicable
      let filename = 'Loan_Applications';
      if (startDate && endDate) {
        filename += `_${format(startDate, 'dd-MM-yyyy')}_to_${format(endDate, 'dd-MM-yyyy')}`;
      } else if (startDate) {
        filename += `_from_${format(startDate, 'dd-MM-yyyy')}`;
      } else if (endDate) {
        filename += `_until_${format(endDate, 'dd-MM-yyyy')}`;
      }
      if (selectedBank !== 'all') {
        filename += `_${selectedBank.replace(/\s+/g, '_')}`;
      }
      filename += `.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Success",
        description: `Exported ${filteredApplications.length} application(s) to Excel`,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error",
        description: "Failed to export to Excel",
        variant: "destructive",
      });
    }
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        {isAdminRoute ? <AppSidebar /> : <EmployeeSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Loan Application</h1>
                      <p className="text-sm text-slate-600">Manage all loan applications</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={exportToExcel}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                  disabled={filteredApplications.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" />
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search by name, application number, or bank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/50 border-slate-200 focus:border-blue-300 focus:ring-blue-200" />
              </div>
              
              <div className="flex gap-3">
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {bankAccounts.map(account => <SelectItem key={account.username} value={account.bank_name}>
                      {account.bank_name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="to_be_assigned">To be assigned</SelectItem>
                    <SelectItem value="in_review">Under Review</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
              </Select>

              {!isAdminRoute && <Select value={applicationTypeFilter} onValueChange={setApplicationTypeFilter}>
                  <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Application Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Loan Application">Loan Application</SelectItem>
                    <SelectItem value="Loan Recovery">Loan Recovery</SelectItem>
                  </SelectContent>
                </Select>}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-slate-700">Date Range:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal bg-white/50 border-slate-200",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd-MM-yyyy") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <span className="text-slate-500">to</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal bg-white/50 border-slate-200",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd-MM-yyyy") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  className="text-slate-600 hover:text-red-600"
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {loading ? <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading applications...</p>
          </div> : <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100">
                  <TableHead className="font-semibold text-slate-700">Application ID</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Bank</TableHead>
                  <TableHead className="font-semibold text-slate-700">Loan Amount</TableHead>
                  <TableHead className="font-semibold text-slate-700">Loan Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Applied On</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application, index) => <TableRow key={application.id} className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-slate-100">
                    <TableCell className="font-medium text-slate-800">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{application.applicationNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(getDisplayStatus(application))} font-medium px-3 py-1`}>
                        {getDisplayStatus(application)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{application.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <span>{application.bankName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      {application.amount}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {application.loanType}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{application.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-white border-none" onClick={() => setSelectedApplication(application)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-6 overflow-y-auto rounded-none border-0">
                          <DialogHeader>
                            <div className="flex items-center justify-between">
                              <DialogTitle className="text-xl font-bold text-slate-800">
                                Application Details - {application.applicationNumber}
                              </DialogTitle>
                              <div className="flex items-center space-x-2">
                                {showEmployeeList ? <div className="flex items-center space-x-2">
                                    <Select onValueChange={employeeId => {
                                    const selectedEmployee = employees.find(emp => emp.id === employeeId);
                                    if (selectedEmployee) {
                                      handleAssignWork(employeeId, selectedEmployee.username);
                                      setShowEmployeeList(false);
                                    }
                                  }} disabled={loadingEmployees}>
                                      <SelectTrigger className="w-48 bg-white z-50">
                                        <SelectValue placeholder={loadingEmployees ? "Loading..." : "Select Employee"} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white z-50">
                                        {employees.map(employee => <SelectItem key={employee.id} value={employee.id}>
                                            {employee.username}
                                          </SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm" onClick={() => setShowEmployeeList(false)}>
                                      Cancel
                                    </Button>
                                  </div> : <Button variant="outline" size="sm" onClick={() => {
                                  setShowEmployeeList(true);
                                  fetchEmployees();
                                }} className="flex items-center space-x-2 text-lg font-medium rounded-full px-[20px] my-0 py-[18px] bg-[#009e00] text-white mx-[90px]">
                                    <ArrowUpRight className="h-4 w-4" />
                                    <span>Redirect</span>
                                  </Button>}
                              </div>
                            </div>
                          </DialogHeader>
                          
                          <div className="space-y-6 mt-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-slate-700">Status</h3>
                              <Badge className={`${getStatusColor(getDisplayStatus(application))} font-medium px-3 py-1`}>
                                {getDisplayStatus(application)}
                              </Badge>
                            </div>

                            {/* Applicant Details */}
                            <div className="bg-slate-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Applicant Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Applicant Full Name:</span>
                                  <span className="font-medium">{application.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">District:</span>
                                  <span className="font-medium">{application.district || 'Not specified'}</span>
                                </div>
                                <div className="col-span-2 flex items-start space-x-2">
                                  <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                                  <span className="text-sm text-slate-500">Address:</span>
                                  <span className="font-medium">{application.address || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Taluk:</span>
                                  <span className="font-medium">{application.taluk || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Village:</span>
                                  <span className="font-medium">{application.village || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Property Details */}
                            <div className="bg-green-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Property Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Nature of Property:</span>
                                  <span className="font-medium">{application.nature_of_property || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Location of Property:</span>
                                  <span className="font-medium">{application.location_of_property || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Survey Number:</span>
                                  <span className="font-medium">{application.survey_number || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Extent of Property:</span>
                                  <span className="font-medium">{application.extent_of_property || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Plot No:</span>
                                  <span className="font-medium">{application.plot_no || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Layout Name:</span>
                                  <span className="font-medium">{application.layout_name || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Banking Details */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Banking Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Bank Application No:</span>
                                  <span className="font-medium">{application.bank_application_no || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Product (Loan Type):</span>
                                  <span className="font-medium">{application.loanType}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-slate-500">Loan Amount:</span>
                                  <span className="font-semibold text-emerald-600">{application.amount}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Account Number:</span>
                                  <span className="font-medium">{application.account_number || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Sales Representative Details */}
                            <div className="bg-yellow-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Sales Representative Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Salesman Name:</span>
                                  <span className="font-medium">{application.salesman_name || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Salesman Contact No:</span>
                                  <span className="font-medium">{application.salesman_contact || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Salesman Email:</span>
                                  <span className="font-medium">{application.salesman_email || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Loan Information */}
                            <div className="bg-purple-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Loan Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Bank:</span>
                                  <span className="font-medium">{application.bankName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Application Type:</span>
                                  <span className="font-medium">{application.applicationType}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Submission Date:</span>
                                  <span className="font-medium">{application.date}</span>
                                </div>
                                {application.sanction_date && <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-500">Sanction Date:</span>
                                    <span className="font-medium">{application.sanction_date}</span>
                                  </div>}
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Customer ID:</span>
                                  <span className="font-medium">{application.customer_id || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Phone:</span>
                                  <span className="font-medium">{application.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Email:</span>
                                  <span className="font-medium">{application.email || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                        {/* Assignment Status - Only show for admin */}
                        {application.assigned_to_username && !localStorage.getItem("employeeLogin") && <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Assigned To</h3>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">{application.assigned_to_username}</span>
                            </div>
                          </div>}

                        {/* Assign Work Section - Only show for admin */}
                        {showAssignWork && !localStorage.getItem("employeeLogin") && <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Assign Work to Employee</h3>
                            {loadingEmployees ? <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-slate-600">Loading employees...</p>
                              </div> : employees.length > 0 ? <div className="space-y-2">
                                {employees.map(employee => <div key={employee.id} className="flex items-center justify-between bg-white rounded-lg p-3 border hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-slate-500" />
                                      <span className="font-medium">{employee.username}</span>
                                    </div>
                                    <Button size="sm" onClick={() => handleAssignWork(employee.id, employee.username)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                      Assign
                                    </Button>
                                  </div>)}
                              </div> : <p className="text-slate-600">No active employees found.</p>}
                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" onClick={() => setShowAssignWork(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>}

                        {/* Action Buttons - Only show assign work for admin */}
                        {!showAssignWork && !localStorage.getItem("employeeLogin") && <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button onClick={() => {
                                setShowAssignWork(true);
                                fetchEmployees();
                              }} className="bg-blue-600 hover:bg-blue-700 text-white">
                              <User className="h-4 w-4 mr-2" />
                              Assign Work
                            </Button>
                          </div>}

                        {/* Additional Information */}
                            {application.additional_notes && <div className="bg-yellow-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Additional Notes</h3>
                                <p className="text-slate-600">{application.additional_notes}</p>
                              </div>}

                            {/* Uploaded Files */}
                            {application.uploaded_files && application.uploaded_files.length > 0 && <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Uploaded Documents</h3>
                                <div className="space-y-2">
                                  {application.uploaded_files.map((file: any, index: number) => <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-sm text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                      </div>
                                      <Button size="sm" variant="outline" onClick={() => handleFileView(file)}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>)}
                                </div>
                                
                                {/* Give Opinion Button */}
                                <div className="mt-6 pt-4 border-t border-green-200">
                                  <div className="flex gap-2">
                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                                    window.open('https://docs.google.com', '_blank');
                                  }}>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Work on Google Docs
                                    </Button>
                                    
                                    <div className="flex-1">
                                      <input type="file" id="opinion-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file && selectedApplication) {
                                        handleOpinionUpload(file, selectedApplication.application_id);
                                      }
                                    }} />
                                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => document.getElementById('opinion-upload')?.click()} disabled={uploadingOpinion}>
                                        {uploadingOpinion ? <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload className="h-4 w-4 mr-2" />}
                                        Upload Opinion
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>}

                            {/* Opinion Documents */}
                            {application.opinion_files && application.opinion_files.length > 0 && <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Opinion Documents</h3>
                                <div className="space-y-2">
                                  {application.opinion_files.map((file: any, index: number) => <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                                      <div className="flex items-center space-x-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-sm text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Opinion Uploaded</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleFileView(file, 'opinion-documents')}>
                                          <Download className="h-4 w-4" />
                                        </Button>
                                         {localStorage.getItem('employeeLogin') === 'true' && application.status !== 'submitted' && <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                               <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                 <Trash2 className="h-4 w-4" />
                                               </Button>
                                             </AlertDialogTrigger>
                                             <AlertDialogContent>
                                               <AlertDialogHeader>
                                                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                 <AlertDialogDescription>
                                                   Are you sure you want to delete this file? This action cannot be undone.
                                                 </AlertDialogDescription>
                                               </AlertDialogHeader>
                                               <AlertDialogFooter>
                                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                 <AlertDialogAction onClick={() => handleRemoveOpinion(index, file)} className="bg-red-600 hover:bg-red-700">
                                                   Delete
                                                 </AlertDialogAction>
                                               </AlertDialogFooter>
                                             </AlertDialogContent>
                                           </AlertDialog>}
                                      </div>
                                    </div>)}
                                </div>
                                
                                {/* Submit Opinion Button - Only show if employee is logged in, status is not submitted, and not digitally signed */}
                                {localStorage.getItem('employeeLogin') === 'true' && application.status !== 'submitted' && !application.digital_signature_applied && <div className="mt-4 pt-4 border-t border-blue-200">
                                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setShowSubmitConfirmation(true)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Submit Opinion
                                    </Button>
                                  </div>}
                              </div>}
                            
                            {/* Query Communication Form */}
                            <div className="mt-6">
                              <QueryForm applicationId={application.application_id} currentUserType={localStorage.getItem('employeeLogin') === 'true' ? 'employee' : 'bank'} currentUserName={localStorage.getItem('employeeLogin') === 'true' ? localStorage.getItem('employeeUsername') || 'Employee' : localStorage.getItem('bankUsername') || 'Bank User'} currentUserEmail={localStorage.getItem('employeeLogin') === 'true' ? 'employee@example.com' : application.email} />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>}

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600">
                Are you sure you want to submit your opinion? Once submitted, you won't be able to make changes.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSubmitConfirmation(false)} disabled={submittingOpinion}>
                Cancel
              </Button>
              <Button onClick={handleSubmitOpinion} disabled={submittingOpinion} className="bg-orange-600 hover:bg-orange-700">
                {submittingOpinion ? <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
                Yes, Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* No Results */}
        {!loading && filteredApplications.length === 0 && <div className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No applications found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>}
            </div>
          </main>
        </div>
      </div>
      {/* Download Progress Dialog */}
      {isDownloading && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-[90%] max-w-md">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Downloading File</h3>
                  <p className="text-sm text-muted-foreground">{downloadingFileName}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Please wait while your file is being downloaded...
              </p>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>;
};
export default LoanApplications;