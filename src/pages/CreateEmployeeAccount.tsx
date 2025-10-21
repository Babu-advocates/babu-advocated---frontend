import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArrowLeft, UserPlus, Save, Users, Eye, EyeOff, Calendar, Shield, Sparkles, Edit, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

const CreateEmployeeAccount = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeAccounts, setEmployeeAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [accountToToggle, setAccountToToggle] = useState<any>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch employee accounts on component mount and after successful creation
  const fetchEmployeeAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const { data, error } = await supabase
        .from('employee_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employee accounts:', error);
        showToast.error("Failed to load employee accounts");
      } else {
        setEmployeeAccounts(data || []);
      }
    } catch (error) {
      console.error('Error fetching employee accounts:', error);
      showToast.error("Failed to load employee accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchEmployeeAccounts();
    
    // Set up real-time subscription for employee_accounts
    const channel = supabase
      .channel('employee-accounts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_accounts' }, 
        () => {
          fetchEmployeeAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('employee_accounts')
        .insert({
          username: username.trim(),
          password: password, // In production, this should be hashed
          // created_by will be set properly when admin authentication is implemented
        });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          showToast.error("Username already exists. Please choose a different username.");
        } else {
          showToast.error(`Failed to create employee account: ${error.message}`);
        }
        return;
      }

      showToast.success("Employee account created successfully!");
      setUsername("");
      setPassword("");
      setCreateDialogOpen(false);
      
      // Refresh the employee accounts list
      fetchEmployeeAccounts();
    } catch (error) {
      console.error('Error creating employee account:', error);
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setEditUsername(account.username);
    setEditPassword(account.password);
    setEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingAccount(null);
    setEditUsername("");
    setEditPassword("");
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;
    
    if (!editUsername.trim() || !editPassword.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('employee_accounts')
        .update({
          username: editUsername.trim(),
          password: editPassword,
        })
        .eq('id', editingAccount.id);

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          showToast.error("Username already exists. Please choose a different username.");
        } else {
          showToast.error(`Failed to update account: ${error.message}`);
        }
        return;
      }

      showToast.success("Account updated successfully!");
      handleCancelEdit();
      fetchEmployeeAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (account: any) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('employee_accounts')
        .delete()
        .eq('id', accountToDelete.id);

      if (error) {
        console.error('Supabase error:', error);
        showToast.error(`Failed to delete account: ${error.message}`);
        return;
      }

      showToast.success("Employee account deleted successfully!");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      fetchEmployeeAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = (account: any) => {
    setAccountToToggle(account);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!accountToToggle) return;

    setIsTogglingStatus(true);

    try {
      const { error } = await supabase
        .from('employee_accounts')
        .update({
          is_active: !accountToToggle.is_active,
        })
        .eq('id', accountToToggle.id);

      if (error) {
        console.error('Supabase error:', error);
        showToast.error(`Failed to update status: ${error.message}`);
        return;
      }

      showToast.success(`Account ${!accountToToggle.is_active ? 'activated' : 'deactivated'} successfully!`);
      setStatusDialogOpen(false);
      setAccountToToggle(null);
      fetchEmployeeAccounts();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="bg-gradient-to-r from-white/95 via-blue-50/95 to-purple-50/95 backdrop-blur-lg shadow-xl border-b border-gradient-to-r from-blue-200/30 to-purple-200/30">
            <div className="px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-6">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110" />
                  <Button
                    onClick={() => navigate("/admin-dashboard")}
                    variant="ghost"
                    className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50/50 rounded-xl px-4 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Create Employee Account
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage advocate login credentials</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto">
              {/* Add Employee Button */}
              <div className="mb-8">
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          </main>

          {/* Enhanced Employee Accounts Table Section */}
          <div className="px-8 pb-8">
            <div className="max-w-6xl mx-auto">
              <Card className="bg-gradient-to-br from-white/90 via-slate-50/20 to-blue-50/20 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-blue-600/5"></div>
                <CardHeader className="relative bg-gradient-to-r from-slate-600/10 to-blue-600/10 border-b border-slate-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl shadow-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                          Created Employee Accounts
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">View and manage all advocate login credentials</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-50/50 px-4 py-2 rounded-xl">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {employeeAccounts.length} Account{employeeAccounts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8">
                  {isLoadingAccounts ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <span className="ml-4 text-slate-600 font-medium">Loading employee accounts...</span>
                    </div>
                  ) : employeeAccounts.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/50">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200/50">
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>Username</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Password</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Date Created</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6">Status</TableHead>
                            <TableHead className="text-slate-700 font-bold py-4 px-6 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employeeAccounts.map((account, index) => (
                            <TableRow key={account.id} className={`border-slate-100/50 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                            }`}>
                              {/* Username Column */}
                              <TableCell className="font-bold text-slate-800 py-4 px-6">
                                {account.username}
                              </TableCell>

                              {/* Password Column */}
                              <TableCell className="font-mono text-slate-600 py-4 px-6">
                                <div className="bg-slate-100/50 rounded-lg px-3 py-1 inline-block">
                                  {account.password}
                                </div>
                              </TableCell>

                              {/* Date Created Column */}
                              <TableCell className="text-slate-600 py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span>
                                    {new Date(account.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Status Column with Toggle */}
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={account.is_active}
                                    onCheckedChange={() => handleStatusToggle(account)}
                                    className="data-[state=checked]:bg-green-500"
                                  />
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    account.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {account.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Actions Column */}
                              <TableCell className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    onClick={() => handleEdit(account)}
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-300 text-blue-600 hover:bg-blue-50 h-9 px-3"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteClick(account)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-600 hover:bg-red-50 h-9 px-3"
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
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                        <UserPlus className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 mb-3">No Employee Accounts Yet</h3>
                      <p className="text-slate-500 mb-2">Create your first employee account using the form above.</p>
                      <p className="text-sm text-slate-400">All created accounts will appear here with their details.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-slate-800">Edit Employee Account</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                className="h-8 w-8 rounded-full hover:bg-red-100 text-slate-600 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DialogDescription className="text-slate-500">
              Update the username and password for this advocate employee account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-slate-700 font-semibold">
                Username
              </Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-slate-700 font-semibold">
                Password
              </Label>
              <PasswordInput
                id="edit-password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter password"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAccount}
              disabled={isUpdating}
              className="h-11 px-6 bg-slate-800 hover:bg-slate-900"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for <strong>{accountToDelete?.username}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Toggle Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {accountToToggle?.is_active ? 'Deactivate' : 'Activate'} Employee Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {accountToToggle?.is_active ? 'deactivate' : 'activate'} the account for <strong>{accountToToggle?.username}</strong>? 
              {accountToToggle?.is_active && ' This will prevent login access to this account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTogglingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              disabled={isTogglingStatus}
              className={accountToToggle?.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isTogglingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                accountToToggle?.is_active ? 'Deactivate' : 'Activate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Employee Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Employee Login for Advocates</DialogTitle>
            <DialogDescription className="text-slate-500">
              Create secure login credentials for advocate employees
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-semibold flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Username</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter unique username"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Password</span>
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="h-11"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isLoading}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Employee Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default CreateEmployeeAccount;