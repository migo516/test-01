
import { cn } from '@/lib/utils';
import { ViewType } from '@/pages/Dashboard';
import { 
  Calendar,
  ChartBar, 
  FolderKanban, 
  Table, 
  Users,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  { id: 'kanban' as ViewType, label: '업무 대시보드', icon: FolderKanban },
  { id: 'table' as ViewType, label: '모든 업무', icon: Table },
  { id: 'employee-tasks' as ViewType, label: '사원별 업무', icon: UserCheck },
  { id: 'calendar' as ViewType, label: '캘린더', icon: Calendar },
  { id: 'reports' as ViewType, label: '보고서', icon: ChartBar },
  { id: 'employee' as ViewType, label: '사원 관리', icon: Users },
];

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">업무 관리 시스템</h1>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    currentView === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
