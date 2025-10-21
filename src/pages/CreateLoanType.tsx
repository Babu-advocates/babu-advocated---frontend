import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scale, ArrowLeft, Plus, Edit, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { showToast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";

interface LoanType {
  id: string;
  name: string;
  created_at: string;
}

const CreateLoanType = () => {
  const navigate = useNavigate();
  const [loanTypeName, setLoanTypeName] = useState("");
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLoanType, setEditingLoanType] = useState<LoanType | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const fetchLoanTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('loan_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan types:', error);
        showToast.error('Failed to fetch loan types');
      } else {
        setLoanTypes(data || []);
      }
    } catch (error) {
      console.error('Error fetching loan types:', error);
      showToast.error('Failed to fetch loan types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanTypeName.trim()) {
      showToast.error("Please enter a loan type name");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('loan_types')
        .insert({
          name: loanTypeName.trim()
        });

      if (error) {
        console.error('Error creating loan type:', error);
        showToast.error('Failed to create loan type');
      } else {
        showToast.success('Loan type created successfully!');
        setLoanTypeName("");
        await fetchLoanTypes();
      }
    } catch (error) {
      console.error('Error creating loan type:', error);
      showToast.error('Failed to create loan type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (loanType: LoanType) => {
    setEditingLoanType(loanType);
    setEditingName(loanType.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      showToast.error("Please enter a loan type name");
      return;
    }

    if (!editingLoanType) return;

    try {
      const { error } = await supabase
        .from('loan_types')
        .update({ name: editingName.trim() })
        .eq('id', editingLoanType.id);

      if (error) {
        console.error('Error updating loan type:', error);
        showToast.error('Failed to update loan type');
      } else {
        showToast.success('Loan type updated successfully!');
        setEditDialogOpen(false);
        setEditingLoanType(null);
        setEditingName("");
        await fetchLoanTypes();
      }
    } catch (error) {
      console.error('Error updating loan type:', error);
      showToast.error('Failed to update loan type');
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingLoanType(null);
    setEditingName("");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loan_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting loan type:', error);
        showToast.error('Failed to delete loan type');
      } else {
        showToast.success('Loan type deleted successfully!');
        await fetchLoanTypes();
      }
    } catch (error) {
      console.error('Error deleting loan type:', error);
      showToast.error('Failed to delete loan type');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover-scale transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200">
                      <Scale className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <div className="transition-transform duration-200 group-hover:translate-x-1">
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-600">Create Loan Type/Product</h1>
                      <p className="text-sm text-slate-600 transition-colors duration-200 group-hover:text-blue-600">Add a new loan type or product to the system</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => navigate('/admin-dashboard')}
                    variant="ghost" 
                    className="text-slate-600 hover-scale transition-all duration-200 hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 group" 
                  >
                    <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8 space-y-8">
              {/* Create New Loan Type Card */}
              <div className="max-w-2xl mx-auto">
                <Card className="bg-gradient-to-br from-white/95 to-blue-50/50 backdrop-blur-sm shadow-elegant border border-white/20 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                          New Loan Type/Product
                        </CardTitle>
                        <CardDescription className="text-slate-600 mt-1">
                          Enter the name of the new loan type or product you want to add to the system.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="loanTypeName" className="text-slate-700 font-medium">
                          Loan Type/Product Name
                        </Label>
                        <Input
                          id="loanTypeName"
                          type="text"
                          value={loanTypeName}
                          onChange={(e) => setLoanTypeName(e.target.value)}
                          placeholder="e.g. Home Loan, Personal Loan, Business Loan"
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Add Loan Type"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Existing Loan Types */}
              <div className="max-w-4xl mx-auto">
                <Card className="bg-gradient-to-br from-white/95 to-blue-50/50 backdrop-blur-sm shadow-elegant border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                      Existing Loan Types/Products
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Manage your existing loan types and products. Click edit to modify or delete to remove.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : loanTypes.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No loan types found. Create your first loan type above.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Loan Type/Product Name</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loanTypes.map((loanType) => (
                            <TableRow key={loanType.id}>
                              <TableCell>
                                <span className="font-medium">{loanType.name}</span>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {new Date(loanType.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(loanType)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the loan type "{loanType.name}". This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(loanType.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
            </div>
          </main>
        </div>
      </div>

      {/* Edit Loan Type Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <button
            onClick={handleCancelEdit}
            className="absolute right-4 top-4 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Edit Loan Type
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update the name for this loan type/product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-loan-type-name" className="text-slate-700 font-semibold">
                Loan Type/Product Name
              </Label>
              <Input
                id="edit-loan-type-name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Enter loan type name"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              className="px-6 bg-slate-900 hover:bg-slate-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default CreateLoanType;