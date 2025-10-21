import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Clock, CheckCircle, X, History, UserCheck, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";
import { PastAttendance } from "@/components/PastAttendance";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceRecord {
  type: 'check-in' | 'check-out';
  timestamp: Date;
  photo: string;
  location?: string;
  date: string;
}

// Simulate getting today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export default function EmployeeAttendance() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out'>('check-in');
  const [location, setLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isAttendanceComplete, setIsAttendanceComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // Check if user has already completed attendance for today
  const checkTodayAttendance = useCallback(async () => {
    const today = getTodayDateString();
    const username = localStorage.getItem('employeeUsername');
    
    if (!username) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_username', username)
      .eq('date', today)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error checking attendance:', error);
      return;
    }

    if (!data || data.length === 0) {
      setAttendanceType('check-in');
      setIsAttendanceComplete(false);
    } else {
      const hasCheckIn = data.some(record => record.type === 'check-in');
      const hasCheckOut = data.some(record => record.type === 'check-out');
      
      if (hasCheckIn && hasCheckOut) {
        // Both check-in and check-out done - disable everything
        setIsAttendanceComplete(true);
      } else if (hasCheckIn && !hasCheckOut) {
        // Only check-in done - allow check-out
        setAttendanceType('check-out');
        setIsAttendanceComplete(false);
      } else {
        // Start fresh
        setAttendanceType('check-in');
        setIsAttendanceComplete(false);
      }
    }
  }, []);

  useEffect(() => {
    checkTodayAttendance();
  }, [checkTodayAttendance]);

  const getLocation = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      showToast.error("Camera access denied. Please allow camera permissions.");
      setIsCapturing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(photoData);
        
        // Stop camera after capture
        stopCamera();
        
        // Try to get location
        setIsGettingLocation(true);
        try {
          const currentLocation = await getLocation();
          setLocation(currentLocation);
          showToast.success("Photo & Location captured successfully!");
        } catch (error) {
          console.error('Error getting location:', error);
          showToast.success("Photo captured successfully!");
        } finally {
          setIsGettingLocation(false);
        }
      }
    }
  }, [getLocation, stopCamera]);

  const handleSubmit = useCallback(async () => {
    if (!capturedImage) {
      showToast.error("Please capture a photo before submitting attendance.");
      return;
    }

    if (!location) {
      showToast.error("Location is required. Please wait for location to be captured.");
      return;
    }

    const username = localStorage.getItem('employeeUsername');
    const employeeId = localStorage.getItem('employeeId');

    if (!username) {
      showToast.error("Employee session not found. Please login again.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload image to Cloudinary via edge function
      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/cloudinary/upload-attendance-to-cloudinary`, {

  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    image: capturedImage,
    employeeUsername: username,
  }),
});

const uploadData = await response.json();
if (!response.ok || !uploadData.success) {
  throw new Error(uploadData.error || "Failed to upload image to Cloudinary");
}



      clearInterval(progressInterval);
      setUploadProgress(100);

      const cloudinaryUrl = uploadData.url;

      // Store attendance record with Cloudinary URL
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeId || username,
          employee_username: username,
          type: attendanceType,
          timestamp: new Date().toISOString(),
          photo: cloudinaryUrl,
          location: location || 'Location unavailable',
          date: getTodayDateString(),
        });

      if (error) throw error;

      setTimeout(() => {
        showToast.success(`${attendanceType === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully!`);
        
        // Reset form
        setCapturedImage(null);
        setLocation('');
        setUploadProgress(0);
        setIsUploading(false);
        stopCamera();
        
        // Update attendance type for next action
        checkTodayAttendance();
      }, 500);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setIsUploading(false);
      setUploadProgress(0);
      showToast.error("Failed to record attendance. Please try again.");
    }
  }, [capturedImage, attendanceType, location, stopCamera, checkTodayAttendance]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setLocation('');
    startCamera();
  }, [startCamera]);

  const mockAttendanceData = [
    {
      date: '2024-01-15',
      checkIn: '09:00 AM',
      checkOut: '05:30 PM',
      hoursWorked: '8h 30m',
      status: 'Present' as const,
      location: 'Main Office - Delhi',
      tasks: ['Case review: Bank vs. ABC Corp', 'Client consultation', 'Document preparation']
    },
    {
      date: '2024-01-14',
      checkIn: '08:45 AM',
      checkOut: '06:00 PM',
      hoursWorked: '9h 15m',
      status: 'Present' as const,
      location: 'Main Office - Delhi',
      tasks: ['Court hearing preparation', 'Legal research', 'Team meeting']
    },
    {
      date: '2024-01-13',
      checkIn: '09:15 AM',
      checkOut: '05:45 PM',
      hoursWorked: '8h 30m',
      status: 'Present' as const,
      location: 'Main Office - Delhi',
      tasks: ['Client documentation', 'Contract review', 'Administrative tasks']
    }
  ];

  const todayAttendanceStatus = () => {
    const today = getTodayDateString();
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    if (todayRecords.length === 0) {
      return { status: 'Not Started', color: 'bg-slate-100 text-slate-600' };
    }
    
    const lastRecord = todayRecords[todayRecords.length - 1];
    if (lastRecord.type === 'check-in') {
      return { status: 'Checked In', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Checked Out', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const todayStatus = todayAttendanceStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/employee-dashboard')}
            className="text-slate-700 hover:text-slate-900 hover:bg-white/50 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          
          <CardHeader className="text-center pb-8 pt-10 relative">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                  <UserCheck className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Employee Attendance
            </CardTitle>
            <CardDescription className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
              Secure attendance tracking with photo verification and GPS location
            </CardDescription>
            
            {/* Today's Status */}
            <div className="flex items-center justify-center gap-3 mt-6 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md w-fit mx-auto border border-slate-200/50">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Today's Status:</span>
              <Badge className={`${todayStatus.color} px-4 py-1 text-sm font-semibold shadow-sm`}>
                {todayStatus.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="relative px-6 md:px-10 pb-10">
            <Tabs defaultValue="capture" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-slate-100/80 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="capture" 
                  className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 rounded-lg transition-all duration-200"
                >
                  <Camera className="h-5 w-5" />
                  Capture Attendance
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 rounded-lg transition-all duration-200"
                >
                  <History className="h-5 w-5" />
                  Attendance History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="capture" className="space-y-8">
                {/* Attendance Type Selection */}
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    variant={attendanceType === 'check-in' ? 'default' : 'outline'}
                    onClick={() => setAttendanceType('check-in')}
                    className={`flex items-center gap-3 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      attendanceType === 'check-in' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl scale-105' 
                        : 'border-2 border-slate-300 text-slate-400 bg-slate-50 cursor-not-allowed'
                    }`}
                    disabled={attendanceType !== 'check-in' || isAttendanceComplete}
                  >
                    <Clock className="h-6 w-6" />
                    Check In
                  </Button>
                  <Button
                    variant={attendanceType === 'check-out' ? 'default' : 'outline'}
                    onClick={() => setAttendanceType('check-out')}
                    className={`flex items-center gap-3 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      attendanceType === 'check-out' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl scale-105' 
                        : 'border-2 border-slate-300 text-slate-400 bg-slate-50 cursor-not-allowed'
                    }`}
                    disabled={attendanceType !== 'check-out' || isAttendanceComplete}
                  >
                    <CheckCircle className="h-6 w-6" />
                    Check Out
                  </Button>
                </div>

                {/* Camera Section */}
                <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
                  <CardContent className="p-8">
                    {isAttendanceComplete ? (
                      <div className="text-center py-16 px-6">
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                          <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-6 shadow-2xl">
                            <CheckCircle className="h-20 w-20 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 mb-3">
                          Attendance Complete! 🎉
                        </p>
                        <p className="text-slate-600 text-lg">
                          You have successfully completed your check-in and check-out for today.
                        </p>
                      </div>
                    ) : !capturedImage ? (
                      <div className="space-y-6">
                        {!isCapturing ? (
                          <div className="text-center py-12 px-6">
                            <div className="relative inline-block mb-6">
                              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl" />
                              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-8 shadow-lg">
                                <Camera className="h-20 w-20 text-blue-600" />
                              </div>
                            </div>
                            <p className="text-slate-700 text-lg mb-6 font-medium">
                              Ready to capture your attendance photo
                            </p>
                            <Button 
                              onClick={startCamera} 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              disabled={isAttendanceComplete}
                            >
                              <Camera className="h-6 w-6 mr-3" />
                              Start Camera
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-blue-500/20">
                              <video
                                ref={videoRef}
                                className="w-full h-96 object-cover"
                                autoPlay
                                muted
                                playsInline
                              />
                              <canvas ref={canvasRef} className="hidden" />
                              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                                <Badge className="bg-red-500 text-white px-3 py-1 animate-pulse">
                                  <div className="h-2 w-2 bg-white rounded-full mr-2" />
                                  Recording
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-4 justify-center">
                              <Button 
                                onClick={capturePhoto} 
                                disabled={isGettingLocation}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Camera className="h-6 w-6 mr-3" />
                                {isGettingLocation ? 'Capturing...' : 'Capture Photo'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={stopCamera}
                                className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-slate-100"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-4 ring-green-500/20">
                          <img 
                            src={capturedImage} 
                            alt="Captured attendance" 
                            className="w-full h-96 object-cover"
                          />
                          <Badge 
                            variant="secondary" 
                            className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-lg"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Photo Captured
                          </Badge>
                        </div>
                        
                        {location ? (
                          <div className="flex items-start gap-3 text-sm bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 shadow-sm">
                            <div className="mt-0.5 bg-green-500 rounded-full p-2">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-green-900 mb-1">Location Verified</p>
                              <span className="text-green-700">{location}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 text-sm bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200 shadow-sm">
                            <div className="mt-0.5 bg-orange-500 rounded-full p-2 animate-pulse">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-orange-900 mb-1">Fetching Location</p>
                              <span className="text-orange-700">Please wait while we verify your location...</span>
                            </div>
                          </div>
                        )}
                        
                         {isUploading && (
                           <div className="space-y-3 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                             <div className="flex items-center justify-between">
                               <span className="text-blue-900 font-semibold text-base">Uploading to Server...</span>
                               <span className="text-blue-700 font-bold text-lg">{uploadProgress}%</span>
                             </div>
                             <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden shadow-inner">
                               <div 
                                 className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out shadow-lg"
                                 style={{ width: `${uploadProgress}%` }}
                               />
                             </div>
                           </div>
                         )}
                         
                         <div className="flex gap-4 justify-center pt-2">
                           <Button 
                             onClick={handleSubmit} 
                             className={`px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                               attendanceType === 'check-in'
                                 ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                 : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                             } text-white`}
                             disabled={!location || isUploading}
                           >
                             <CheckCircle className="h-6 w-6 mr-3" />
                             Submit {attendanceType === 'check-in' ? 'Check In' : 'Check Out'}
                           </Button>
                           <Button 
                             variant="outline" 
                             onClick={retakePhoto} 
                             disabled={isUploading}
                             className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-slate-100"
                           >
                             Retake Photo
                           </Button>
                         </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <PastAttendance />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}