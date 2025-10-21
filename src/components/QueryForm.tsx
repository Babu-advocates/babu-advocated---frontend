import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Upload, Download, User, Clock, Paperclip, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Query {
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
}

interface QueryFormProps {
  applicationId: string;
  currentUserType: 'employee' | 'bank';
  currentUserName: string;
  currentUserEmail?: string;
}

export function QueryForm({ applicationId, currentUserType, currentUserName, currentUserEmail }: QueryFormProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFileName, setDownloadingFileName] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
    
    // Set up shared real-time subscription for this application
    const channelName = `queries-${applicationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'queries',
          filter: `application_id=eq.${applicationId}`
        },
        (payload) => {
          console.log('New query received:', payload);
          if (payload.new) {
            const newQuery = {
              ...payload.new,
              sender_type: payload.new.sender_type as 'employee' | 'bank',
              attached_files: (payload.new.attached_files as any[]) || []
            } as Query;
            
            setQueries(prev => {
              // Check if message already exists to avoid duplicates
              const existingIndex = prev.findIndex(q => q.id === newQuery.id);
              if (existingIndex !== -1) return prev;
              
              // For sender's own messages, replace optimistic update if it exists
              const tempMessageIndex = prev.findIndex(q => 
                q.id.startsWith('temp-') && 
                q.message === newQuery.message && 
                q.sender_type === newQuery.sender_type &&
                q.sender_name === newQuery.sender_name
              );
              
              if (tempMessageIndex !== -1) {
                // Replace optimistic message with real one
                return prev.map((q, index) => 
                  index === tempMessageIndex ? newQuery : q
                ).sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              }
              
              // Add new message for all users (including receivers)
              return [...prev, newQuery].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
            
            // Auto-scroll to bottom for all users
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'queries',
          filter: `application_id=eq.${applicationId}`
        },
        (payload) => {
          console.log('Query updated:', payload);
          if (payload.new) {
            const updatedQuery = {
              ...payload.new,
              sender_type: payload.new.sender_type as 'employee' | 'bank',
              attached_files: (payload.new.attached_files as any[]) || []
            } as Query;
            setQueries(prev => prev.map(q => q.id === updatedQuery.id ? updatedQuery : q));
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelName}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to queries real-time updates for both parties');
        }
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  // Remove automatic scroll on queries change to prevent unwanted scrolling when opening dialog

  const scrollToBottom = () => {
    // Use scrollIntoView with block: 'nearest' to prevent parent scroll
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  const fetchQueries = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching queries:', error);
        return;
      }

      setQueries((data || []).map(query => ({
        ...query,
        sender_type: query.sender_type as 'employee' | 'bank',
        attached_files: (query.attached_files as any[]) || []
      })));
    } catch (error) {
      console.error('Error in fetchQueries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<any[]> => {
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Upload to Supabase Storage
        const filePath = `${Date.now()}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('query-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Error uploading file to Supabase Storage:', error);
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('query-attachments')
          .getPublicUrl(data.path);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type,
          path: data.path,
          uploaded_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }

    return uploadedFiles;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a message or attach a file",
        variant: "destructive",
      });
      return;
    }

    // Create optimistic message for instant UI update (WhatsApp-like)
    const optimisticMessage: Query = {
      id: `temp-${Date.now()}`,
      application_id: applicationId,
      sender_type: currentUserType,
      sender_name: currentUserName,
      sender_email: currentUserEmail,
      message: newMessage.trim(),
      attached_files: [],
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      setSending(true);
      setUploading(attachedFiles.length > 0);

      let uploadedFiles: any[] = [];
      if (attachedFiles.length > 0) {
        uploadedFiles = await uploadFiles(attachedFiles);
        optimisticMessage.attached_files = uploadedFiles;
      }

      // Add optimistic message immediately for sender
      setQueries(prev => [...prev, optimisticMessage]);
      
      // Clear input immediately for better UX
      const messageToSend = newMessage.trim();
      setNewMessage("");
      setAttachedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Auto-scroll immediately
      setTimeout(() => {
        scrollToBottom();
      }, 50);

      // Send to database
      const { data, error } = await supabase
        .from('queries')
        .insert({
          application_id: applicationId,
          sender_type: currentUserType,
          sender_name: currentUserName,
          sender_email: currentUserEmail,
          message: messageToSend,
          attached_files: uploadedFiles
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setQueries(prev => prev.filter(q => q.id !== optimisticMessage.id));
        // Restore the message in input
        setNewMessage(messageToSend);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      // Replace optimistic message with real message
      if (data) {
        setQueries(prev => prev.map(q => 
          q.id === optimisticMessage.id 
            ? {
                ...data,
                sender_type: data.sender_type as 'employee' | 'bank',
                attached_files: (data.attached_files as any[]) || []
              } as Query
            : q
        ));
      }

      toast({
        title: "Success",
        description: "Message sent successfully",
        variant: "default",
      });

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      // Remove optimistic message on error
      setQueries(prev => prev.filter(q => q.id !== optimisticMessage.id));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleDownloadFile = async (file: any, e?: React.MouseEvent) => {
    // Prevent default link behavior and event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    return new Promise<void>(async (resolve, reject) => {
      setIsDownloading(true);
      setDownloadingFileName(file.name);
      setDownloadProgress(0);

      try {
        const functionUrl = `https://iyizrpyjtkmpefaqzeth.supabase.co/functions/v1/proxy-download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.name)}`;

        // Get the current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', functionUrl, true);
        xhr.responseType = 'blob';
        
        // Add authentication headers
        if (session?.access_token) {
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        } else {
          xhr.setRequestHeader('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5aXpycHlqdGttcGVmYXF6ZXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDcwMjcsImV4cCI6MjA3MzA4MzAyN30.oHQmdNGORBegLFOAnyO0hrl93yeKy_mVcWC88npqFPU`);
        }
        xhr.setRequestHeader('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5aXpycHlqdGttcGVmYXF6ZXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDcwMjcsImV4cCI6MjA3MzA4MzAyN30.oHQmdNGORBegLFOAnyO0hrl93yeKy_mVcWC88npqFPU');

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Query Communication
        </CardTitle>
        <CardDescription>
          Communicate with the {currentUserType === 'employee' ? 'bank' : 'assigned employee'} about this application. Messages are isolated to this application and only visible to involved parties.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Progress Popup */}
        {isDownloading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-background border rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Download className="h-6 w-6 text-primary animate-bounce" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Downloading File</h3>
                    <p className="text-sm text-muted-foreground truncate">{downloadingFileName}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2.5" />
                </div>

                {downloadProgress === 100 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-fade-in">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Finalizing download...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Thread */}
        <div className="border rounded-lg">
          <ScrollArea className="h-[300px] p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading messages...
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages yet. Start a conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {queries.map((query, index) => (
                  <div key={query.id} className="space-y-2">
                    <div className={`flex ${query.sender_type === currentUserType ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        query.sender_type === currentUserType 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">{query.sender_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {query.sender_type === 'employee' ? 'Employee' : 'Bank'}
                          </Badge>
                        </div>
                        
                        {query.message && (
                          <p className="text-sm mb-2 whitespace-pre-wrap">{query.message}</p>
                        )}
                        
                        {query.attached_files && query.attached_files.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {query.attached_files.map((file: any, fileIndex: number) => (
                              <div
                                key={fileIndex}
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
                                  onClick={(e) => handleDownloadFile(file, e)}
                                  disabled={isDownloading && downloadingFileName === file.name}
                                  className="h-7 px-2 gap-1 bg-primary/90 text-primary-foreground hover:bg-primary transition-colors flex-shrink-0 disabled:opacity-50"
                                >
                                  {isDownloading && downloadingFileName === file.name ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Download className="h-3 w-3" />
                                  )}
                                  <span className="text-xs">
                                    {isDownloading && downloadingFileName === file.name ? 'Downloading...' : 'Download'}
                                  </span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {index < queries.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Composer */}
        <div className="space-y-3">
          {/* File Attachments */}
          {attachedFiles.length > 0 && (
            <div className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Attached Files:</div>
              <div className="space-y-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttachedFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px]"
          />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sending || uploading || (!newMessage.trim() && attachedFiles.length === 0)}
            >
              {uploading ? (
                <>Uploading Files...</>
              ) : sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}