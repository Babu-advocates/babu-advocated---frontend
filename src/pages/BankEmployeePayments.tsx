import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, DollarSign, CreditCard, Clock, CheckCircle, Eye, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";

const BankEmployeePayments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Sample pending payments data
  const pendingPayments = [
    {
      id: "PAY001",
      caseId: "CASE001",
      advocateName: "Ramesh Kumar",
      amount: 50000,
      dueDate: "2024-01-20",
      description: "Legal fee for loan recovery case",
      bankName: "State Bank of India",
      status: "Pending"
    },
    {
      id: "PAY002", 
      caseId: "CASE002",
      advocateName: "Priya Sharma",
      amount: 35000,
      dueDate: "2024-01-18",
      description: "Consultation and documentation fee",
      bankName: "HDFC Bank",
      status: "Pending"
    },
    {
      id: "PAY003",
      caseId: "CASE003", 
      advocateName: "Suresh Patel",
      amount: 75000,
      dueDate: "2024-01-22",
      description: "Court representation fee",
      bankName: "ICICI Bank",
      status: "Pending"
    }
  ];

  // Sample completed payments data
  const completedPayments = [
    {
      id: "PAY004",
      caseId: "CASE004",
      advocateName: "Anjali Gupta",
      amount: 42000,
      paymentDate: "2024-01-12",
      paymentMethod: "NEFT",
      transactionId: "NEFT789123456",
      bankName: "Axis Bank",
      description: "Legal advisory fee",
      status: "Completed"
    },
    {
      id: "PAY005",
      caseId: "CASE005",
      advocateName: "Vikram Singh",
      amount: 28000,
      paymentDate: "2024-01-11",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN321654987",
      bankName: "Punjab National Bank",
      description: "Document verification fee",
      status: "Completed"
    },
    {
      id: "PAY006",
      caseId: "CASE006",
      advocateName: "Meera Nair",
      amount: 60000,
      paymentDate: "2024-01-10",
      paymentMethod: "RTGS",
      transactionId: "RTGS654321789",
      bankName: "Canara Bank",
      description: "Loan agreement drafting fee",
      status: "Completed"
    }
  ];

  const handlePayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const processPayment = () => {
    // Here you would integrate with actual payment processing
    console.log("Processing payment for:", selectedPayment);
    setIsPaymentDialogOpen(false);
    setSelectedPayment(null);
    // Show success toast
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPendingPayments = pendingPayments.filter(payment => {
    const matchesSearch = searchTerm === "" || 
      payment.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredCompletedPayments = completedPayments.filter(payment => {
    const matchesSearch = searchTerm === "" || 
      payment.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bank-light">
        <BankEmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Payments</h1>
                <p className="text-sm text-muted-foreground">Manage pending and completed payments</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              {/* Search and Filters */}
              <Card className="mb-6 border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-bank-navy" />
                    <span>Filter Payments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by application no or payment ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payments Tabs */}
              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Pending Payments</span>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed Payments</span>
                  </TabsTrigger>
                </TabsList>

                {/* Pending Payments Tab */}
                <TabsContent value="pending">
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle>Pending Payments</CardTitle>
                      <CardDescription>
                        Payments that need to be processed to advocates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Payment ID</TableHead>
                              <TableHead>Application No</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPendingPayments.map((payment) => (
                              <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium text-bank-navy">{payment.id}</TableCell>
                                <TableCell className="font-medium">{payment.caseId}</TableCell>
                                <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                <TableCell>
                                  <Button 
                                    onClick={() => handlePayment(payment)}
                                    size="sm"
                                    className="bg-bank-success hover:bg-bank-success/90"
                                  >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pay
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {filteredPendingPayments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p>No pending payments found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Completed Payments Tab */}
                <TabsContent value="completed">
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle>Completed Payments</CardTitle>
                      <CardDescription>
                        All completed payment transactions with full details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Payment ID</TableHead>
                              <TableHead>Application No</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Payment Date</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Transaction ID</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCompletedPayments.map((payment) => (
                              <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium text-bank-navy">{payment.id}</TableCell>
                                <TableCell className="font-medium">{payment.caseId}</TableCell>
                                <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                                <TableCell>{payment.paymentMethod}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{payment.transactionId}</TableCell>
                                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {filteredCompletedPayments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p>No completed payments found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Confirm payment details for Application {selectedPayment?.caseId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Payment ID:</span>
                  <p className="font-semibold">{selectedPayment.id}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Application No:</span>
                  <p className="font-semibold">{selectedPayment.caseId}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Advocate:</span>
                  <p className="font-semibold">{selectedPayment.advocateName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Amount:</span>
                  <p className="font-semibold text-bank-success">₹{selectedPayment.amount?.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Description:</span>
                <p className="text-sm mt-1">{selectedPayment.description}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPayment} className="bg-bank-success hover:bg-bank-success/90">
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default BankEmployeePayments;