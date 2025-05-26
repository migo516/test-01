
import { Task } from '@/contexts/TaskContext';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
}

export const KanbanColumn = ({ title, tasks, color, onTaskClick }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className={`${color} p-4 rounded-t-lg border-b-2 border-gray-200`}>
        <h3 className="font-semibold text-gray-800 text-center">
          {title} ({tasks.length})
        </h3>
      </div>
      
      <div className="flex-1 bg-white rounded-b-lg border-2 border-t-0 border-gray-200 p-4 space-y-3 overflow-y-auto min-h-96">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            업무가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};
