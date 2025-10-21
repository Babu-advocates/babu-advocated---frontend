import { NavLink, useLocation } from "react-router-dom";
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
import { FileText, MessageSquareMore, BarChart3, LayoutDashboard } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/bank-manager-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Document Tracking",
    url: "/bank-manager/document-tracking",
    icon: FileText,
  },
  {
    title: "Queries Monitoring",
    url: "/bank-manager/queries-monitoring",
    icon: MessageSquareMore,
  },
  {
    title: "Reports & Analytics",
    url: "/bank-manager/reports-analytics",
    icon: BarChart3,
  },
];

export function BankManagerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-br from-sky-100 via-blue-200 to-cyan-300 border-r-0">
        {/* Menu */}
        <SidebarGroup className="flex-1 px-0 pt-6">
          <SidebarGroupLabel className="px-4 py-3 text-slate-700 text-sm font-medium uppercase tracking-wider">
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
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                            : 'text-slate-700 hover:bg-blue-200/50 hover:text-slate-800'
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
      </SidebarContent>
    </Sidebar>
  );
}