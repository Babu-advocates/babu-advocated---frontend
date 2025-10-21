import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Landmark, Users, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import bankImage from "@/assets/bank-manager.png";
import { supabase } from "@/integrations/supabase/client";
import { useImagePreloader } from "@/hooks/useImagePreloader";
type LoginType = 'manager' | 'employee' | 'litigation-access' | null;
const BankLogin = () => {
  const [selectedLogin, setSelectedLogin] = useState<LoginType>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Preload images - use useMemo to prevent infinite re-renders
  const imageArray = useMemo(() => [bankImage], []);
  const {
    imagesLoaded,
    cachedImages
  } = useImagePreloader(imageArray);
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    if (imagesLoaded) {
      setShowContent(true);
    }
  }, [imagesLoaded]);
  const demoCredentials = {
    manager: {
      email: "manager@yourbank.com",
      password: "manager123"
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (selectedLogin === 'manager') {
      if (email === demoCredentials.manager.email && password === demoCredentials.manager.password) {
        localStorage.setItem('bankManagerLogin', 'true');
        toast.success('Welcome to your bank manager dashboard!');
        navigate('/bank-manager-dashboard');
      } else {
        toast.error('Invalid manager credentials. Please use the demo credentials.');
      }
      setIsLoading(false);
    } else if (selectedLogin === 'employee') {
      try {
        const {
          data,
          error
        } = await supabase.from('bank_accounts').select('*').eq('username', username).eq('password', password).eq('is_active', true).single();
        if (error || !data) {
          toast.error('Invalid credentials. Please check your username and password.');
          setIsLoading(false);
          return;
        }

        // Store bank employee info for session management
        localStorage.setItem('bankEmployeeLogin', 'true');
        localStorage.setItem('bankAccountId', data.id);
        localStorage.setItem('bankName', data.bank_name);
        localStorage.setItem('bankUsername', data.username);
        toast.success(`Welcome Bank Employee from ${data.bank_name}!`);
        navigate('/bank-employee-dashboard');
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
      setIsLoading(false);
    } else if (selectedLogin === 'litigation-access') {
      try {
        const {
          data,
          error
        } = await supabase.from('litigation_access_accounts').select('*').eq('username', username).eq('password', password).eq('is_active', true).single();
        if (error || !data) {
          toast.error('Invalid credentials. Please check your username and password.');
          setIsLoading(false);
          return;
        }

        // Store litigation access info for session management
        localStorage.setItem('litigationAccessLogin', 'true');
        localStorage.setItem('litigationAccessId', data.id);
        localStorage.setItem('litigationAccessUsername', data.username);
        toast.success('Welcome to Litigation Access Dashboard!');
        navigate('/litigation-access-dashboard');
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
  };
  const handleBackToSelection = () => {
    setSelectedLogin(null);
    resetForm();
  };
  const handleLoginSelection = (type: LoginType) => {
    setSelectedLogin(type);
    resetForm();
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 relative overflow-hidden">
      {/* Back to Home - Top Left */}
      <Link to="/" className="absolute top-6 left-6 z-10">
        <Button variant="outline" className="bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>
      
      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Illustration Area */}
          <div className="relative flex items-center justify-center p-4 lg:p-8">
            {/* Background decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float-slow"></div>
              <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-indigo-200/30 rounded-full blur-lg animate-float-reverse"></div>
              <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-slate-200/30 rounded-full blur-md animate-pulse-slow"></div>
            </div>
            
            {/* Main illustration container */}
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-lg">
              <img src={cachedImages[bankImage] || bankImage} alt="Bank Professional Illustration" className={`w-full h-auto object-contain drop-shadow-2xl transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`} loading="eager" decoding="sync" />
            </div>
          </div>
          
          {/* Right Side - Login Selection or Form */}
          <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-md">
              <Card className={`bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden transition-opacity duration-300 ${showContent ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
                
                {/* Login Selection View */}
                {!selectedLogin && <>
                    <CardHeader className="text-center pb-6 pt-8 px-8">
                      <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Bank Login Portal</CardTitle>
                      <p className="text-slate-500 text-sm">Choose your login type to continue</p>
                    </CardHeader>
                    <CardContent className="space-y-4 px-8 pb-8">
                      <Button onClick={() => handleLoginSelection('manager')} className="w-full h-14 bg-admin-blue hover:bg-admin-blue-hover text-white font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200">
                        <Landmark className="h-6 w-6" />
                        <span className="text-lg">Bank Manager Login</span>
                      </Button>
                      
                      <Button onClick={() => handleLoginSelection('employee')} className="w-full h-14 bg-employee-legal hover:bg-employee-legal-hover text-white font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-green-300">
                        <Users className="h-6 w-6" />
                        <span className="text-lg">Bank Employee Login</span>
                      </Button>
                      
                      <Button onClick={() => handleLoginSelection('litigation-access')} className="w-full h-14 bg-employee-legal hover:bg-employee-legal-hover font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-green-300 text-neutral-50 bg-green-800 hover:bg-green-700">
                        <Users className="h-6 w-6" />
                        <span className="text-lg">Litigation Access Login</span>
                      </Button>
                    </CardContent>
                  </>}

                {/* Login Form View */}
                {selectedLogin && <>
                    {/* Header with back button */}
                    <div className={`px-6 py-4 text-center text-white font-medium relative ${selectedLogin === 'manager' ? 'bg-admin-blue' : selectedLogin === 'litigation-access' ? 'bg-employee-legal' : 'bg-employee-legal'}`}>
                      <button onClick={handleBackToSelection} className={`absolute left-4 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded text-sm font-medium transition-all duration-300 flex items-center gap-1 border-2 border-white ${selectedLogin === 'manager' ? 'bg-admin-blue text-white hover:bg-admin-blue-hover' : selectedLogin === 'litigation-access' ? 'bg-employee-legal text-white hover:bg-employee-legal-hover' : 'bg-employee-legal text-white hover:bg-employee-legal-hover'}`}>
                        <ArrowLeft className="h-3 w-3" />
                        Back
                      </button>
                      {selectedLogin === 'manager' ? 'Bank Manager Login' : selectedLogin === 'litigation-access' ? 'Litigation Access Login' : 'Bank Employee Login'}
                    </div>

                    <CardContent className="p-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className={`text-xl font-bold mb-1 ${selectedLogin === 'manager' ? 'text-admin-blue' : selectedLogin === 'litigation-access' ? 'text-employee-legal' : 'text-employee-legal'}`}>
                          Welcome Back
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Sign in to your {selectedLogin === 'manager' ? 'Banking Manager' : selectedLogin === 'litigation-access' ? 'Litigation Access' : 'Banking Employee'} account
                        </p>
                        
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <FloatingInput id={selectedLogin === 'manager' ? "email" : "username"} label={selectedLogin === 'manager' ? 'Email Address' : 'Username'} type={selectedLogin === 'manager' ? "email" : "text"} value={selectedLogin === 'manager' ? email : username} onChange={e => selectedLogin === 'manager' ? setEmail(e.target.value) : setUsername(e.target.value)} required />
                        </div>
                        
                        <div className="relative">
                          <FloatingInput id="password" label="Password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        <Button type="submit" disabled={isLoading} className={`w-full h-10 text-sm font-medium rounded-lg mt-6 transition-all duration-300 transform hover:scale-[1.02] text-white ${selectedLogin === 'manager' ? 'bg-admin-blue hover:bg-admin-blue-hover' : selectedLogin === 'litigation-access' ? 'bg-employee-legal hover:bg-employee-legal-hover' : 'bg-employee-legal hover:bg-employee-legal-hover'}`}>
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Signing in...
                            </div>
                          ) : (
                            `Sign In as ${selectedLogin === 'manager' ? 'Bank Manager' : selectedLogin === 'litigation-access' ? 'Litigation Access' : 'Bank Employee'}`
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </>}
                
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default BankLogin;