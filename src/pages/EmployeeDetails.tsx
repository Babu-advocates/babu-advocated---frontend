import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Trash2, Edit } from "lucide-react";
import EmployeeDetailsForm from "@/components/EmployeeDetailsForm";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  father_husband_name: string;
  phone_no: string;
  alternate_phone_no?: string;
  mail_id: string;
  gender: string;
  dob: string;
  qualification: string;
  address: string;
  account_no: string;
  ifsc_code: string;
  branch: string;
  bank: string;
  date_of_joining: string;
  photo?: string;
  reference?: string;
  details?: string;
}

const EmployeeDetails = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('advocate_employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast.error("Failed to load employees");
    }
  };

  const handleAddEmployee = async (employee: {
    name: string;
    father_husband_name: string;
    phone_no: string;
    alternate_phone_no?: string;
    mail_id: string;
    gender: string;
    dob: string;
    qualification: string;
    address: string;
    account_no: string;
    ifsc_code: string;
    branch: string;
    bank: string;
    date_of_joining: string;
    photo?: string;
    reference?: string;
    details?: string;
  }) => {
    try {
      // Generate employee ID
      const { data: empId, error: idError } = await supabase.rpc('next_employee_id');
      
      if (idError) {
        console.error('Error generating employee ID:', idError);
        showToast.error(`Failed to generate employee ID: ${idError.message}`);
        return;
      }

      console.log('Generated employee ID:', empId);

      const { error } = await supabase
        .from('advocate_employees')
        .insert([{
          employee_id: empId,
          ...employee
        }]);

      if (error) {
        console.error('Error inserting employee:', error);
        showToast.error(`Failed to add employee: ${error.message}`);
        return;
      }

      showToast.success("Employee added successfully");
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      console.error('Unexpected error adding employee:', error);
      showToast.error(`Failed to add employee: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleUpdateEmployee = async (employee: {
    name: string;
    father_husband_name: string;
    phone_no: string;
    alternate_phone_no?: string;
    mail_id: string;
    gender: string;
    dob: string;
    qualification: string;
    address: string;
    account_no: string;
    ifsc_code: string;
    branch: string;
    bank: string;
    date_of_joining: string;
    photo?: string;
    qr_code?: string;
    reference?: string;
    details?: string;
  }) => {
    if (!editingEmployee) return;

    try {
      const { error } = await supabase
        .from('advocate_employees')
        .update(employee)
        .eq('id', editingEmployee.id);

      if (error) {
        console.error('Error updating employee:', error);
        showToast.error(`Failed to update employee: ${error.message}`);
        return;
      }

      showToast.success("Employee updated successfully");
      setIsDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error: any) {
      console.error('Unexpected error updating employee:', error);
      showToast.error(`Failed to update employee: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('advocate_employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast.success("Employee deleted successfully");
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast.error("Failed to delete employee");
    }
  };

  const openDeleteConfirm = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const openAddDialog = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const openViewDialog = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AppSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Employee Details</h1>
                <p className="text-slate-600 mt-2">Manage advocate employee information</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingEmployee(null);
              }}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                  </DialogHeader>
                  <EmployeeDetailsForm
                    employee={editingEmployee || undefined}
                    onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingEmployee(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Employee List</CardTitle>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No employees added yet</p>
                    <p className="text-slate-400 mt-2">Click "Add Employee" to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.employee_id}</TableCell>
                            <TableCell>{employee.name}</TableCell>
                            <TableCell>{employee.gender}</TableCell>
                            <TableCell>{employee.phone_no}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openViewDialog(employee)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(employee)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteConfirm(employee.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details - {viewingEmployee?.employee_id}</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Employee ID</p>
                      <p className="font-medium">{viewingEmployee.employee_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Name</p>
                      <p className="font-medium">{viewingEmployee.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Father/Husband Name</p>
                      <p className="font-medium">{viewingEmployee.father_husband_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Gender</p>
                      <p className="font-medium">{viewingEmployee.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Date of Birth</p>
                      <p className="font-medium">{viewingEmployee.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Qualification</p>
                      <p className="font-medium">{viewingEmployee.qualification}</p>
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
                      <p className="font-medium">{viewingEmployee.phone_no}</p>
                    </div>
                    {viewingEmployee.alternate_phone_no && (
                      <div>
                        <p className="text-sm text-slate-600">Alternate Phone</p>
                        <p className="font-medium">{viewingEmployee.alternate_phone_no}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-600">Email ID</p>
                      <p className="font-medium">{viewingEmployee.mail_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-medium">{viewingEmployee.address}</p>
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
                      <p className="font-medium">{viewingEmployee.account_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">IFSC Code</p>
                      <p className="font-medium">{viewingEmployee.ifsc_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Branch</p>
                      <p className="font-medium">{viewingEmployee.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Bank Name</p>
                      <p className="font-medium">{viewingEmployee.bank}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Date of Joining</p>
                      <p className="font-medium">{viewingEmployee.date_of_joining}</p>
                    </div>
                    {viewingEmployee.reference && (
                      <div>
                        <p className="text-sm text-slate-600">Reference</p>
                        <p className="font-medium">{viewingEmployee.reference}</p>
                      </div>
                    )}
                    {viewingEmployee.details && (
                      <div>
                        <p className="text-sm text-slate-600">Additional Details</p>
                        <p className="font-medium">{viewingEmployee.details}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setEmployeeToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => employeeToDelete && handleDeleteEmployee(employeeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default EmployeeDetails;