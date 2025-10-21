import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Star
} from "lucide-react";

export default function BanksDealt() {
  // Mock data for banks dealt with
  const banksData = [
    {
      id: 1,
      name: "HDFC Bank",
      branch: "Main Branch, Mumbai",
      contactPerson: "Rajesh Kumar",
      phone: "+91 98765-43210",
      email: "rajesh.kumar@hdfcbank.com",
      casesHandled: 15,
      lastInteraction: "2024-01-15",
      status: "Active",
      rating: 4.5
    },
    {
      id: 2,
      name: "State Bank of India",
      branch: "Corporate Branch, Delhi",
      contactPerson: "Priya Sharma",
      phone: "+91 87654-32109",
      email: "priya.sharma@sbi.co.in",
      casesHandled: 12,
      lastInteraction: "2024-01-10",
      status: "Active",
      rating: 4.2
    },
    {
      id: 3,
      name: "ICICI Bank",
      branch: "Business Hub, Bangalore",
      contactPerson: "Amit Patel",
      phone: "+91 76543-21098",
      email: "amit.patel@icicibank.com",
      casesHandled: 8,
      lastInteraction: "2024-01-05",
      status: "Pending",
      rating: 4.0
    },
    {
      id: 4,
      name: "Axis Bank",
      branch: "Financial Center, Chennai",
      contactPerson: "Sneha Reddy",
      phone: "+91 65432-10987",
      email: "sneha.reddy@axisbank.com",
      casesHandled: 6,
      lastInteraction: "2023-12-28",
      status: "Inactive",
      rating: 3.8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Pending": return "secondary";
      case "Inactive": return "destructive";
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
            <div>
              <h1 className="text-xl font-semibold text-foreground">Banks Dealt</h1>
              <p className="text-sm text-muted-foreground">Manage your banking partnerships and relationships</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Search and Filters */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Search Banks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by bank name, branch, or contact person..." 
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="border-employee-legal text-employee-legal hover:bg-employee-legal hover:text-white">
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Banks List */}
            <div className="grid gap-6">
              {banksData.map((bank) => (
                <Card key={bank.id} className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Bank Info */}
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-employee-legal/10">
                          <Building2 className="h-6 w-6 text-employee-legal" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1">{bank.name}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {bank.branch}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {bank.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {bank.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact and Stats */}
                      <div className="flex flex-col lg:items-end gap-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusColor(bank.status)}>
                            {bank.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{bank.rating}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground text-right lg:text-right">
                          <p><strong>Cases Handled:</strong> {bank.casesHandled}</p>
                          <p><strong>Contact Person:</strong> {bank.contactPerson}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Last: {bank.lastInteraction}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-employee-legal text-employee-legal hover:bg-employee-legal hover:text-white"
                          >
                            Contact
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-employee-legal hover:bg-employee-legal-hover text-white"
                          >
                            View Cases
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-employee-legal">
                    {banksData.length}
                  </CardTitle>
                  <CardDescription>Total Banks</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-employee-legal">
                    {banksData.reduce((sum, bank) => sum + bank.casesHandled, 0)}
                  </CardTitle>
                  <CardDescription>Total Cases Handled</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-employee-legal">
                    {banksData.filter(bank => bank.status === "Active").length}
                  </CardTitle>
                  <CardDescription>Active Partnerships</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}