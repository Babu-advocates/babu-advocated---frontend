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
  Scale,
  LayoutDashboard,
  FileText,
  Calendar,
  Search,
  BarChart3,
  Users,
  LogOut,
  RefreshCw,
  IndianRupee,
  History,
  UserPlus,
  Building,
  Plus,
  UserCheck
} from "lucide-react";
import { showToast } from "@/lib/toast";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Legal Opinion",
    url: "/admin/applications",
    icon: FileText,
  },
  {
    title: "Litigation applications",
    url: "/admin/loan-recovery",
    icon: RefreshCw,
  },
  {
    title: "Past Applications",
    url: "/admin/past-applications",
    icon: History,
  },
  {
    title: "Payment Details",
    url: "/admin/payment-details",
    icon: IndianRupee,
  },
  {
    title: "Loan Type/Product creation",
    url: "/admin/create-loan-type",
    icon: Plus,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    showToast.success("Successfully logged out!");
    navigate('/advocate-login');
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 border-r-0 flex flex-col h-full">
        {/* Menu */}
        <SidebarGroup className="flex-1 px-0 pt-6">
          <SidebarGroupLabel className="px-4 py-3 text-slate-400 text-sm font-medium uppercase tracking-wider">
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
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
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
              
              {/* Employee Login Creation */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/create-employee-account" 
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                      ${isActive("/admin/create-employee-account")
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }
                    `}
                  >
                    <UserPlus className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!collapsed && (
                      <span className="font-medium">Employee login for advocates</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Adv-Employee Details */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/employee-details" 
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                      ${isActive("/admin/employee-details")
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }
                    `}
                  >
                    <UserCheck className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!collapsed && (
                      <span className="font-medium">Adv-Employee Details</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Bank Login Accounts List */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/bank-accounts" 
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                      ${isActive("/admin/bank-accounts")
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }
                    `}
                  >
                    <Building className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!collapsed && (
                      <span className="font-medium">Bank's logins</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Litigation Login Accounts List */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/litigation-accounts" 
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                      ${isActive("/admin/litigation-accounts")
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }
                    `}
                  >
                    <Building className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!collapsed && (
                      <span className="font-medium">Litigation logins</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
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