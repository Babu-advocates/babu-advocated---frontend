import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, UserCheck, Plus, Search } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  caseName: z.string().min(1, "Case name is required"),
  hiringDate: z.date({
    required_error: "Hiring date is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

const banksData = [
  "HDFC Bank",
  "ICICI Bank", 
  "State Bank of India",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank"
];

const casesData = [
  "CASE001 - Rajesh Kumar Loan Recovery",
  "CASE002 - Sunita Patel Debt Recovery", 
  "CASE003 - Amit Singh Recovery Suit",
  "CASE004 - Deepa Rao Loan Recovery",
  "CASE005 - Vikram Shah Property Dispute",
  "CASE006 - Priya Menon Credit Recovery"
];

const existingHiringData = [
  {
    id: 1,
    bankName: "HDFC Bank",
    caseName: "CASE001 - Rajesh Kumar Loan Recovery",
    hiringDate: "2024-01-15",
    status: "Active",
    updatedBy: "Adv. Priya Sharma"
  },
  {
    id: 2,
    bankName: "ICICI Bank", 
    caseName: "CASE002 - Sunita Patel Debt Recovery",
    hiringDate: "2024-01-12",
    status: "Active",
    updatedBy: "Adv. Rohit Gupta"
  },
  {
    id: 3,
    bankName: "SBI",
    caseName: "CASE003 - Amit Singh Recovery Suit", 
    hiringDate: "2024-01-10",
    status: "Completed",
    updatedBy: "Adv. Kavita Joshi"
  }
];

export default function EmployeeHiringInformation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hiringData, setHiringData] = useState(existingHiringData);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      caseName: "",
    },
  });

  const onSubmit = (data: FormData) => {
    const newHiring = {
      id: hiringData.length + 1,
      bankName: data.bankName,
      caseName: data.caseName, 
      hiringDate: format(data.hiringDate, "yyyy-MM-dd"),
      status: "Active",
      updatedBy: "Current User"
    };

    setHiringData([...hiringData, newHiring]);
    form.reset();
    
    showToast.success("Hiring information updated successfully!");
  };

  const filteredData = hiringData.filter(item =>
    item.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.caseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <EmployeeSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hiring Information</h1>
                <p className="text-gray-600">Update hiring dates for cases by selecting bank and case details</p>
              </div>
            </div>

            {/* Add New Hiring Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Hiring Information
                </CardTitle>
                <CardDescription>
                  Select bank, case, and update the hiring date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {banksData.map((bank) => (
                                  <SelectItem key={bank} value={bank}>
                                    {bank}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caseName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Case Name</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select case" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {casesData.map((caseName) => (
                                  <SelectItem key={caseName} value={caseName}>
                                    {caseName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hiringDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Hiring Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Update Hiring Information
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Hiring Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by bank name or case name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hiring Information Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Hiring Records
                </CardTitle>
                <CardDescription>
                  View all hiring information records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bank Name</TableHead>
                        <TableHead>Case Name</TableHead>
                        <TableHead>Hiring Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.bankName}</TableCell>
                          <TableCell>{item.caseName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              {new Date(item.hiringDate).toLocaleDateString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.updatedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hiring records found</p>
                    <p className="text-sm">Try adjusting your search criteria or add new hiring information</p>
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