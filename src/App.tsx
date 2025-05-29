
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { useState } from "react";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Views
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./components/kanban/KanbanBoard";
import TaskTable from "./components/tasks/TaskTable";
import Calendar from "./components/calendar/Calendar";
import Reports from "./components/reports/Reports";
import TeamManagement from "./components/team/TeamManagement";
import EmployeeTasks from "./components/team/EmployeeTasks";

export type ViewType = 'dashboard' | 'kanban' | 'table' | 'calendar' | 'reports' | 'employee' | 'employee-tasks';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const MainApp = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'table':
        return <TaskTable />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <Reports />;
      case 'employee':
        return <TeamManagement />;
      case 'employee-tasks':
        return <EmployeeTasks />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentView={currentView} />
        <main className="flex-1 overflow-auto p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TaskProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainApp />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/auth" 
                element={
                  <PublicRoute>
                    <Auth />
                  </PublicRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TaskProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
