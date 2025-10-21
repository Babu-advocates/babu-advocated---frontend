import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const EmployeeTemplate = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <EmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-slate-800">Template</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                <CardHeader className="text-center pb-8 pt-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold mb-3">Application Template</CardTitle>
                  <CardDescription className="text-base">
                    Access the online template for creating legal applications
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-12 px-8">
                  <div className="flex justify-center">
                    <Button 
                      asChild
                      size="lg"
                      className="h-16 px-12 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                    >
                      <a 
                        href="https://rdmcoder.tech" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        <span>Open Template</span>
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-slate-600 text-center">
                      <span className="font-semibold text-slate-800">Note:</span> This will open the template in a new tab
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeTemplate;
