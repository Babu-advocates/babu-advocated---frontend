import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "@/lib/toast";

interface AttendanceRecord {
  id: string;
  date: Date;
  checkIn?: {
    time: Date;
    photo: string;
    location?: string;
  };
  checkOut?: {
    time: Date;
    photo: string;
    location?: string;
  };
  status: 'complete' | 'incomplete' | 'absent';
  totalHours?: number;
}

interface DbAttendanceRecord {
  id: string;
  employee_username: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
  photo: string;
  location: string;
  date: string;
}

export function PastAttendance() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'complete' | 'incomplete' | 'absent'>('all');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendanceData = async () => {
    const username = localStorage.getItem('employeeUsername');
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_username', username)
        .order('date', { ascending: false })
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group records by date
      const groupedByDate = (data as DbAttendanceRecord[]).reduce((acc, record) => {
        const date = record.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(record);
        return acc;
      }, {} as Record<string, DbAttendanceRecord[]>);

      // Transform to AttendanceRecord format
      const transformed: AttendanceRecord[] = Object.entries(groupedByDate).map(([dateStr, records]) => {
        const checkInRecord = records.find(r => r.type === 'check-in');
        const checkOutRecord = records.find(r => r.type === 'check-out');
        
        const date = new Date(dateStr);
        
        let status: 'complete' | 'incomplete' | 'absent' = 'absent';
        let totalHours: number | undefined;

        if (checkInRecord && checkOutRecord) {
          status = 'complete';
          const checkInTime = new Date(checkInRecord.timestamp);
          const checkOutTime = new Date(checkOutRecord.timestamp);
          totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        } else if (checkInRecord) {
          status = 'incomplete';
        }

        return {
          id: dateStr,
          date,
          checkIn: checkInRecord ? {
            time: new Date(checkInRecord.timestamp),
            photo: checkInRecord.photo,
            location: checkInRecord.location,
          } : undefined,
          checkOut: checkOutRecord ? {
            time: new Date(checkOutRecord.timestamp),
            photo: checkOutRecord.photo,
            location: checkOutRecord.location,
          } : undefined,
          status,
          totalHours: totalHours ? parseFloat(totalHours.toFixed(2)) : undefined,
        };
      });

      setAttendanceData(transformed);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showToast.error("Failed to load attendance history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();

    // Set up real-time subscription
    const username = localStorage.getItem('employeeUsername');
    if (!username) return;

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `employee_username=eq.${username}`,
        },
        () => {
          fetchAttendanceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredData = attendanceData.filter(record => 
    selectedFilter === 'all' || record.status === selectedFilter
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'complete':
        return 'default' as const;
      case 'incomplete':
        return 'secondary' as const;
      case 'absent':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-card bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-xl">Attendance History</CardTitle>
              <CardDescription>View your past attendance records and statistics</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'complete', 'incomplete', 'absent'] as const).map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className={selectedFilter === filter ? 'bg-corporate-blue hover:bg-corporate-blue/90 text-white' : ''}
          >
            <Filter className="h-3 w-3 mr-1" />
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="border-0 shadow-card bg-white">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading attendance history...</p>
            </CardContent>
          </Card>
        ) : filteredData.length === 0 ? (
          <Card className="border-0 shadow-card bg-white">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No attendance records found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-border"></div>
            
            {filteredData.map((record, index) => (
              <div key={record.id} className="relative flex items-start gap-6 pb-8">
                {/* Timeline dot */}
                <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                  record.status === 'complete' ? 'bg-green-500 border-green-500' :
                  record.status === 'incomplete' ? 'bg-yellow-500 border-yellow-500' :
                  'bg-red-500 border-red-500'
                }`}></div>
                
                {/* Timeline content */}
                <Card className="flex-1 border-0 shadow-card bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{formatDate(record.date)}</CardTitle>
                        <CardDescription>
                          {record.totalHours ? `${record.totalHours} hours worked` : 'Attendance record'}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(record.status)}>
                        {record.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {record.status !== 'complete' && <XCircle className="h-3 w-3 mr-1" />}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {record.status === 'absent' ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p>No attendance recorded for this date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Check In */}
                        {record.checkIn && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Check In
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <Avatar className="w-10 h-10 border-2 border-green-200">
                                <AvatarImage src={record.checkIn.photo} alt="Check-in photo" />
                                <AvatarFallback className="text-xs">IN</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(record.checkIn.time)}
                                </div>
                                
                                {record.checkIn.location && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="font-mono truncate">{record.checkIn.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Check Out */}
                        {record.checkOut ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Check Out
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <Avatar className="w-10 h-10 border-2 border-blue-200">
                                <AvatarImage src={record.checkOut.photo} alt="Check-out photo" />
                                <AvatarFallback className="text-xs">OUT</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(record.checkOut.time)}
                                </div>
                                
                                {record.checkOut.location && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="font-mono truncate">{record.checkOut.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : record.status === 'incomplete' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Check Out
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-200 flex items-center justify-center">
                                <XCircle className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-700">Missing check-out</p>
                                <p className="text-xs text-yellow-600">Please contact HR if needed</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}