import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BankManagerSidebar } from "@/components/BankManagerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

// Mock data for case reports
const caseReportsData = [
  {
    id: 1,
    applicationNumber: "APP-2024-001",
    applicantName: "John Doe",
    loanAmount: 500000,
    applicationDate: "2024-01-15",
    status: "Approved",
    processingTime: 15,
    bank: "State Bank of India",
    loanType: "Home Loan",
    interestRate: 8.5,
    disbursementDate: "2024-01-30",
  },
  {
    id: 2,
    applicationNumber: "APP-2024-002",
    applicantName: "Jane Smith",
    loanAmount: 250000,
    applicationDate: "2024-01-14",
    status: "Under Review",
    processingTime: 12,
    bank: "HDFC Bank",
    loanType: "Personal Loan",
    interestRate: 12.0,
    disbursementDate: null,
  },
  {
    id: 3,
    applicationNumber: "APP-2024-003",
    applicantName: "Mike Johnson",
    loanAmount: 1000000,
    applicationDate: "2024-01-13",
    status: "Rejected",
    processingTime: 8,
    bank: "ICICI Bank",
    loanType: "Business Loan",
    interestRate: null,
    disbursementDate: null,
  },
  {
    id: 4,
    applicationNumber: "APP-2024-004",
    applicantName: "Sarah Wilson",
    loanAmount: 750000,
    applicationDate: "2024-01-12",
    status: "Approved",
    processingTime: 18,
    bank: "Axis Bank",
    loanType: "Car Loan",
    interestRate: 9.2,
    disbursementDate: "2024-01-30",
  },
  {
    id: 5,
    applicationNumber: "APP-2024-005",
    applicantName: "David Brown",
    loanAmount: 300000,
    applicationDate: "2024-01-11",
    status: "Pending",
    processingTime: 5,
    bank: "Punjab National Bank",
    loanType: "Education Loan",
    interestRate: 7.5,
    disbursementDate: null,
  },
];

const summaryStats = {
  totalApplications: 145,
  approvedApplications: 89,
  rejectedApplications: 23,
  pendingApplications: 33,
  totalDisbursed: 45750000,
  averageProcessingTime: 14.2,
  approvalRate: 61.4,
};

const ReportsAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBank, setFilterBank] = useState("all");
  const [filterLoanType, setFilterLoanType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const filteredReports = caseReportsData.filter((report) => {
    const matchesSearch = 
      report.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || report.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesBank = filterBank === "all" || report.bank === filterBank;
    const matchesLoanType = filterLoanType === "all" || report.loanType === filterLoanType;

    return matchesSearch && matchesStatus && matchesBank && matchesLoanType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Approved": { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      "Rejected": { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
      "Under Review": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      "Pending": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge variant="outline" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const handleDownloadReport = (format: string) => {
    // In a real application, this would generate and download the actual report
    const filename = `case_reports_${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Downloading ${filename}...`);
    
    // Mock download functionality
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(filteredReports, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadSingleReport = (report: any) => {
    const filename = `${report.applicationNumber}_report.json`;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(report, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <BankManagerSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive case reports and analytics dashboard</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDownloadReport('csv')} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button onClick={() => handleDownloadReport('pdf')} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary Dashboard</TabsTrigger>
                <TabsTrigger value="reports">Case Reports</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summaryStats.totalApplications}</div>
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summaryStats.approvalRate}%</div>
                      <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{(summaryStats.totalDisbursed / 10000000).toFixed(1)}Cr</div>
                      <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                      <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summaryStats.averageProcessingTime} days</div>
                      <p className="text-xs text-muted-foreground">-1.2 days from last month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Approved
                        </span>
                        <span className="font-semibold">{summaryStats.approvedApplications}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Rejected
                        </span>
                        <span className="font-semibold">{summaryStats.rejectedApplications}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Pending
                        </span>
                        <span className="font-semibold">{summaryStats.pendingApplications}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">APP-2024-001</span> was approved
                          <span className="text-gray-500 block">2 hours ago</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">APP-2024-005</span> is under review
                          <span className="text-gray-500 block">5 hours ago</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">APP-2024-003</span> was rejected
                          <span className="text-gray-500 block">1 day ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filter Reports</CardTitle>
                    <CardDescription>Filter case reports by various criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="under review">Under Review</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterBank} onValueChange={setFilterBank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Banks</SelectItem>
                          <SelectItem value="State Bank of India">SBI</SelectItem>
                          <SelectItem value="HDFC Bank">HDFC</SelectItem>
                          <SelectItem value="ICICI Bank">ICICI</SelectItem>
                          <SelectItem value="Axis Bank">Axis Bank</SelectItem>
                          <SelectItem value="Punjab National Bank">PNB</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterLoanType} onValueChange={setFilterLoanType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Loan Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Home Loan">Home Loan</SelectItem>
                          <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                          <SelectItem value="Business Loan">Business Loan</SelectItem>
                          <SelectItem value="Car Loan">Car Loan</SelectItem>
                          <SelectItem value="Education Loan">Education Loan</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Case Reports</CardTitle>
                        <CardDescription>Showing {filteredReports.length} of {caseReportsData.length} reports</CardDescription>
                      </div>
                      <Button onClick={() => handleDownloadReport('xlsx')} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application No.</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Loan Amount</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead>Loan Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Processing Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.applicationNumber}</TableCell>
                            <TableCell>{report.applicantName}</TableCell>
                            <TableCell>₹{report.loanAmount.toLocaleString()}</TableCell>
                            <TableCell>{report.bank}</TableCell>
                            <TableCell>{report.loanType}</TableCell>
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                            <TableCell>{report.processingTime} days</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadSingleReport(report)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Average Approval Time</span>
                        <span className="font-semibold">12.5 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Customer Satisfaction</span>
                        <span className="font-semibold">4.2/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Document Completion Rate</span>
                        <span className="font-semibold">87%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Applications This Month</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">+15%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Approval Rate Trend</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">+3.2%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Processing Time Trend</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">-8%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ReportsAnalytics;