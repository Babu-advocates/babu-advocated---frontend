import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArrowLeft, Building, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";

const CreateBankAccount = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bankName, setBankName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !bankName.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .insert({
          username: username.trim(),
          password: password, // In production, this should be hashed
          bank_name: bankName.trim(),
          created_by: null // Will need authentication later
        });

      if (error) {
        if (error.code === '23505') {
          showToast.error("Username already exists");
        } else {
          showToast.error("Failed to create bank account");
        }
        return;
      }

      showToast.success("Bank account created successfully!");
      setUsername("");
      setPassword("");
      setBankName("");
      navigate("/admin-dashboard");
    } catch (error) {
      console.error('Error creating bank account:', error);
      showToast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <Button
                    onClick={() => navigate("/admin-dashboard")}
                    variant="ghost"
                    className="text-slate-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building className="h-6 w-6 text-blue-600" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                    Create Bank Account
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-sm shadow-elegant border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <span className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                      Bank Login Account
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-slate-700 font-medium">
                        Bank Name
                      </Label>
                      <Input
                        id="bankName"
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter bank name"
                        className="w-full hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-slate-700 font-medium">
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 font-medium">
                        Password
                      </Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 hover:shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Submit
                        </>
                      )}
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

export default CreateBankAccount;