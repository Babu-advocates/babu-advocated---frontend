import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Plus, 
  Search, 
  Calendar, 
  Building2,
  FileText,
  Clock,
  User,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function RequestToBank() {
  // Mock data for sent requests
  const sentRequests = [
    {
      id: 1,
      bankName: "HDFC Bank",
      requestType: "Loan Verification",
      clientName: "John Doe",
      applicationNumber: "LA-2024-001",
      dateSent: "2024-01-15",
      status: "Pending Response",
      priority: "High"
    },
    {
      id: 2,
      bankName: "SBI",
      requestType: "Document Verification",
      clientName: "Jane Smith",
      applicationNumber: "LA-2024-002",
      dateSent: "2024-01-12",
      status: "In Review",
      priority: "Medium"
    },
    {
      id: 3,
      bankName: "ICICI Bank",
      requestType: "Loan Status Update",
      clientName: "Robert Johnson",
      applicationNumber: "LA-2024-003",
      dateSent: "2024-01-10",
      status: "Approved",
      priority: "Low"
    },
    {
      id: 4,
      bankName: "Axis Bank",
      requestType: "Recovery Process",
      clientName: "Sarah Wilson",
      applicationNumber: "LA-2024-004",
      dateSent: "2024-01-08",
      status: "Rejected",
      priority: "High"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Response": return "secondary";
      case "In Review": return "outline";
      case "Approved": return "default";
      case "Rejected": return "destructive";
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
      <div className="min-h-screen flex w-full bg-gradient-employee-light font-kontora relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-employee-red/10 to-justice-gold/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-court-purple/10 to-employee-red/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <EmployeeSidebar />
        
        <div className="flex-1 flex flex-col relative z-10">
          {/* Enhanced Header */}
          <header className="h-20 border-b border-border/20 bg-card/80 backdrop-blur-md flex items-center px-6 gap-4 shadow-card">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors duration-200" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-employee-red to-employee-red-hover bg-clip-text text-transparent">
                Request to Bank
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Send requests and track communications with banks</p>
            </div>
            <Button className="bg-gradient-to-r from-employee-red to-employee-red-hover hover:from-employee-red-hover hover:to-employee-red text-white shadow-elegant hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 p-8 space-y-8">
            {/* New Request Form with enhanced styling */}
            <Card className="border-0 shadow-elegant bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-glow transition-all duration-500 group">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3 group-hover:text-employee-red transition-colors duration-300">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-employee-red/10 to-employee-red/20 group-hover:from-employee-red/20 group-hover:to-employee-red/30 transition-all duration-300">
                    <Send className="h-6 w-6 text-employee-red" />
                  </div>
                  Create New Request
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">Send a new request to your partner banks with ease</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-employee-red" />
                      Bank Name
                    </label>
                    <Input placeholder="Select or type bank name..." className="border-border/50 focus:border-employee-red/50 focus:ring-employee-red/20 transition-all duration-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-employee-red" />
                      Request Type
                    </label>
                    <Input placeholder="e.g., Loan Verification, Document Check..." className="border-border/50 focus:border-employee-red/50 focus:ring-employee-red/20 transition-all duration-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-employee-red" />
                      Client Name
                    </label>
                    <Input placeholder="Enter client name..." className="border-border/50 focus:border-employee-red/50 focus:ring-employee-red/20 transition-all duration-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-employee-red" />
                      Application Number
                    </label>
                    <Input placeholder="e.g., LA-2024-001..." className="border-border/50 focus:border-employee-red/50 focus:ring-employee-red/20 transition-all duration-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-employee-red" />
                    Request Details
                  </label>
                  <Textarea 
                    placeholder="Provide detailed information about your request..."
                    className="min-h-[120px] border-border/50 focus:border-employee-red/50 focus:ring-employee-red/20 transition-all duration-200 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="bg-gradient-to-r from-employee-red to-employee-red-hover hover:from-employee-red-hover hover:to-employee-red text-white shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none">
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                  <Button variant="outline" className="border-employee-red/30 text-employee-red hover:bg-employee-red/10 transition-all duration-200">
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Search and Filter */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-elegant transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-employee-red transition-colors duration-200" />
                    <Input 
                      placeholder="Search by bank name, client, or request type..." 
                      className="pl-12 h-12 border-border/50 focus:border-employee-red/50 focus:ring-employee-red/20 transition-all duration-200 text-base"
                    />
                  </div>
                  <Button variant="outline" className="h-12 px-6 border-employee-red/30 text-employee-red hover:bg-gradient-to-r hover:from-employee-red hover:to-employee-red-hover hover:text-white border-2 transition-all duration-300 transform hover:scale-105">
                    <Search className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Sent Requests */}
            <Card className="border-0 shadow-elegant bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-employee-red/10 to-employee-red/20">
                    <Clock className="h-6 w-6 text-employee-red" />
                  </div>
                  Sent Requests
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">Track your requests and their status in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sentRequests.map((request, index) => (
                    <div 
                      key={request.id} 
                      className="p-6 rounded-xl border border-border/30 bg-gradient-to-r from-muted/20 via-card to-muted/10 hover:from-muted/30 hover:via-card/90 hover:to-muted/20 shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-[1.02] group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-6">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-employee-red/10 via-employee-red/15 to-employee-red/20 group-hover:from-employee-red/15 group-hover:via-employee-red/20 group-hover:to-employee-red/25 transition-all duration-300">
                            <FileText className="h-6 w-6 text-employee-red" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-2 text-lg group-hover:text-employee-red transition-colors duration-200">{request.requestType}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="p-1 rounded bg-employee-red/10">
                                  <Building2 className="h-4 w-4 text-employee-red" />
                                </div>
                                <span className="font-medium">{request.bankName}</span>
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="p-1 rounded bg-employee-red/10">
                                  <User className="h-4 w-4 text-employee-red" />
                                </div>
                                <span><strong className="text-foreground">Client:</strong> {request.clientName}</span>
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="p-1 rounded bg-employee-red/10">
                                  <FileText className="h-4 w-4 text-employee-red" />
                                </div>
                                <span><strong className="text-foreground">App No:</strong> {request.applicationNumber}</span>
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="p-1 rounded bg-employee-red/10">
                                  <Calendar className="h-4 w-4 text-employee-red" />
                                </div>
                                <span><strong className="text-foreground">Sent:</strong> {request.dateSent}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end gap-4">
                          <div className="flex gap-3">
                            <Badge variant={getStatusColor(request.status)} className="px-3 py-1 text-xs font-semibold">
                              {request.status}
                            </Badge>
                            <Badge variant={getPriorityColor(request.priority)} className="px-3 py-1 text-xs font-semibold">
                              {request.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button size="sm" variant="outline" className="border-employee-red/30 text-employee-red hover:bg-employee-red/10 transition-all duration-200">
                              <FileText className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-employee-red to-employee-red-hover hover:from-employee-red-hover hover:to-employee-red text-white shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Follow Up
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-elegant bg-gradient-to-br from-card via-card/95 to-employee-red/5 hover:shadow-glow transition-all duration-500 transform hover:scale-105 group">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-employee-red/10 to-employee-red/20 flex items-center justify-center mb-3 group-hover:from-employee-red/20 group-hover:to-employee-red/30 transition-all duration-300">
                    <FileText className="h-8 w-8 text-employee-red" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-employee-red to-employee-red-hover bg-clip-text text-transparent">
                    {sentRequests.length}
                  </CardTitle>
                  <CardDescription className="font-semibold">Total Requests</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-elegant bg-gradient-to-br from-card via-card/95 to-justice-gold/5 hover:shadow-glow transition-all duration-500 transform hover:scale-105 group">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-justice-gold/10 to-justice-gold/20 flex items-center justify-center mb-3 group-hover:from-justice-gold/20 group-hover:to-justice-gold/30 transition-all duration-300">
                    <Clock className="h-8 w-8 text-justice-gold" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-justice-gold to-prestige-amber bg-clip-text text-transparent">
                    {sentRequests.filter(r => r.status === "Pending Response" || r.status === "In Review").length}
                  </CardTitle>
                  <CardDescription className="font-semibold">Pending</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-elegant bg-gradient-to-br from-card via-card/95 to-law-emerald/5 hover:shadow-glow transition-all duration-500 transform hover:scale-105 group">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-law-emerald/10 to-law-emerald/20 flex items-center justify-center mb-3 group-hover:from-law-emerald/20 group-hover:to-law-emerald/30 transition-all duration-300">
                    <CheckCircle className="h-8 w-8 text-law-emerald" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-law-emerald to-law-emerald bg-clip-text text-transparent">
                    {sentRequests.filter(r => r.status === "Approved").length}
                  </CardTitle>
                  <CardDescription className="font-semibold">Approved</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-elegant bg-gradient-to-br from-card via-card/95 to-court-purple/5 hover:shadow-glow transition-all duration-500 transform hover:scale-105 group">
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-court-purple/10 to-court-purple/20 flex items-center justify-center mb-3 group-hover:from-court-purple/20 group-hover:to-court-purple/30 transition-all duration-300">
                    <AlertTriangle className="h-8 w-8 text-court-purple" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-court-purple to-court-purple bg-clip-text text-transparent">
                    {sentRequests.filter(r => r.priority === "High").length}
                  </CardTitle>
                  <CardDescription className="font-semibold">High Priority</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}