
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskTable } from '@/components/tasks/TaskTable';
import { Calendar } from '@/components/calendar/Calendar';
import { Reports } from '@/components/reports/Reports';
import { TeamMembers } from '@/components/team/TeamMembers';

export type ViewType = 'kanban' | 'table' | 'calendar' | 'reports' | 'team';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('kanban');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'table':
        return <TaskTable />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <Reports />;
      case 'team':
        return <TeamMembers />;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col">
        <Header currentView={currentView} />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
