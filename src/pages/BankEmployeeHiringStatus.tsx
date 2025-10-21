import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, UserCheck } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";

const hiringStatusData = [
  {
    caseId: "CASE001",
    clientName: "Rajesh Kumar",
    advocateName: "Adv. Priya Sharma",
    hiringDate: "2024-01-15",
    status: "Active",
    courtName: "Delhi High Court",
    caseType: "Loan Recovery"
  },
  {
    caseId: "CASE002", 
    clientName: "Sunita Patel",
    advocateName: "Adv. Rohit Gupta",
    hiringDate: "2024-01-12",
    status: "Active",
    courtName: "Mumbai Sessions Court",
    caseType: "Debt Recovery"
  },
  {
    caseId: "CASE003",
    clientName: "Amit Singh",
    advocateName: "Adv. Kavita Joshi",
    hiringDate: "2024-01-10",
    status: "Completed",
    courtName: "Pune District Court",
    caseType: "Recovery Suit"
  },
  {
    caseId: "CASE004",
    clientName: "Deepa Rao",
    advocateName: "Adv. Manoj Tiwari",
    hiringDate: "2024-01-08",
    status: "Active",
    courtName: "Bangalore Civil Court",
    caseType: "Loan Recovery"
  }
];

export default function BankEmployeeHiringStatus() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = hiringStatusData.filter(item =>
    item.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.advocateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <BankEmployeeSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hiring Status</h1>
                <p className="text-gray-600">View advocate hiring dates and status for all cases</p>
              </div>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Cases
                </CardTitle>
                <CardDescription>
                  Search by case ID, client name, or advocate name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by case ID, client name, or advocate name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hiring Status Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Advocate Hiring Status
                </CardTitle>
                <CardDescription>
                  Hiring dates and status updated by advocate employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Advocate Name</TableHead>
                        <TableHead>Hiring Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Court Name</TableHead>
                        <TableHead>Case Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.caseId}>
                          <TableCell className="font-medium">{item.caseId}</TableCell>
                          <TableCell>{item.clientName}</TableCell>
                          <TableCell>{item.advocateName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {new Date(item.hiringDate).toLocaleDateString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.courtName}</TableCell>
                          <TableCell>{item.caseType}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hiring records found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}