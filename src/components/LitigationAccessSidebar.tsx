import { FileText, LogOut, LayoutDashboard, Scale } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const LitigationAccessSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const username = localStorage.getItem('litigationAccessUsername') || 'User';
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('litigationAccessLogin');
    localStorage.removeItem('litigationAccessId');
    localStorage.removeItem('litigationAccessUsername');
    navigate('/bank-login');
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/litigation-access-dashboard",
    },
    {
      title: "View Applications",
      icon: FileText,
      path: "/litigation-access-applications",
    },
  ];

  return (
    <Sidebar className="border-r border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700">
      <SidebarContent className="bg-gradient-to-b from-blue-600 to-blue-700">
        {/* Header Section */}
        <div className="p-8 border-b border-blue-500/30 bg-blue-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{username}</h2>
            <p className="text-sm text-white/80 uppercase tracking-wider">Litigation Dashboard</p>
          </div>
        </div>
        
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-white/90 uppercase tracking-wider text-xs font-semibold mb-3 px-2">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full text-white/90 hover:bg-white/10 data-[active=true]:bg-white data-[active=true]:text-blue-700 py-6 text-base font-medium rounded-lg mb-2"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-500/30 p-4 bg-blue-700">
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogTrigger asChild>
            <SidebarMenuButton className={`w-full bg-red-600 text-white font-bold py-7 text-base rounded-lg ${collapsed ? 'justify-center px-0' : ''}`}>
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You will need to login again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
};

export default LitigationAccessSidebar;
