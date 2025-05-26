
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViewType } from '@/pages/Dashboard';
import { useTaskContext } from '@/contexts/TaskContext';

interface HeaderProps {
  currentView: ViewType;
}

const viewTitles = {
  kanban: '팀 업무 대시보드',
  table: '모든 업무',
  calendar: '캘린더',
  reports: '보고서',
  team: '팀원 관리',
};

export const Header = ({ currentView }: HeaderProps) => {
  const { openCreateModal, searchTerm, setSearchTerm } = useTaskContext();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {viewTitles[currentView]}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            업무 현황을 실시간으로 확인하고 관리하세요
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {(currentView === 'kanban' || currentView === 'table') && (
            <Input
              placeholder="업무 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          )}
          
          {(currentView === 'kanban' || currentView === 'table') && (
            <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
              새 업무 추가
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
