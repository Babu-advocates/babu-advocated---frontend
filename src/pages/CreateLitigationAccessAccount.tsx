import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const CreateLitigationAccessAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("litigation_access_accounts").insert([
        {
          username: formData.username,
          password: formData.password,
          created_by: session?.session?.user?.id || null,
        },
      ]);

      if (error) throw error;

      toast.success("Litigation access account created successfully");
      navigate("/admin/litigation-access-accounts");
    } catch (error: any) {
      toast.error(error.message || "Failed to create litigation access account");
    } finally {
      setLoading(false);
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
                    onClick={() => navigate("/admin/litigation-access-accounts")}
                    variant="ghost"
                    className="text-slate-600 hover:text-green-600 transition-all duration-300 hover:bg-green-50/50 rounded-xl px-4 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Litigation Access Accounts
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-white/90 via-slate-50/20 to-green-50/20 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
                <CardHeader className="relative bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-slate-200/30">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-green-600 bg-clip-text text-transparent">
                    Create Litigation Access Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative">
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <PasswordInput
                        id="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        className="mt-1"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CreateLitigationAccessAccount;
