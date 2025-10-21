import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Building2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LitigationAccessAccount {
  id: string;
  username: string;
  password: string;
  is_active: boolean;
  created_at: string;
}

const CreateLitigationAccessAccountList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<LitigationAccessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LitigationAccessAccount | null>(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    fetchAccounts();

    // Set up real-time subscription
    const channel = supabase
      .channel('litigation-access-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'litigation_access_accounts'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAccounts((prev) => [payload.new as LitigationAccessAccount, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAccounts((prev) =>
              prev.map((account) =>
                account.id === payload.new.id ? (payload.new as LitigationAccessAccount) : account
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAccounts((prev) =>
              prev.filter((account) => account.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("litigation_access_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch litigation access accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: LitigationAccessAccount) => {
    setSelectedAccount(account);
    setEditFormData({
      username: account.username,
      password: account.password,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;

    try {
      const { data, error } = await supabase
        .from("litigation_access_accounts")
        .update({
          username: editFormData.username,
          password: editFormData.password,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAccount.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Update failed due to permissions (RLS) or record not found.");

      // Optimistic UI update in addition to realtime
      setAccounts((prev) => prev.map((a) => (a.id === data.id ? data : a)));

      toast.success("Account updated successfully");
      setEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update account");
    }
  };

  const handleDelete = (account: LitigationAccessAccount) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;

    try {
      const { data, error } = await supabase
        .from("litigation_access_accounts")
        .delete()
        .eq("id", selectedAccount.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Delete failed due to permissions (RLS) or record not found.");

      // Optimistic UI update in addition to realtime
      setAccounts((prev) => prev.filter((a) => a.id !== selectedAccount.id));

      toast.success("Account deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="bg-gradient-to-r from-white/95 via-green-50/95 to-emerald-50/95 backdrop-blur-lg shadow-xl border-b border-gradient-to-r from-green-200/30 to-emerald-200/30">
            <div className="px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-6">
                  <SidebarTrigger className="text-slate-600 hover:text-green-600 transition-all duration-300 hover:scale-110" />
                  <Button
                    onClick={() => navigate("/admin/litigation-accounts")}
                    variant="ghost"
                    className="text-slate-600 hover:text-green-600 transition-all duration-300 hover:bg-green-50/50 rounded-xl px-4 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Litigation Accounts
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Litigation Access Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage litigation access credentials</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Litigation Access Accounts Table Section */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto">
              <Card className="bg-gradient-to-br from-white/90 via-slate-50/20 to-green-50/20 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
                <CardHeader className="relative bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-slate-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-green-600 bg-clip-text text-transparent">
                          Created Litigation Access Accounts
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">View and manage all litigation access credentials</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-green-50/50 px-4 py-2 rounded-xl">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate("/admin/create-litigation-access-account")}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Account
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                  ) : accounts.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No litigation access accounts created yet</p>
                      <Button
                        onClick={() => navigate("/admin/create-litigation-access-account")}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Account
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Username
                            </div>
                          </TableHead>
                          <TableHead>Password</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              Date Created
                            </div>
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">
                              {account.username}
                            </TableCell>
                            <TableCell>••••••••</TableCell>
                            <TableCell>
                              {new Date(account.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={account.is_active ? "default" : "secondary"}
                                className={account.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                              >
                                {account.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEdit(account)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDelete(account)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Litigation Access Account</DialogTitle>
            <DialogDescription>
              Update the username and password for this litigation access account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, username: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="text"
                value={editFormData.password}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, password: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAccount}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the litigation access account for{" "}
              <strong>{selectedAccount?.username}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

export default CreateLitigationAccessAccountList;
