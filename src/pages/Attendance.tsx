import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Search, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, UserCheck, Download, Eye, MapPin, Trash2, PauseCircle } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz/toZonedTime";
import { formatInTimeZone } from "date-fns-tz/formatInTimeZone";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import * as XLSX from 'xlsx';
interface AttendanceRecord {
  employee_username: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  checkInLocation?: string;
  checkOutLocation?: string;
  workingHours: string;
  status: string;
}
interface EmployeeAttendanceSummary {
  username: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  incompleteDays: number;
  records: AttendanceRecord[];
  latestDate?: string;
  latestStatus?: string;
}
const TZ = 'Asia/Kolkata';
const isSundayIST = (dateInput: string | Date) => {
  const base = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00Z') : dateInput;
  const zoned = toZonedTime(base, TZ);
  return zoned.getDay() === 0;
};

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Set default to current month
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeAttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAttendanceSummary | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [isExcludeDialogOpen, setIsExcludeDialogOpen] = useState(false);
  const [selectedExcludeDates, setSelectedExcludeDates] = useState<Date[]>([]);
  useEffect(() => {
    fetchExcludedDates();
  }, []);

  useEffect(() => {
    if (excludedDates !== undefined) {
      fetchAttendanceData();
    }
  }, [excludedDates]);

  const fetchExcludedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_excluded_dates')
        .select('excluded_date')
        .order('excluded_date', { ascending: true });
      
      if (error) throw error;
      
      setExcludedDates((data || []).map(d => d.excluded_date));
    } catch (error) {
      console.error('Error fetching excluded dates:', error);
    }
  };
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);

      // Fetch all employee accounts
      const {
        data: employees,
        error: empError
      } = await supabase.from('employee_accounts').select('username').eq('is_active', true);
      if (empError) throw empError;

      // Fetch all attendance records
      const {
        data: attendanceRecords,
        error: attError
      } = await supabase.from('attendance_records').select('*').order('date', {
        ascending: false
      }).order('timestamp', {
        ascending: false
      });
      if (attError) throw attError;

      // Get unique dates from attendance records (excluding Sundays in IST and excluded dates)
      const uniqueDates = new Set<string>();
      (attendanceRecords || []).forEach(r => {
        if (!isSundayIST(r.date) && !excludedDates.includes(r.date)) {
          uniqueDates.add(r.date);
        }
      });

      // Also get last 30 days to check for absences (excluding Sundays in IST and excluded dates)
      const last30Days: string[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStrIST = formatInTimeZone(date, TZ, 'yyyy-MM-dd');
        if (!isSundayIST(dateStrIST) && !excludedDates.includes(dateStrIST)) {
          last30Days.push(dateStrIST);
        }
      }
      last30Days.forEach(d => uniqueDates.add(d));
      // Finalize all dates excluding Sundays in IST and excluded dates
      const allDates = Array.from(uniqueDates)
        .filter(d => !isSundayIST(d) && !excludedDates.includes(d))
        .sort()
        .reverse();

      // Group attendance by employee
      const employeeData: EmployeeAttendanceSummary[] = (employees || []).map(emp => {
        const empRecords = (attendanceRecords || []).filter(r => r.employee_username === emp.username);

        // Group by date
        const recordsByDate: {
          [key: string]: any[];
        } = {};
        empRecords.forEach(record => {
          if (!recordsByDate[record.date]) {
            recordsByDate[record.date] = [];
          }
          recordsByDate[record.date].push(record);
        });

        // Process each date
        const processedRecords: AttendanceRecord[] = allDates.map(date => {
          const records = recordsByDate[date] || [];
          const checkInRecord = records.find(r => r.type === 'check-in');
          const checkOutRecord = records.find(r => r.type === 'check-out');
          let workingHours = '-';
          let status = 'Absent';
          if (checkInRecord && checkOutRecord) {
            const checkInTime = new Date(checkInRecord.timestamp);
            const checkOutTime = new Date(checkOutRecord.timestamp);
            const diffMs = checkOutTime.getTime() - checkInTime.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(diffMs % (1000 * 60 * 60) / (1000 * 60));
            workingHours = `${hours}h ${minutes}m`;
            status = 'Present';
          } else if (checkInRecord) {
            status = 'Incomplete';
          }
          return {
            employee_username: emp.username,
            date,
            checkIn: checkInRecord ? new Date(checkInRecord.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }) : undefined,
            checkOut: checkOutRecord ? new Date(checkOutRecord.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }) : undefined,
            checkInLocation: checkInRecord?.location,
            checkOutLocation: checkOutRecord?.location,
            workingHours,
            status
          };
        });

        // Calculate attendance stats
        const presentDays = processedRecords.filter(r => r.status === 'Present').length;
        const absentDays = processedRecords.filter(r => r.status === 'Absent').length;
        const incompleteDays = processedRecords.filter(r => r.status === 'Incomplete').length;

        // Get latest record
        const latestRecord = processedRecords.find(r => r.status !== 'Absent') || processedRecords[0];
        return {
          username: emp.username,
          records: processedRecords,
          totalDays: processedRecords.length,
          presentDays,
          absentDays,
          incompleteDays,
          latestDate: latestRecord?.date,
          latestStatus: latestRecord?.status
        };
      });
      setEmployeeSummaries(employeeData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showToast.error("Failed to load attendance data");
    } finally {
      setIsLoading(false);
    }
  };
  const handleViewDetails = (employee: EmployeeAttendanceSummary) => {
    setSelectedEmployee(employee);
    setIsDetailsDialogOpen(true);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Late":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Half Day":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "Absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Late":
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <UserCheck className="h-4 w-4 text-slate-500" />;
    }
  };
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      // Automatically set end date to 1 month after start date
      setEndDate(addMonths(date, 1));
    }
  };

  // Filter employees and recalculate stats based on date range
  const filteredEmployees = employeeSummaries.map(emp => {
    const matchesSearch = !searchTerm || emp.username.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return null;
    
    // Filter records by date range
    const recordsInRange = emp.records.filter(record => {
      const recordDate = new Date(record.date);
      const isAfterStart = !startDate || recordDate >= startDate;
      const isBeforeEnd = !endDate || recordDate <= endDate;
      return isAfterStart && isBeforeEnd;
    });
    
    // Recalculate stats for filtered date range
    const presentDays = recordsInRange.filter(r => r.status === 'Present').length;
    const absentDays = recordsInRange.filter(r => r.status === 'Absent').length;
    const incompleteDays = recordsInRange.filter(r => r.status === 'Incomplete').length;
    
    return {
      ...emp,
      records: recordsInRange,
      totalDays: recordsInRange.length,
      presentDays,
      absentDays,
      incompleteDays
    };
  }).filter(emp => emp !== null) as EmployeeAttendanceSummary[];
  const attendanceStats = {
    total: employeeSummaries.length,
    present: employeeSummaries.reduce((acc, emp) => acc + emp.presentDays, 0),
    absent: employeeSummaries.reduce((acc, emp) => acc + emp.absentDays, 0),
    incomplete: employeeSummaries.reduce((acc, emp) => acc + emp.incompleteDays, 0)
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export - use filtered employees
      const exportData = filteredEmployees.map(emp => ({
        'Employee Username': emp.username,
        'Total Days': emp.totalDays,
        'Present Days': emp.presentDays,
        'Absent Days': emp.absentDays,
        'Incomplete Days': emp.incompleteDays,
        'Latest Status': emp.latestStatus || '-'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary');

      // Generate filename with date range
      const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : 'start';
      const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : 'end';
      const filename = `Attendance_${startDateStr}_to_${endDateStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      showToast.success("Attendance data exported successfully!");
    } catch (error) {
      console.error('Error exporting attendance:', error);
      showToast.error("Failed to export attendance data");
    }
  };

  const handleAddExcludedDates = async () => {
    try {
      if (selectedExcludeDates.length === 0) {
        showToast.error("Please select at least one date");
        return;
      }

      const datesToInsert = selectedExcludeDates.map(date => ({
        excluded_date: format(date, 'yyyy-MM-dd')
      }));

      const { error } = await supabase
        .from('attendance_excluded_dates')
        .insert(datesToInsert);

      if (error) throw error;

      showToast.success("Dates excluded successfully");
      setSelectedExcludeDates([]);
      setIsExcludeDialogOpen(false);
      await fetchExcludedDates();
      await fetchAttendanceData();
    } catch (error) {
      console.error('Error adding excluded dates:', error);
      showToast.error("Failed to exclude dates");
    }
  };

  const handleDeleteExcludedDate = async (date: string) => {
    try {
      const { error } = await supabase
        .from('attendance_excluded_dates')
        .delete()
        .eq('excluded_date', date);

      if (error) throw error;

      showToast.success("Date removed from exclusion list");
      await fetchExcludedDates();
      await fetchAttendanceData();
    } catch (error) {
      console.error('Error deleting excluded date:', error);
      showToast.error("Failed to remove excluded date");
    }
  };
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
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">Attendance Management</h1>
                      <p className="text-sm text-slate-600">Track staff attendance and working hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                  
                </Card>
              </div>

              {/* Admin Controls */}
              <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <PauseCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Pause Attendance</h3>
                      <p className="text-sm text-slate-600">Exclude specific dates from attendance calculation</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsExcludeDialogOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Manage Excluded Dates
                  </Button>
                </div>

                {excludedDates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Currently Excluded Dates:</p>
                    <div className="flex flex-wrap gap-2">
                      {excludedDates.map(date => (
                        <Badge key={date} variant="secondary" className="gap-2">
                          {format(new Date(date), 'MMM dd, yyyy')}
                          <button
                            onClick={() => handleDeleteExcludedDate(date)}
                            className="ml-1 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Section */}
              <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                  {/* Search by Username */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Search by Employee Username
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Enter employee username..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="pl-10 bg-white/50 border-slate-200 focus:border-blue-300 focus:ring-blue-200" 
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Start Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/50 border-slate-200 focus:border-blue-300",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={handleStartDateSelect}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      End Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/50 border-slate-200 focus:border-blue-300",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => startDate ? date < startDate : false}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-card border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>View detailed attendance information for all staff</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportToExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? <div className="text-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-slate-500">Loading attendance records...</p>
                    </div> : filteredEmployees.length === 0 ? <div className="text-center py-12">
                      <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-600 mb-2">No employees found</h3>
                      <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                    </div> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Username</TableHead>
                          <TableHead>Total Days</TableHead>
                          <TableHead>Present Days</TableHead>
                          <TableHead>Absent Days</TableHead>
                          <TableHead>Incomplete Days</TableHead>
                          <TableHead>Latest Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map(employee => <TableRow key={employee.username} className="hover:bg-slate-50">
                            <TableCell>
                              <div className="font-medium text-slate-800">{employee.username}</div>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-700">{employee.totalDays}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <span className="font-semibold text-emerald-600">{employee.presentDays}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="font-semibold text-red-600">{employee.absentDays}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="font-semibold text-amber-600">{employee.incompleteDays}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {employee.latestStatus && <Badge className={`${getStatusColor(employee.latestStatus)} font-medium`}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(employee.latestStatus)}
                                    {employee.latestStatus}
                                  </span>
                                </Badge>}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Exclude Dates Dialog */}
      <Dialog open={isExcludeDialogOpen} onOpenChange={setIsExcludeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exclude Dates from Attendance</DialogTitle>
            <DialogDescription>
              Select dates to exclude from attendance calculation. These dates will be treated like Sundays.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={selectedExcludeDates}
                onSelect={(dates) => setSelectedExcludeDates(dates || [])}
                className="rounded-md border"
              />
            </div>

            {selectedExcludeDates.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Selected Dates ({selectedExcludeDates.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedExcludeDates.map((date, idx) => (
                    <Badge key={idx} variant="secondary">
                      {format(date, 'MMM dd, yyyy')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedExcludeDates([]);
                  setIsExcludeDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddExcludedDates}>
                Exclude Selected Dates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendance Details - {selectedEmployee?.username}</DialogTitle>
            <DialogDescription>
              Complete attendance history and statistics for salary calculation
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Days Tracked</p>
                      <p className="text-2xl font-bold">{selectedEmployee.totalDays}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-emerald-600">Present Days</p>
                      <p className="text-2xl font-bold text-emerald-700">{selectedEmployee.presentDays}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-red-600">Absent Days</p>
                      <p className="text-2xl font-bold text-red-700">{selectedEmployee.absentDays}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-amber-600">Incomplete Days</p>
                      <p className="text-2xl font-bold text-amber-700">{selectedEmployee.incompleteDays}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Records */}
              <div>
                <h3 className="font-semibold mb-4">Date-wise Attendance</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check In Location</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Check Out Location</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {selectedEmployee.records.map((record, idx) => <TableRow key={idx}>
                        <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {record.checkIn ? (
                            <span className="text-emerald-600 font-medium">{record.checkIn}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkInLocation ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${record.checkInLocation.replace(', ', ',')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                            >
                              <MapPin className="h-4 w-4 text-emerald-600" />
                              View Location
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? (
                            <span className="text-blue-600 font-medium">{record.checkOut}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOutLocation ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${record.checkOutLocation.replace(', ', ',')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                            >
                              <MapPin className="h-4 w-4 text-blue-600" />
                              View Location
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">{record.workingHours}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </SidebarProvider>;
};
export default Attendance;