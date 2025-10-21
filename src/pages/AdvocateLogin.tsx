import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Shield, Users, ArrowLeft, Mail, Lock, Eye, EyeOff, Copy, Check, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, KeyboardEvent } from "react";
import toast from "react-hot-toast";
import advocateImage from "@/assets/advocate1.png";
import { supabase } from "@/integrations/supabase/client";
import { useImagePreloader } from "@/hooks/useImagePreloader";
type LoginType = 'admin' | 'employee' | 'litigation' | null;
type ForgotPasswordStep = 'email' | 'otp' | 'password' | null;

const AdvocateLogin = () => {
  const [selectedLogin, setSelectedLogin] = useState<LoginType>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Preload images - use useMemo to prevent infinite re-renders
  const imageArray = useMemo(() => [advocateImage], []);
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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Admin login
    if (selectedLogin === 'admin') {
      try {
        const { data, error } = await supabase
          .from('admin_accounts')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          toast.error('Invalid admin credentials, if you forgot please reset your password');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('adminLogin', 'true');
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminEmail', data.email);
        toast.success('Welcome to your admin dashboard!');
        navigate('/admin-dashboard');
      } catch (error) {
        toast.error('Invalid admin credentials, if you forgot please reset your password');
      }
      setIsLoading(false);
      return;
    }

    // Employee login
    if (selectedLogin === 'employee') {
      try {
        const { data, error } = await supabase
          .from('employee_accounts')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          toast.error('Invalid credentials. Please check your username and password.');
          setIsLoading(false);
          return;
        }

        const employeeName = data.username;

        localStorage.setItem('employeeLogin', 'true');
        localStorage.setItem('employeeId', data.id);
        localStorage.setItem('employeeUsername', data.username);
        localStorage.setItem('employeeName', employeeName);
        toast.success(`Welcome ${employeeName} to Employee Dashboard`);
        navigate('/employee-dashboard');
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    // Litigation login
    if (selectedLogin === 'litigation') {
      try {
        const { data, error } = await supabase
          .from('litigation_accounts')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          toast.error('Invalid credentials. Please check your username and password.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('litigationLogin', 'true');
        localStorage.setItem('litigationId', data.id);
        localStorage.setItem('litigationUsername', data.username);
        toast.success('Welcome to Litigation Dashboard!');
        navigate('/litigation-dashboard');
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
      setIsLoading(false);
    }
  };
// ===============================
// Password Reset / OTP Handlers
// ===============================

// Send OTP
const handleSendOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/auth/send-password-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
    });

    if (!response.ok) {
      // parse JSON safely
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send OTP');
    }

    const data = await response.json();
    toast.success('OTP sent to your email!');
    setForgotPasswordStep('otp');
  } catch (error: any) {
    toast.error(error.message || 'Failed to send OTP');
  } finally {
    setIsLoading(false);
  }
};
const handleVerifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  if (newPassword.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  setIsLoading(true);

  try {
    const otpCode = otp.join('');

    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/auth/verify-otp-and-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, otp: otpCode, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to reset password');
    }

    await response.json();
    toast.success('Password reset successfully!');
    resetForm();
  } catch (error: any) {
    toast.error(error.message || 'Failed to reset password');
  } finally {
    setIsLoading(false);
  }
};
// Handles pasting OTP into the first input
const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pasteData = e.clipboardData.getData('Text').trim();
  if (!/^\d{6}$/.test(pasteData)) return; // only accept 6 digits

  const newOtp = pasteData.split('').slice(0, 6);
  setOtp(newOtp);
};



// ===============================
// Form & Navigation Helpers
// ===============================

const resetForm = () => {
  setEmail('');
  setUsername('');
  setPassword('');
  setShowPassword(false);
  setCopiedField(null);
  setForgotPasswordStep(null);
  setOtp(Array(6).fill(''));
  setNewPassword('');
  setConfirmPassword('');
  setResetEmail('');
};

const handleBackToSelection = () => {
  setSelectedLogin(null);
  resetForm();
};

