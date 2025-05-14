
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Cog, List } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      name: "Logs",
      path: "/logs",
      icon: <List className="w-5 h-5" />
    },
    {
      name: "Configurações",
      path: "/configuracoes",
      icon: <Cog className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 flex-col bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Admin Cotações</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100",
                isActive(item.path) && "bg-gray-100 text-primary font-medium"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-white w-full border-b fixed top-0 left-0 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Admin Cotações</h1>
        <div className="flex space-x-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "p-2 rounded-md",
                isActive(item.path) 
                  ? "bg-primary text-white" 
                  : "text-gray-700"
              )}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="md:p-8 p-4 md:pt-8 pt-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
