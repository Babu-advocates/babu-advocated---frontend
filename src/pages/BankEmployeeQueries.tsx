import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HelpCircle, Send, User, FileText, Paperclip, Upload, X, MessageSquare, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface QueryWithApplication {
  id: string;
  application_id: string;
  sender_type: 'employee' | 'bank';
  sender_name: string;
  sender_email?: string;
  message: string;
  attached_files: any[];
  is_read: boolean;
  created_at: string;
  updated_at: string;
  application?: {
    borrower_name: string;
    loan_type: string;
    bank_name: string;
    submitted_by: string;
  };
}

interface ApplicationGroup {
  application: any;
  queries: QueryWithApplication[];
}

function BankEmployeeQueries() {
  const [queries, setQueries] = useState<QueryWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const [attachedFiles, setAttachedFiles] = useState<Record<string, File[]>>({});
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFileName, setDownloadingFileName] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  // Get current user info from localStorage
  const getCurrentUser = () => {
    const isEmployee = localStorage.getItem('employeeLogin') === 'true';
    const isBankEmployee = localStorage.getItem('bankEmployeeLogin') === 'true';
    const isBankManager = localStorage.getItem('bankManagerLogin') === 'true';

    if (isEmployee) {
      return {
        type: 'employee' as const,
        name: localStorage.getItem('employeeUsername') || 'Employee',
        email: localStorage.getItem('employeeEmail') || 'employee@example.com',
        username: localStorage.getItem('employeeUsername') || 'employee'
      };
    } else if (isBankEmployee || isBankManager) {
      return {
        type: 'bank' as const,
        name: localStorage.getItem('bankUsername') || 'Bank Representative',
        email: localStorage.getItem('bankEmail') || 'bank@example.com',
        username: localStorage.getItem('bankUsername') || 'bank',
        bankName: localStorage.getItem('bankName') || ''
      };
    }

    // Fallback
    return {
      type: 'bank' as const,
      name: 'Bank Representative',
      email: 'bank@example.com',
      username: 'bank'
    };
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchQueries();

    // Set up real-time subscription for user-specific queries
    const channel = supabase
      .channel(`user-queries-${currentUser.username}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'queries'
      }, payload => {
        console.log('New query received:', payload);
        
        // Show toast notification if the message is not from the current user
        const newQuery = payload.new as any;
        if (newQuery.sender_type !== currentUser.type || newQuery.sender_name !== currentUser.name) {
          toast({
            title: "New Message",
            description: `New message from ${newQuery.sender_name} on Application ${newQuery.application_id}`,
            variant: "default"
          });
        }
        
        fetchQueries();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'queries'
      }, payload => {
        console.log('Query updated:', payload);
        fetchQueries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.username]);

  const fetchQueries = async () => {
    try {
      setLoading(true);

      // First, get applications that the current user has access to
      let userApplications: string[] = [];
      
      if (currentUser.type === 'employee') {
        // For employees: get applications they submitted
        const { data: empApplications, error: empError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('submitted_by', currentUser.username);
        
        if (empError) {
          console.error('Error fetching employee applications:', empError);
        } else {
          userApplications = empApplications?.map(app => app.application_id) || [];
        }
      } else if (currentUser.type === 'bank') {
        // For bank users: get applications for their bank
        const { data: bankApplications, error: bankError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('bank_name', currentUser.bankName || 'Unknown');
        
        if (bankError) {
          console.error('Error fetching bank applications:', bankError);
          // Fallback: get all applications if bank filtering fails
          const { data: allApps } = await supabase
            .from('applications')
            .select('application_id');
          userApplications = allApps?.map(app => app.application_id) || [];
        } else {
          userApplications = bankApplications?.map(app => app.application_id) || [];
        }
      }

      // If no applications found, don't fetch queries
      if (userApplications.length === 0) {
        setQueries([]);
        setLoading(false);
        return;
      }

      // Fetch queries only for user's applications
      const { data: queriesData, error: queriesError } = await supabase
        .from('queries')
        .select('*')
        .in('application_id', userApplications)
        .order('created_at', { ascending: false });

      if (queriesError) {
        console.error('Error fetching queries:', queriesError);
        toast({
          title: "Error",
          description: "Failed to load queries",
          variant: "destructive"
        });
        return;
      }

      // Fetch application details for the found queries
      const applicationIds = [...new Set(queriesData?.map(q => q.application_id) || [])];
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('application_id, borrower_name, loan_type, bank_name, submitted_by')
        .in('application_id', applicationIds);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      }

      // Combine queries with application data
      const formattedQueries = (queriesData || []).map(query => {
        const application = applicationsData?.find(app => app.application_id === query.application_id);
        return {
          ...query,
          sender_type: query.sender_type as 'employee' | 'bank',
          attached_files: query.attached_files as any[] || [],
          application
        };
      });

      setQueries(formattedQueries);
    } catch (error) {
      console.error('Error in fetchQueries:', error);
      toast({
        title: "Error",
        description: "Failed to load queries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Group queries by application_id
  const applicationGroups = queries.reduce((groups, query) => {
    const appId = query.application_id;
    if (!groups[appId]) {
      groups[appId] = {
        application: query.application,
        queries: []
      };
    }
    groups[appId].queries.push(query);
    return groups;
  }, {} as Record<string, ApplicationGroup>);

  const handleSendMessage = async (applicationId: string) => {
    const message = replyMessages[applicationId]?.trim();
    const files = attachedFiles[applicationId] || [];

    if (!message && files.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a message or attach a file",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);
      let uploadedFiles: any[] = [];

      if (files.length > 0) {
        for (const file of files) {
          const filePath = `${Date.now()}-${file.name}`;
          
          const { data, error } = await supabase.storage
            .from('query-attachments')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw new Error(`Supabase Storage upload failed: ${error.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('query-attachments')
            .getPublicUrl(data.path);

          const json = {
            success: true,
            file: {
              download_url: publicUrl,
              path: data.path
            }
          };

          uploadedFiles.push({
            name: file.name,
            url: json.file.download_url,
            size: file.size,
            type: file.type,
            uploaded_at: new Date().toISOString()
          });
        }
      }

      const { error } = await supabase.from('queries').insert({
        application_id: applicationId,
        sender_type: currentUser.type,
        sender_name: currentUser.name,
        sender_email: currentUser.email,
        message: message || '',
        attached_files: uploadedFiles
      });

      if (error) {
        throw error;
      }

      // Clear the message and files for this application
      setReplyMessages(prev => ({ ...prev, [applicationId]: '' }));
      setAttachedFiles(prev => ({ ...prev, [applicationId]: [] }));

      toast({
        title: "Success",
        description: "Message sent successfully",
        variant: "default"
      });

      // Refresh queries
      fetchQueries();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (applicationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(prev => ({
        ...prev,
        [applicationId]: [...(prev[applicationId] || []), ...Array.from(files)]
      }));
    }
  };

  const removeAttachedFile = (applicationId: string, index: number) => {
    setAttachedFiles(prev => ({
      ...prev,
      [applicationId]: (prev[applicationId] || []).filter((_, i) => i !== index)
    }));
  };

  const handleDownloadFile = async (file: any) => {
    return new Promise<void>(async (resolve, reject) => {
      setIsDownloading(true);
      setDownloadingFileName(file.name);
      setDownloadProgress(0);

      try {
        const SUPABASE_URL = 'https://supabaseforbabu.techverseinfo.tech';
        const SUPABASE_PUBLISHABLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MDcxNTkwMCwiZXhwIjo0OTE2Mzg5NTAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.HgnCghXTEGW8zbkvg6MlEwNpK1GcIzh-OCNBBkfLr8o';
        
        const functionUrl = `${SUPABASE_URL}/functions/v1/proxy-download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.name)}`;

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
            link.download = file.name;
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
                description: `${file.name} downloaded successfully` 
              });
              resolve();
            }, 500);
          } else {
            setIsDownloading(false);
            setDownloadProgress(0);
            toast({ 
              title: 'Download Failed', 
              description: `Failed to download ${file.name}. Status: ${xhr.status}`,
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
            description: `Failed to download ${file.name}. Please check your connection.`,
            variant: 'destructive'
          });
          reject(new Error('Network error'));
        };

        xhr.send();
      } catch (error) {
        console.error('Download error:', error);
        setIsDownloading(false);
        setDownloadProgress(0);
        toast({
          title: 'Error',
          description: `Failed to download ${file.name}`,
          variant: 'destructive'
        });
        reject(error);
      }
    });
  };

  const openQueryModal = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
  };

  const closeQueryModal = () => {
    setSelectedApplicationId(null);
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
                <h1 className="text-2xl font-bold text-gray-900">Queries</h1>
                <p className="text-gray-600">Manage received and sent queries</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading queries...
              </div>
            ) : Object.keys(applicationGroups).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No queries found.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(applicationGroups).map(([applicationId, { application, queries: appQueries }]) => {
                  const unreadCount = appQueries.filter(q => !q.is_read && q.sender_type !== currentUser.type).length;
                  const latestQuery = appQueries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                  
                  return (
                    <Card key={applicationId} className="w-full">
                      {/* Application Header - Clickable to open modal */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => openQueryModal(applicationId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-lg">Application {applicationId}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {application?.borrower_name || 'Unknown'}
                              </span>
                              <span>Loan: {application?.loan_type || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4" />
                              <span>{appQueries.length} messages</span>
                            </div>
                            {latestQuery && (
                              <span className="text-xs text-muted-foreground">
                                Last: {formatDistanceToNow(new Date(latestQuery.created_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Query Communication Modal */}
            {selectedApplicationId && applicationGroups[selectedApplicationId] && (
              <Dialog open={!!selectedApplicationId} onOpenChange={(open) => !open && closeQueryModal()}>
                <DialogContent className="max-w-4xl w-full h-[85vh] max-h-[800px] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Query Communication - Application {selectedApplicationId}
                    </DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {applicationGroups[selectedApplicationId].application?.borrower_name || 'Unknown'}
                        </span>
                        <span>Loan Type: {applicationGroups[selectedApplicationId].application?.loan_type || 'N/A'}</span>
                        <span>Bank: {applicationGroups[selectedApplicationId].application?.bank_name || 'N/A'}</span>
                      </div>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
                    {/* Download Progress Indicator */}
                    {isDownloading && (
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">Downloading {downloadingFileName}</span>
                          <span className="text-sm text-primary">{downloadProgress}%</span>
                        </div>
                        <Progress value={downloadProgress} className="h-2" />
                      </div>
                    )}
                    
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-background my-4">
                      {applicationGroups[selectedApplicationId].queries.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applicationGroups[selectedApplicationId].queries
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((query) => (
                            <div
                              key={query.id}
                              className={`flex ${query.sender_type === currentUser.type ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  query.sender_type === currentUser.type
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4" />
                                  <span className="text-sm font-medium">{query.sender_name}</span>
                                  <span className="text-xs opacity-70">
                                    {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm">{query.message}</p>
                                {query.attached_files && query.attached_files.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {query.attached_files.map((file: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between gap-2 p-2 bg-background/10 rounded-md border border-background/20"
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <Paperclip className="h-3 w-3 flex-shrink-0 opacity-70" />
                                          <span className="text-xs truncate font-medium">{file.name}</span>
                                          <span className="text-xs opacity-70 flex-shrink-0">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                          </span>
                                        </div>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => handleDownloadFile(file)}
                                          disabled={isDownloading && downloadingFileName === file.name}
                                          className="h-7 px-2 gap-1 flex-shrink-0 bg-primary/90 hover:bg-primary text-primary-foreground"
                                        >
                                          <Download className="h-3 w-3" />
                                          <span className="text-xs">
                                            {isDownloading && downloadingFileName === file.name ? 'Downloading...' : 'Download'}
                                          </span>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Input Area */}
                    <div className="flex flex-col border-t pt-4 space-y-4">
                      <Textarea
                        placeholder="Type your message here..."
                        value={replyMessages[selectedApplicationId] || ''}
                        onChange={(e) => setReplyMessages(prev => ({ ...prev, [selectedApplicationId]: e.target.value }))}
                        className="min-h-[80px] resize-none"
                      />
                      
                      {/* Attached Files */}
                      {attachedFiles[selectedApplicationId] && attachedFiles[selectedApplicationId].length > 0 && (
                        <div className="max-h-24 overflow-y-auto">
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">Attached Files:</Label>
                          <div className="space-y-1">
                            {attachedFiles[selectedApplicationId].map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-sm">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Paperclip className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachedFile(selectedApplicationId, index)}
                                  className="h-6 w-6 p-0 shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Always visible at bottom */}
                      <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
                        <div className="shrink-0">
                          <Input
                            type="file"
                            multiple
                            accept="*/*"
                            onChange={(e) => handleFileSelect(selectedApplicationId, e)}
                            className="hidden"
                            id={`file-input-${selectedApplicationId}`}
                          />
                          <Label htmlFor={`file-input-${selectedApplicationId}`} className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Attach Files
                              </span>
                            </Button>
                          </Label>
                        </div>
                        <Button
                          onClick={() => handleSendMessage(selectedApplicationId)}
                          disabled={sending || (!replyMessages[selectedApplicationId]?.trim() && (!attachedFiles[selectedApplicationId] || attachedFiles[selectedApplicationId].length === 0))}
                          size="sm"
                          className="shrink-0"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {sending ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default BankEmployeeQueries;