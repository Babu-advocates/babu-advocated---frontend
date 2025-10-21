import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  Search, 
  Calendar, 
  Building2,
  FileText,
  Download,
  Eye,
  Archive
} from "lucide-react";

export default function ReceivedFromBank() {
  // Mock data for received communications
  const receivedMessages = [
    {
      id: 1,
      bankName: "HDFC Bank",
      messageType: "Loan Approval",
      clientName: "John Doe",
      amount: "₹5,00,000",
      dateReceived: "2024-01-16",
      status: "New",
      priority: "High",
      hasAttachment: true,
      subject: "Loan Application Approved - Ref: HDFC001234"
    },
    {
      id: 2,
      bankName: "SBI",
      messageType: "Document Request",
      clientName: "Jane Smith",
      amount: "₹2,50,000",
      dateReceived: "2024-01-15",
      status: "Read",
      priority: "Medium",
      hasAttachment: false,
      subject: "Additional Documents Required for Verification"
    },
    {
      id: 3,
      bankName: "ICICI Bank",
      messageType: "Status Update",
      clientName: "Robert Johnson",
      amount: "₹8,00,000",
      dateReceived: "2024-01-14",
      status: "Responded",
      priority: "Low",
      hasAttachment: true,
      subject: "Loan Processing Status - Under Review"
    },
    {
      id: 4,
      bankName: "Axis Bank",
      messageType: "Recovery Notice",
      clientName: "Sarah Wilson",
      amount: "₹3,75,000",
      dateReceived: "2024-01-12",
      status: "Archived",
      priority: "High",
      hasAttachment: true,
      subject: "Recovery Process Initiated - Legal Action Required"
    },
    {
      id: 5,
      bankName: "Punjab National Bank",
      messageType: "Query Response",
      clientName: "Michael Brown",
      amount: "₹1,20,000",
      dateReceived: "2024-01-10",
      status: "Read",
      priority: "Medium",
      hasAttachment: false,
      subject: "Response to Credit Score Inquiry"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "destructive";
      case "Read": return "secondary";
      case "Responded": return "default";
      case "Archived": return "outline";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-employee-light font-kontora">
        <EmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Received from Bank</h1>
              <p className="text-sm text-muted-foreground">Manage messages and communications from banks</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="destructive" className="animate-pulse">
                {receivedMessages.filter(m => m.status === "New").length} New
              </Badge>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive All Read
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Search and Filter */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by bank name, client, or message type..." 
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="border-employee-red text-employee-red hover:bg-employee-red hover:text-white">
                    Filter
                  </Button>
                  <Button variant="outline">
                    Mark All Read
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages List */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-employee-red" />
                  Inbox
                </CardTitle>
                <CardDescription>Messages and communications from your partner banks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receivedMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                        message.status === "New" 
                          ? "border-employee-red/30 bg-employee-red/5" 
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${
                            message.status === "New" ? "bg-employee-red/20" : "bg-muted"
                          }`}>
                            <FileText className={`h-5 w-5 ${
                              message.status === "New" ? "text-employee-red" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-semibold ${
                                message.status === "New" ? "text-foreground" : "text-muted-foreground"
                              }`}>
                                {message.subject}
                              </h3>
                              {message.hasAttachment && (
                                <div className="flex items-center gap-1 text-employee-red text-xs">
                                  <Download className="h-3 w-3" />
                                  <span>Attachment</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                <span className="font-medium">{message.bankName}</span>
                                <span>•</span>
                                <span>{message.messageType}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span><strong>Client:</strong> {message.clientName}</span>
                                <span><strong>Amount:</strong> {message.amount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Received: {message.dateReceived}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end gap-2 min-w-[200px]">
                          <div className="flex gap-2">
                            <Badge variant={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                            <Badge variant={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {message.hasAttachment && (
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              className="bg-employee-red hover:bg-employee-red-hover text-white"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-employee-red">
                    {receivedMessages.length}
                  </CardTitle>
                  <CardDescription>Total Messages</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-employee-red">
                    {receivedMessages.filter(m => m.status === "New").length}
                  </CardTitle>
                  <CardDescription>Unread</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-employee-red">
                    {receivedMessages.filter(m => m.priority === "High").length}
                  </CardTitle>
                  <CardDescription>High Priority</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-employee-red">
                    {receivedMessages.filter(m => m.hasAttachment).length}
                  </CardTitle>
                  <CardDescription>With Attachments</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}