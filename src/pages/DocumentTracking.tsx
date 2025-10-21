import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BankManagerSidebar } from "@/components/BankManagerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";

export default function DocumentTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for documents
  const documentsData = [
    {
      applicationNo: "APP001234",
      clientName: "John Smith",
      dateSubmitted: "2024-01-15",
      documentType: "Loan Legal Opinion",
      status: "In Review",
      advocate: "Sharma & Associates",
      daysElapsed: 5
    },
    {
      applicationNo: "APP001236",
      clientName: "Robert Davis",
      dateSubmitted: "2024-01-12",
      documentType: "Loan Recovery",
      status: "Pending",
      advocate: "Corporate Law Firm",
      daysElapsed: 8
    },
    {
      applicationNo: "APP001237",
      clientName: "Sarah Wilson",
      dateSubmitted: "2024-01-10",
      documentType: "Loan Legal Opinion",
      status: "Delayed",
      advocate: "Metro Legal Services",
      daysElapsed: 10
    },
    {
      applicationNo: "APP001239",
      clientName: "Lisa Anderson",
      dateSubmitted: "2024-01-05",
      documentType: "Loan Recovery",
      status: "Completed",
      advocate: "Legal Solutions LLP",
      daysElapsed: 15
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in review':
        return <RefreshCw className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredDocuments = documentsData.filter(doc => {
    const matchesSearch = doc.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: documentsData.length,
    pending: documentsData.filter(d => d.status === 'Pending').length,
    inReview: documentsData.filter(d => d.status === 'In Review').length,
    completed: documentsData.filter(d => d.status === 'Completed').length,
    delayed: documentsData.filter(d => d.status === 'Delayed').length,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <BankManagerSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Document Tracking</h1>
              <p className="text-sm text-muted-foreground">Track documents submitted to advocates</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                      <p className="text-2xl font-bold">{statusCounts.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Review</p>
                      <p className="text-2xl font-bold text-blue-600">{statusCounts.inReview}</p>
                    </div>
                    <RefreshCw className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                      <p className="text-2xl font-bold text-red-600">{statusCounts.delayed}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>Document List</CardTitle>
                    <CardDescription>All documents submitted to advocates</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Application No</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Client Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date Submitted</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Document Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Days Elapsed</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.applicationNo} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-blue-600">{doc.applicationNo}</td>
                          <td className="py-3 px-4 text-gray-700">{doc.clientName}</td>
                          <td className="py-3 px-4 text-gray-600">{doc.dateSubmitted}</td>
                          <td className="py-3 px-4 text-gray-700">{doc.documentType}</td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(doc.status)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(doc.status)}
                              {doc.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <span className={doc.daysElapsed > 7 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                              {doc.daysElapsed} days
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}