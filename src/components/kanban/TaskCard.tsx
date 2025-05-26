
import { Task } from '@/contexts/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const isOverdue = new Date() > task.dueDate && task.status !== 'completed';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </Badge>
      </div>
      
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>진행률</span>
          <span>{task.progress}%</span>
        </div>
        <Progress value={task.progress} className="h-2" />
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className="font-medium">{task.assignee}</span>
        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
          {format(task.dueDate, 'MM/dd', { locale: ko })}
        </span>
      </div>
      
      {task.subTasks.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          세부 업무: {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}
        </div>
      )}
    </div>
  );
};
