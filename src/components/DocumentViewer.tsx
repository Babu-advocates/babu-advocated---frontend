import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Calendar, User, Building2, FileText, Download, Eye, DollarSign, Clock, MessageSquare, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { showToast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://supabaseforbabu.techverseinfo.tech";
const SUPABASE_PUBLISHABLE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MDcxNTkwMCwiZXhwIjo0OTE2Mzg5NTAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.HgnCghXTEGW8zbkvg6MlEwNpK1GcIzh-OCNBBkfLr8o";

import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onApplicationUpdate?: () => void;
}

export const DocumentViewer = ({ isOpen, onClose, application, onApplicationUpdate }: DocumentViewerProps) => {
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFileName, setDownloadingFileName] = useState("");
  
  if (!application) return null;

const downloadFile = async (url: string, fileName: string) => {
    return new Promise<void>(async (resolve, reject) => {
      setIsDownloading(true);
      setDownloadingFileName(fileName);
      setDownloadProgress(0);

      const functionUrl = `${SUPABASE_URL}/functions/v1/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;

      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', functionUrl, true);
      xhr.responseType = 'blob';
      
      // Add authentication headers for private function access
      if (session?.access_token) {
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
      } else {
        // Fallback to public anon key when no user session exists
        xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_PUBLISHABLE_KEY}`);
      }
      // Supabase also expects the apikey header
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
            toast({ title: 'Success', description: `${fileName} downloaded successfully` });
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
          description: 'Unable to download file inside the app. Please try again.',
          variant: 'destructive' 
        });
        reject(new Error('Download failed'));
      };

      xhr.send();
    });
  };

  const handleDownloadOpinion = async (opinionFile: any) => {
    try {
      console.log('Attempting to download opinion file:', opinionFile);
      const fileName = opinionFile?.name || 'opinion-document.pdf';
      
      // Priority 1: Check if file has a direct Backblaze URL
      if (opinionFile?.url) {
        console.log('Using direct Backblaze URL:', opinionFile.url);
        await downloadFile(opinionFile.url, fileName);
        return;
      }

      // Priority 2: Check if file has a storage path (for Supabase Storage files)
      if (opinionFile?.path && !opinionFile?.url) {
        console.log('Attempting to use Supabase storage path:', opinionFile.path);
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('opinion-documents')
          .createSignedUrl(opinionFile.path, 3600);

        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast({ 
            title: 'Error', 
            description: 'File storage configuration error. Please contact support.', 
            variant: 'destructive' 
          });
          return;
        }

        if (signedUrlData?.signedUrl) {
          console.log('Using signed URL:', signedUrlData.signedUrl);
          await downloadFile(signedUrlData.signedUrl, fileName);
          return;
        }
      }

      console.log('No valid URL or path found for opinion file');
      toast({ 
        title: 'Error', 
        description: 'File URL not found. Please re-upload the document.', 
        variant: 'destructive' 
      });
    } catch (error) {
      console.error('Error downloading opinion:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to download opinion document', 
        variant: 'destructive' 
      });
    }
  };

  const handleDownloadUploaded = async (uploadedFile: any) => {
    try {
      console.log('Attempting to download uploaded file:', uploadedFile);
      const fileName = uploadedFile?.name || 'uploaded-document.pdf';
      
      // Priority 1: Check if file has a direct Backblaze URL
      if (uploadedFile?.url) {
        console.log('Using direct Backblaze URL:', uploadedFile.url);
        await downloadFile(uploadedFile.url, fileName);
        return;
      }

      // Priority 2: Check if file has a storage path (for Supabase Storage files)
      if (uploadedFile?.path && !uploadedFile?.url) {
        console.log('Attempting to use Supabase storage path:', uploadedFile.path);
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('application-documents')
          .createSignedUrl(uploadedFile.path, 3600);

        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast({ 
            title: 'Error', 
            description: 'File storage configuration error. Please contact support.', 
            variant: 'destructive' 
          });
          return;
        }

        if (signedUrlData?.signedUrl) {
          console.log('Using signed URL:', signedUrlData.signedUrl);
          await downloadFile(signedUrlData.signedUrl, fileName);
          return;
        }
      }

      console.log('No valid URL or path found for uploaded file');
      toast({ 
        title: 'Error', 
        description: 'File URL not found. Please re-upload the document.', 
        variant: 'destructive' 
      });
    } catch (error) {
      console.error('Error downloading uploaded file:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to download uploaded document', 
        variant: 'destructive' 
      });
    }
  };

  const handleDownload = () => {
    // Download the first opinion file if available
    if (application.opinion_files && application.opinion_files.length > 0) {
      handleDownloadOpinion(application.opinion_files[0]);
    } else {
      toast({ title: 'No Opinion', description: 'No opinion document available for download', variant: 'destructive' });
    }
  };

  const handleViewDocument = () => {
    // View the first opinion file if available
    if (application.opinion_files && application.opinion_files.length > 0) {
      const opinionFile = application.opinion_files[0];
      if (opinionFile?.url) {
        window.open(opinionFile.url, '_blank');
      } else {
        toast({ title: 'No Opinion', description: 'No opinion document available to view', variant: 'destructive' });
      }
    } else {
      toast({ title: 'No Opinion', description: 'No opinion document available to view', variant: 'destructive' });
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) {
        console.error('Error approving application:', error);
        toast({
          title: "Error",
          description: "Failed to approve application",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Application approved successfully",
      });

      onApplicationUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_for_approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
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

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-6 overflow-y-auto rounded-none border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Legal Opinion Document - {application.application_id}</span>
            </DialogTitle>
            <DialogDescription>
              View and download legal opinion documents and details
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(application.status)}>
              {application.status === 'waiting_for_approval' ? 'Waiting for approval' : 
               application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
            </Badge>
            <div className="flex space-x-2">
              {application.status === 'waiting_for_approval' && (
                <Button 
                  onClick={handleApprove} 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isApproving}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </Button>
              )}
              <Button onClick={handleDownload} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Separator />

          {/* Application Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Application ID</p>
                    <p className="text-sm text-gray-600">{application.application_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Name</p>
                    <p className="text-sm text-gray-600">{application.bank_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Application Type</p>
                    <p className="text-sm text-gray-600">{application.application_type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(application.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Applicant Full Name</p>
                    <p className="text-sm text-gray-600">{application.borrower_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer ID</p>
                    <p className="text-sm text-gray-600">{application.customer_id || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{application.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{application.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{application.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">District</p>
                    <p className="text-sm text-gray-600">{application.district || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Taluk</p>
                    <p className="text-sm text-gray-600">{application.taluk || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Village</p>
                    <p className="text-sm text-gray-600">{application.village || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nature of Property</p>
                    <p className="text-sm text-gray-600">{application.nature_of_property || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location of Property</p>
                    <p className="text-sm text-gray-600">{application.location_of_property || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Survey Number</p>
                    <p className="text-sm text-gray-600">{application.survey_number || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Extent of Property</p>
                    <p className="text-sm text-gray-600">{application.extent_of_property || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Plot No</p>
                    <p className="text-sm text-gray-600">{application.plot_no || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Layout Name</p>
                    <p className="text-sm text-gray-600">{application.layout_name || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Application No</p>
                    <p className="text-sm text-gray-600">{application.bank_application_no || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Loan Type</p>
                    <p className="text-sm text-gray-600">{application.loan_type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Loan Amount</p>
                    <p className="text-sm text-gray-600">₹{parseFloat(application.loan_amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Number</p>
                    <p className="text-sm text-gray-600">{application.account_number || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Rep Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Rep Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Rep Name</p>
                    <p className="text-sm text-gray-600">{application.salesman_name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Rep Contact No</p>
                    <p className="text-sm text-gray-600">{application.salesman_contact || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Rep Email</p>
                    <p className="text-sm text-gray-600">{application.salesman_email || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Submission Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Submitted By:</span>
                <span className="text-sm text-gray-600">{application.submitted_by}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Branch Code:</span>
                <span className="text-sm text-gray-600">{application.branch_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <Badge variant="outline" className="text-xs">
                  {application.priority || 'Normal'}
                </Badge>
              </div>
            </div>
          </div>

           {/* Uploaded Documents by Bank Employee */}
           {application.uploaded_files && application.uploaded_files.length > 0 && (
             <div className="space-y-3">
               <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
               <div className="border border-gray-200 rounded-lg p-4">
                 <p className="text-sm text-gray-600 mb-3">Documents uploaded by bank employee</p>
                 <div className="space-y-2">
                   {application.uploaded_files.map((file: any, index: number) => (
                     <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div className="flex items-center space-x-3">
                         <FileText className="h-5 w-5 text-blue-600" />
                         <div>
                           <p className="font-medium text-gray-900">{file.name || `Document ${index + 1}`}</p>
                           <p className="text-sm text-gray-600">
                             {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF Format'}
                           </p>
                         </div>
                       </div>
                       <Button 
                         onClick={() => handleDownloadUploaded(file)} 
                         size="sm" 
                         variant="outline"
                         className="gap-2"
                       >
                         <Download className="h-4 w-4" />
                         Download
                       </Button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {/* Document Information */}
           <div className="space-y-3">
             <h3 className="text-lg font-medium text-gray-900">Legal Opinion Document</h3>
             <div className="border border-gray-200 rounded-lg p-4">
               <div className="flex items-center space-x-3 mb-3">
                 <FileText className="h-8 w-8 text-blue-600" />
                 <div>
                   <p className="font-medium text-gray-900">Legal Opinion Document</p>
                   <p className="text-sm text-gray-600">PDF Format • Last updated today</p>
                 </div>
               </div>
               <div className="flex space-x-2 mb-4">
                 <Button onClick={handleDownload} size="sm" className="w-full">
                   <Download className="h-4 w-4 mr-2" />
                   Download PDF
                 </Button>
               </div>
               
               {/* Opinion Files List */}
               {application.opinion_files && application.opinion_files.length > 0 && (
                 <div className="space-y-2">
                   <p className="text-sm font-medium text-gray-700">Available Opinion Documents:</p>
                   {application.opinion_files.map((file: any, index: number) => (
                     <div key={index} className="p-2 bg-gray-50 rounded">
                       <span className="text-sm text-gray-600">{file.name}</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>

          {/* Additional Notes */}
          {application.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{application.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};