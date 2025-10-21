import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  useSidebar 
} from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  FileText, 
  History, 
  Send, 
  Inbox, 
  LogOut,
  LayoutDashboard,
  RefreshCw,
  UserCheck,
  Bell
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { useState, useEffect } from "react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/employee-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Notifications",
    url: "/employee/notifications", 
    icon: Bell,
  },
  {
    title: "Loan Applications",
    url: "/employee/applications",
    icon: FileText,
  },
  {
    title: "Past Applications",
    url: "/employee/past-applications",
    icon: History,
  },
  {
    title: "Create Application",
    url: "/employee/create-application",
    icon: FileText,
  },
  {
    title: "Template",
    url: "/employee/template",
    icon: FileText,
  },
];

export function EmployeeSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Initialize with localStorage value immediately to prevent blinking
  const [employeeName] = useState(() => {
    return localStorage.getItem('employeeUsername') || localStorage.getItem('employeeName') || 'Employee';
  });

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('employeeAttendanceRecords');
    localStorage.removeItem('employeeLogin');
    localStorage.removeItem('employeeUsername');
    localStorage.removeItem('employeeId');
    showToast.success("Successfully logged out!");
    // Navigate to login page
    navigate('/advocate-login', { replace: true });
    // Ensure address bar updates even in embedded previews
    setTimeout(() => {
      try { window.history.replaceState(null, '', '/advocate-login'); } catch {}
    }, 0);
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300 font-kontora`}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-employee-rich border-r-0 flex flex-col h-full">
        {/* Employee Info Section */}
        {!collapsed && (
          <SidebarGroup className="px-0 pt-4 pb-2">
            <SidebarGroupContent className="px-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 text-center">
                <span className="text-white text-lg font-semibold block">{employeeName}</span>
                <span className="text-red-100 text-xs uppercase tracking-wider">Employee Dashboard</span>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menu */}
        <SidebarGroup className="flex-1 px-0 pt-2">
          <SidebarGroupLabel className="px-4 py-3 text-red-100 text-sm font-medium uppercase tracking-wider">
            {!collapsed && "Main Menu"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`
                          flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                          ${active 
                            ? 'bg-white text-gray-900 shadow-lg backdrop-blur-sm font-semibold hover:text-gray-900' 
                            : 'text-red-100/80 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Section */}
        <SidebarGroup className="px-0 pb-6">
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        className={`
                          flex items-center ${collapsed ? 'justify-center' : ''} w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 group
                        `}
                      >
                        <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                        {!collapsed && (
                          <span className="font-medium">Logout</span>
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be redirected to the login page and will need to sign in again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                          Yes, Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}