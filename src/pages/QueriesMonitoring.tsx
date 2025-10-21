import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BankManagerSidebar } from "@/components/BankManagerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";

// Mock data for queries
const queriesData = [
  {
    id: 1,
    applicationNumber: "APP-2024-001",
    applicantName: "John Doe",
    queryDate: "2024-01-15",
    querySubject: "Interest Rate Clarification",
    queryText: "I need clarification on the interest rate mentioned in my loan application documents.",
    isReplied: false,
    priority: "Medium",
  },
  {
    id: 2,
    applicationNumber: "APP-2024-002",
    applicantName: "Jane Smith",
    queryDate: "2024-01-14",
    querySubject: "Document Submission Status",
    queryText: "Please confirm if all my documents have been received and are being processed.",
    isReplied: true,
    replyDate: "2024-01-15",
    replyText: "All documents have been received and are currently under review.",
    priority: "High",
  },
  {
    id: 3,
    applicationNumber: "APP-2024-003",
    applicantName: "Mike Johnson",
    queryDate: "2024-01-13",
    querySubject: "Processing Timeline",
    queryText: "What is the expected timeline for my loan application processing?",
    isReplied: false,
    priority: "Low",
  },
  {
    id: 4,
    applicationNumber: "APP-2024-004",
    applicantName: "Sarah Wilson",
    queryDate: "2024-01-12",
    querySubject: "Collateral Requirements",
    queryText: "Do I need to provide additional collateral for my loan application?",
    isReplied: true,
    replyDate: "2024-01-13",
    replyText: "Based on your application, no additional collateral is required at this time.",
    priority: "Medium",
  },
];

const QueriesMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<any>(null);

  const filteredQueries = queriesData.filter((query) => {
    const matchesSearch = 
      query.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.querySubject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "replied" && query.isReplied) ||
      (filterStatus === "pending" && !query.isReplied);

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (isReplied: boolean) => {
    return isReplied ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Replied
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-blue-100 text-blue-800 border-blue-200",
    };
    
    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        {priority}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <BankManagerSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Queries Monitoring</h1>
                <p className="text-gray-600 mt-1">Track and manage customer queries by application number</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{queriesData.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Replies</CardTitle>
                  <Clock className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {queriesData.filter(q => !q.isReplied).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Replied</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {queriesData.filter(q => q.isReplied).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Queries</CardTitle>
                <CardDescription>Search by application number, applicant name, or query subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search queries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Queries</SelectItem>
                      <SelectItem value="pending">Pending Replies</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Queries Table */}
            <Card>
              <CardHeader>
                <CardTitle>Queries List</CardTitle>
                <CardDescription>All queries organized by application number</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application Number</TableHead>
                      <TableHead>Applicant Name</TableHead>
                      <TableHead>Query Subject</TableHead>
                      <TableHead>Query Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueries.map((query) => (
                      <TableRow key={query.id}>
                        <TableCell className="font-medium">{query.applicationNumber}</TableCell>
                        <TableCell>{query.applicantName}</TableCell>
                        <TableCell>{query.querySubject}</TableCell>
                        <TableCell>{query.queryDate}</TableCell>
                        <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                        <TableCell>{getStatusBadge(query.isReplied)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedQuery(query)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Query Detail Modal/Card */}
            {selectedQuery && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Query Details - {selectedQuery.applicationNumber}</CardTitle>
                    <Button variant="outline" onClick={() => setSelectedQuery(null)}>
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">APPLICANT NAME</h4>
                      <p className="text-gray-900">{selectedQuery.applicantName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">QUERY DATE</h4>
                      <p className="text-gray-900">{selectedQuery.queryDate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">QUERY SUBJECT</h4>
                    <p className="text-gray-900">{selectedQuery.querySubject}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">QUERY TEXT</h4>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedQuery.queryText}</p>
                  </div>

                  {selectedQuery.isReplied && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">REPLY (Date: {selectedQuery.replyDate})</h4>
                      <p className="text-gray-900 bg-green-50 p-3 rounded-md border border-green-200">
                        {selectedQuery.replyText}
                      </p>
                    </div>
                  )}

                  {!selectedQuery.isReplied && (
                    <div className="flex gap-2">
                      <Button className="flex-1">Reply to Query</Button>
                      <Button variant="outline">Mark as Priority</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default QueriesMonitoring;