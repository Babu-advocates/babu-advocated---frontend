import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { IndianRupee, Eye, Edit, Users, Calendar as CalendarIcon, QrCode, Download, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
interface Employee {
  id: string;
  employee_id: string;
  name: string;
  gender: string;
  phone_no: string;
  mail_id: string;
  fixed_salary: number;
  address: string;
  dob: string;
  qualification: string;
  date_of_joining: string;
  account_no: string;
  ifsc_code: string;
  branch: string;
  bank: string;
  qr_code?: string;
}
interface EmployeeSalary {
  id?: string;
  employee_id: string;
  fixed_salary: number;
  month: number;
  year: number;
  actual_salary: number | null;
  days_present: number;
  days_absent: number;
  deductions: number;
  bonus: number;
  status: string;
  paid_date: string | null;
}
const PaymentDetails = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Record<string, EmployeeSalary>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  useEffect(() => {
    fetchEmployeesAndSalaries();
  }, [selectedMonth, selectedYear]);
  const fetchEmployeesAndSalaries = async () => {
    try {
      setLoading(true);
      const {
        data: employeesData,
        error: empError
      } = await supabase.from('advocate_employees').select('*').order('employee_id', {
        ascending: true
      });
      if (empError) throw empError;
      const {
        data: salariesData,
        error: salError
      } = await supabase.from('employee_salaries').select('*').eq('month', selectedMonth).eq('year', selectedYear);
      if (salError) throw salError;
      setEmployees(employeesData || []);
      const salaryMap: Record<string, EmployeeSalary> = {};
      salariesData?.forEach(salary => {
        salaryMap[salary.employee_id] = salary;
      });
      setSalaries(salaryMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };
  const calculateSalaryForMonth = async (employee: Employee) => {
    const {
      data: attendance,
      error
    } = await supabase.from('attendance_records').select('date, type').eq('employee_id', employee.employee_id).gte('date', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`).lt('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`);
    if (error) {
      console.error('Error fetching attendance:', error);
      return {
        days_present: 0,
        days_absent: 0
      };
    }
    const uniqueDates = new Set(attendance?.map(a => a.date) || []);
    const days_present = uniqueDates.size;
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days_absent = daysInMonth - days_present;
    return {
      days_present,
      days_absent
    };
  };
  const filteredEmployees = employees.filter(emp => searchTerm === "" || emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) || emp.phone_no.includes(searchTerm));
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Paid</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const totalSalaryPaid = Object.values(salaries).filter(s => s.status === 'paid').reduce((sum, s) => sum + (s.actual_salary || 0), 0);
  const handleViewDetails = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };
  const handleEditSalary = async (employee: Employee) => {
    let salary = salaries[employee.employee_id];
    if (!salary) {
      const attendance = await calculateSalaryForMonth(employee);
      salary = {
        employee_id: employee.employee_id,
        fixed_salary: employee.fixed_salary || 0,
        month: selectedMonth,
        year: selectedYear,
        actual_salary: employee.fixed_salary || 0,
        days_present: attendance.days_present,
        days_absent: 0,
        deductions: 0,
        bonus: 0,
        status: 'pending',
        paid_date: null
      };
    }
    setEditingSalary(salary);
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };
  const handleSaveSalary = async () => {
    if (!editingSalary || !selectedEmployee) return;
    try {
      const salaryData = {
        employee_id: editingSalary.employee_id,
        fixed_salary: Number(editingSalary.fixed_salary),
        month: selectedMonth,
        year: selectedYear,
        actual_salary: Number(editingSalary.actual_salary),
        days_present: editingSalary.days_present,
        days_absent: editingSalary.days_absent,
        deductions: Number(editingSalary.deductions),
        bonus: Number(editingSalary.bonus),
        status: editingSalary.status,
        paid_date: editingSalary.paid_date
      };
      const {
        error
      } = await supabase.from('employee_salaries').upsert(salaryData, {
        onConflict: 'employee_id,month,year'
      });
      if (error) throw error;

      // Update fixed salary in employee table if changed
      if (selectedEmployee.fixed_salary !== editingSalary.fixed_salary) {
        await supabase.from('advocate_employees').update({
          fixed_salary: editingSalary.fixed_salary
        }).eq('employee_id', selectedEmployee.employee_id);
      }
      showToast.success("Salary updated successfully");
      setIsEditDialogOpen(false);
      fetchEmployeesAndSalaries();
    } catch (error) {
      console.error('Error saving salary:', error);
      showToast.error("Failed to update salary");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Employee Salary Report - ${getMonthYearLabel()}`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Total Paid: ₹${totalSalaryPaid.toLocaleString()}`, 14, 32);
    doc.text(`Total Employees: ${employees.length}`, 14, 38);
    
    const tableData = filteredEmployees.map(emp => {
      const salary = salaries[emp.employee_id];
      return [
        emp.employee_id,
        emp.name,
        emp.gender,
        emp.phone_no,
        `₹${(emp.fixed_salary || 0).toLocaleString()}`,
        `₹${(salary?.actual_salary || emp.fixed_salary || 0).toLocaleString()}`,
        salary?.status || 'pending'
      ];
    });

    autoTable(doc, {
      head: [['Employee ID', 'Name', 'Gender', 'Phone', 'Fixed Salary', 'Actual Salary', 'Status']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`salary-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.pdf`);
    showToast.success("PDF exported successfully");
  };

  const exportToExcel = () => {
    const XLSX = require('xlsx');
    
    const worksheetData = [
      [`Employee Salary Report - ${getMonthYearLabel()}`],
      [],
      [`Total Paid: ₹${totalSalaryPaid.toLocaleString()}`],
      [`Total Employees: ${employees.length}`],
      [`Pending Payments: ${Object.values(salaries).filter(s => s.status === 'pending').length}`],
      [],
      ['Employee ID', 'Name', 'Gender', 'Phone Number', 'Email', 'Fixed Salary', 'Actual Salary', 'Days Present', 'Days Absent', 'Deductions', 'Bonus', 'Status', 'Paid Date']
    ];

    filteredEmployees.forEach(emp => {
      const salary = salaries[emp.employee_id];
      worksheetData.push([
        emp.employee_id,
        emp.name,
        emp.gender,
        emp.phone_no,
        emp.mail_id,
        (emp.fixed_salary || 0).toString(),
        (salary?.actual_salary || emp.fixed_salary || 0).toString(),
        (salary?.days_present || 0).toString(),
        (salary?.days_absent || 0).toString(),
        (salary?.deductions || 0).toString(),
        (salary?.bonus || 0).toString(),
        salary?.status || 'pending',
        salary?.paid_date || ''
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Report');
    
    XLSX.writeFile(workbook, `salary-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.xlsx`);
    showToast.success("Excel exported successfully");
  };

  const getMonthYearLabel = () => {
    const date = new Date(selectedYear, selectedMonth - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">Employee Salary Management</h1>
                      <p className="text-sm text-slate-600">Manage employee salaries and payments</p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => navigate('/attendance')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  View Attendance
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">

              {/* Month/Year Filter and Export */}
              <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Filter by:</span>
                      <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(Number(val))}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex gap-2">
                      <Button onClick={exportToPDF} variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button onClick={exportToExcel} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-white/95 to-emerald-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <IndianRupee className="h-6 w-6 text-emerald-600" />
                      <h3 className="font-semibold text-slate-700">Total Paid This Month</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{totalSalaryPaid.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">Salaries disbursed</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-slate-700">Total Employees</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
                    <p className="text-sm text-slate-600 mt-1">Active employees</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white/95 to-amber-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarIcon className="h-6 w-6 text-amber-600" />
                      <h3 className="font-semibold text-slate-700">Pending Payments</h3>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                      {Object.values(salaries).filter(s => s.status === 'pending').length}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">Awaiting payment</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search Bar */}
              <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
                <CardContent className="p-4">
                  <div className="relative">
                    <Input placeholder="Search by employee name, ID, or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-4" />
                  </div>
                </CardContent>
              </Card>

              {/* Employee Salaries Table */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
                <CardHeader>
                  <CardTitle>Employee Salary List - {getMonthYearLabel()}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? <div className="text-center py-8">
                      <p className="text-slate-500">Loading employee data...</p>
                    </div> : filteredEmployees.length === 0 ? <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500">No employees found</p>
                    </div> : <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Fixed Salary</TableHead>
                            <TableHead>Salary This Month</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.map(employee => {
                        const salary = salaries[employee.employee_id];
                        return <TableRow key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium text-blue-600">{employee.employee_id}</TableCell>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>{employee.gender}</TableCell>
                                <TableCell>{employee.phone_no}</TableCell>
                                <TableCell className="font-semibold">₹{(employee.fixed_salary || 0).toLocaleString()}</TableCell>
                                <TableCell className="font-semibold text-emerald-600">
                                  ₹{(salary?.actual_salary || employee.fixed_salary || 0).toLocaleString()}
                                </TableCell>
                                <TableCell>{getStatusBadge(salary?.status || 'pending')}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)} className="text-blue-600 hover:text-blue-700">
                                      <Eye className="h-4 w-4 mr-1" />
                                      More Details
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleEditSalary(employee)} className="text-purple-600 hover:text-purple-700">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit Salary
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>;
                      })}
                        </TableBody>
                      </Table>
                    </div>}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedEmployee?.name}</DialogTitle>
              <Button onClick={() => navigate('/attendance')} variant="outline" size="sm" className="ml-4 mx-[110px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Attendance
              </Button>
            </div>
          </DialogHeader>
          {selectedEmployee && <div className="space-y-6">
              {/* UPI Scanner and Payment Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-8">
                  <div className="flex gap-8 items-center justify-center">
                    {/* QR Code Scanner */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-72 h-72 bg-white rounded-2xl flex items-center justify-center border-4 border-dashed border-blue-300 shadow-lg p-4">
                        {selectedEmployee.qr_code ? (
                          <img 
                            src={selectedEmployee.qr_code} 
                            alt="Payment QR Code" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode className="h-40 w-40 text-blue-400" />
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">UPI Payment Scanner</h3>
                        <p className="text-sm text-slate-500">Scan to pay salary directly</p>
                      </div>
                    </div>

                    {/* Salary and Payment Status */}
                    <div className="flex flex-col space-y-6">
                      <div className="text-center">
                        <p className="text-base text-slate-600 mb-2">Salary This Month</p>
                        <p className="text-4xl font-bold text-emerald-600">
                          ₹{(salaries[selectedEmployee.employee_id]?.actual_salary || selectedEmployee.fixed_salary || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Payment Status Toggle */}
                      <div className="flex flex-col items-center space-y-3">
                        <p className="text-sm font-medium text-slate-700">Payment Status</p>
                        <button onClick={() => {
                      const currentStatus = salaries[selectedEmployee.employee_id]?.status || 'pending';
                      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
                      handleEditSalary(selectedEmployee);
                      setTimeout(() => {
                        if (editingSalary) {
                          setEditingSalary({
                            ...editingSalary,
                            status: newStatus,
                            paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
                          });
                        }
                      }, 100);
                    }} className={`relative inline-flex items-center h-14 rounded-full w-56 transition-colors duration-300 ${salaries[selectedEmployee.employee_id]?.status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          <span className="text-white font-semibold text-lg mx-auto">
                            {salaries[selectedEmployee.employee_id]?.status === 'paid' ? 'PAID' : 'NOT PAID'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Full Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Employee ID</p>
                      <p className="font-medium">{selectedEmployee.employee_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Name</p>
                      <p className="font-medium">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Gender</p>
                      <p className="font-medium">{selectedEmployee.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Date of Birth</p>
                      <p className="font-medium">{selectedEmployee.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Qualification</p>
                      <p className="font-medium">{selectedEmployee.qualification}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Phone Number</p>
                      <p className="font-medium">{selectedEmployee.phone_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email ID</p>
                      <p className="font-medium">{selectedEmployee.mail_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-medium">{selectedEmployee.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Date of Joining</p>
                      <p className="font-medium">{selectedEmployee.date_of_joining}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bank Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Account Number</p>
                      <p className="font-medium">{selectedEmployee.account_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">IFSC Code</p>
                      <p className="font-medium">{selectedEmployee.ifsc_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Branch</p>
                      <p className="font-medium">{selectedEmployee.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Bank Name</p>
                      <p className="font-medium">{selectedEmployee.bank}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Salary Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Fixed Salary</p>
                      <p className="font-medium text-lg">₹{(selectedEmployee.fixed_salary || 0).toLocaleString()}</p>
                    </div>
                    {salaries[selectedEmployee.employee_id] && <>
                        <div>
                          <p className="text-sm text-slate-600">Salary This Month</p>
                          <p className="font-medium text-lg text-emerald-600">
                            ₹{(salaries[selectedEmployee.employee_id].actual_salary || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-600">Days Present</p>
                            <p className="font-medium">{salaries[selectedEmployee.employee_id].days_present}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Days Absent</p>
                            <p className="font-medium">{salaries[selectedEmployee.employee_id].days_absent}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Deductions</p>
                            <p className="font-medium text-red-600">₹{salaries[selectedEmployee.employee_id].deductions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Bonus</p>
                            <p className="font-medium text-green-600">₹{salaries[selectedEmployee.employee_id].bonus}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Payment Status</p>
                          {getStatusBadge(salaries[selectedEmployee.employee_id].status)}
                        </div>
                      </>}
                  </CardContent>
                </Card>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Edit Salary Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Salary - {selectedEmployee?.name} ({selectedEmployee?.employee_id})</DialogTitle>
          </DialogHeader>
          {editingSalary && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fixed Salary</label>
                  <Input type="number" placeholder="Enter fixed salary" value={editingSalary.fixed_salary || ''} onChange={e => setEditingSalary({
                ...editingSalary,
                fixed_salary: Number(e.target.value) || 0
              })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actual Salary (This Month)</label>
                  <Input type="number" placeholder="Enter actual salary" value={editingSalary.actual_salary || ''} onChange={e => setEditingSalary({
                ...editingSalary,
                actual_salary: Number(e.target.value) || 0
              })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Days Present</label>
                  <Input type="number" placeholder="Enter days present" value={editingSalary.days_present || ''} onChange={e => setEditingSalary({
                ...editingSalary,
                days_present: Number(e.target.value) || 0
              })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Days Absent</label>
                  <Input type="number" placeholder="Enter days absent" value={editingSalary.days_absent || ''} onChange={e => setEditingSalary({
                ...editingSalary,
                days_absent: Number(e.target.value) || 0
              })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deductions</label>
                  <Input type="number" placeholder="Enter deductions" value={editingSalary.deductions || ''} onChange={e => setEditingSalary({
                ...editingSalary,
                deductions: Number(e.target.value) || 0
              })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bonus</label>
                  <Input type="number" placeholder="Enter bonus" value={editingSalary.bonus || ''} onChange={e => setEditingSalary({
                ...editingSalary,
                bonus: Number(e.target.value) || 0
              })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                const newStatus = editingSalary.status === 'paid' ? 'pending' : 'paid';
                setEditingSalary({
                  ...editingSalary,
                  status: newStatus,
                  paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
                });
              }} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${editingSalary.status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${editingSalary.status === 'paid' ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-sm font-medium ${editingSalary.status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {editingSalary.status === 'paid' ? 'PAID' : 'NOT PAID'}
                  </span>
                </div>
              </div>

              {editingSalary.status === 'paid' && <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Date</label>
                  <Input type="date" value={editingSalary.paid_date || ''} onChange={e => setEditingSalary({
              ...editingSalary,
              paid_date: e.target.value
            })} />
                </div>}
            </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSalary}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>;
};
export default PaymentDetails;