const handleLoginSelection = (type: LoginType) => {
  setSelectedLogin(type);
  resetForm();
};

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.");
  }

  function handleOtpChange(index: number, value: string): void {
    throw new Error("Function not implemented.");
  }

  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Back to Home - Top Left */}
      <Link to="/" className="absolute top-6 left-6 z-10">
        <Button variant="outline" className="bg-white text-black border border-black hover:bg-black hover:text-white transition-colors">
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
              <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-purple-200/30 rounded-full blur-lg animate-float-reverse"></div>
              <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-indigo-200/30 rounded-full blur-md animate-pulse-slow"></div>
            </div>
            
            {/* Main illustration container - Bigger on mobile */}
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-lg">
              <img src={cachedImages[advocateImage] || advocateImage} alt="Legal Advocate Illustration" className={`w-full h-auto object-contain drop-shadow-2xl transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`} loading="eager" decoding="sync" />
            </div>
          </div>
          
          {/* Right Side - Login Selection or Form */}
          <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-md">
              <Card className={`bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden transition-opacity duration-300 ${showContent ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
                
                {/* Login Selection View - Only show if no login selected and no forgot password */}
                {!selectedLogin && !forgotPasswordStep && <>
                    <CardHeader className="text-center pb-6 pt-8 px-8">
                      <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Login Portal</CardTitle>
                      <p className="text-slate-500 text-sm">Choose your login type to continue</p>
                    </CardHeader>
                    <CardContent className="space-y-4 px-8 pb-8">
                      <Button onClick={() => handleLoginSelection('admin')} className="w-full h-14 bg-admin-red hover:bg-admin-red-hover text-admin-red-foreground font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-red-200">
                        <Shield className="h-6 w-6" />
                        <span className="text-lg">Admin Login</span>
                      </Button>
                      
                      <Button onClick={() => handleLoginSelection('employee')} className="w-full h-14 bg-employee-legal hover:bg-employee-legal-hover text-employee-legal-foreground font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-300">
                        <Users className="h-6 w-6" />
                        <span className="text-lg">Employee Login</span>
                      </Button>
                      
                      <Button onClick={() => handleLoginSelection('litigation')} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-green-300">
                        <Users className="h-6 w-6" />
                        <span className="text-lg">Litigation Login</span>
                      </Button>
                    </CardContent>
                  </>}

                {/* Forgot Password Flow */}
                {forgotPasswordStep && (
                  <>
                    {/* Header with back button */}
                    <div className="px-6 py-4 text-center text-white font-medium relative bg-admin-red">
                      <button 
                        onClick={() => {
                          setForgotPasswordStep(null);
                          setResetEmail('');
                          setOtp(["", "", "", "", "", ""]);
                          setNewPassword('');
                          setConfirmPassword('');
                        }} 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded text-sm font-medium transition-all duration-300 flex items-center gap-1 border-2 border-white bg-admin-red text-white hover:bg-admin-red-hover"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                      </button>
                      Reset Password
                    </div>

                    <CardContent className="p-6 animate-fade-in">
                      {forgotPasswordStep === 'email' && (
                        <>
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Mail className="h-8 w-8 text-admin-red" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">Forgot Password</h3>
                            <p className="text-sm text-slate-600">
                              Enter your email address and we'll send you an OTP
                            </p>
                          </div>

                          <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                              <FloatingInput
                                id="reset-email"
                                label="Email Address"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                              />
                            </div>

                            <Button 
                              type="submit" 
                              disabled={isLoading}
                              className="w-full h-12 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-800 text-white"
                            >
                              {isLoading ? 'Sending...' : 'Send OTP'}
                            </Button>
                          </form>
                        </>
                      )}

                      {forgotPasswordStep === 'otp' && (
                        <>
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Lock className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">Enter OTP</h3>
                            <p className="text-sm text-slate-600 mb-1">
                              We've sent a 6-digit code to
                            </p>
                            <p className="text-sm font-medium text-slate-800">{resetEmail}</p>
                          </div>

                          <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="flex justify-center gap-2 mb-6">
                              {otp.map((digit, index) => (
                                <input
                                  key={index}
                                  id={`otp-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(index, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                  onPaste={index === 0 ? handleOtpPaste : undefined}
                                  className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-admin-red focus:outline-none transition-colors"
                                />
                              ))}
                            </div>

                            <div className="space-y-4">
                              <div className="relative">
                                <FloatingInput
                                  id="new-password"
                                  label="New Password"
                                  type={showPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  required
                                />
                                <button 
                                  type="button" 
                                  onClick={() => setShowPassword(!showPassword)} 
                                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>

                              <div>
                                <FloatingInput
                                  id="confirm-password"
                                  label="Confirm Password"
                                  type={showPassword ? "text" : "password"}
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <Button 
                              type="submit" 
                              disabled={isLoading}
                              className="w-full h-12 text-sm font-medium rounded-lg bg-admin-red hover:bg-admin-red-hover text-white"
                            >
                              {isLoading ? 'Verifying...' : 'Verify OTP & Reset Password'}
                            </Button>

                            <button
                              type="button"
                              onClick={() => {
                                setForgotPasswordStep('email');
                                setOtp(["", "", "", "", "", ""]);
                              }}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Resend OTP
                            </button>
                          </form>
                        </>
                      )}
                    </CardContent>
                  </>
                )}

                {/* Login Form View */}
                {selectedLogin && !forgotPasswordStep && <>
                    {/* Header with back button */}
                    <div className={`px-6 py-4 text-center text-white font-medium relative ${selectedLogin === 'admin' ? 'bg-admin-red' : selectedLogin === 'litigation' ? 'bg-green-600' : 'bg-employee-legal'}`}>
                      <button onClick={handleBackToSelection} className={`absolute left-4 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded text-sm font-medium transition-all duration-300 flex items-center gap-1 border-2 border-white ${selectedLogin === 'admin' ? 'bg-admin-red text-white hover:bg-admin-red-hover' : selectedLogin === 'litigation' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-employee-legal text-white hover:bg-employee-legal-hover'}`}>
                        <ArrowLeft className="h-3 w-3" />
                        Back
                      </button>
                      {selectedLogin === 'admin' ? 'Admin Login' : selectedLogin === 'litigation' ? 'Litigation Login' : 'Employee Login'}
                    </div>

                    <CardContent className="p-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className={`text-xl font-bold mb-1 ${selectedLogin === 'admin' ? 'text-admin-red' : selectedLogin === 'litigation' ? 'text-green-600' : 'text-employee-legal'}`}>
                          Welcome Back
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Sign in to your Legal account as {selectedLogin === 'admin' ? 'Admin' : selectedLogin === 'litigation' ? 'Litigation' : 'Employee'}
                        </p>
                        
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <FloatingInput 
                            id={selectedLogin === 'admin' ? "email" : "username"} 
                            label={selectedLogin === 'admin' ? 'Email Address' : 'Username'}
                            type={selectedLogin === 'admin' ? "email" : "text"} 
                            value={selectedLogin === 'admin' ? email : username} 
                            onChange={e => selectedLogin === 'admin' ? setEmail(e.target.value) : setUsername(e.target.value)} 
                            required 
                          />
                        </div>
                        
                        <div className="relative">
                          <FloatingInput 
                            id="password" 
                            label="Password"
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        {selectedLogin === 'admin' && (
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setForgotPasswordStep('email');
                                setSelectedLogin(null);
                              }}
                              className="text-sm text-admin-red hover:text-admin-red-hover font-medium"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className={`w-full h-10 text-sm font-medium rounded-lg mt-6 transition-all duration-300 transform hover:scale-[1.02] ${selectedLogin === 'admin' ? 'bg-admin-red hover:bg-admin-red-hover text-admin-red-foreground' : selectedLogin === 'litigation' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-employee-legal hover:bg-employee-legal-hover text-employee-legal-foreground'}`}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Signing in...
                            </div>
                          ) : (
                            `Sign In as ${selectedLogin === 'admin' ? 'Admin' : selectedLogin === 'litigation' ? 'Litigation' : 'Employee'}`
                          )}
                        </Button>
                      </form>

                      {/* Demo Credentials */}
                      
                    </CardContent>
                  </>}
                
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AdvocateLogin;