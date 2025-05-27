
import { Task } from '@/contexts/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit, Trash2 } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from 'sonner';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const { deleteTask } = useTaskContext();

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말로 이 업무를 삭제하시겠습니까?')) {
      deleteTask(task.id);
      toast.success('업무가 삭제되었습니다.');
    }
  };

  const isOverdue = new Date() > task.dueDate && task.status !== 'completed';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 
          className="font-medium text-gray-900 text-sm line-clamp-2 cursor-pointer flex-1"
          onClick={onClick}
        >
          {task.title}
        </h4>
        <div className="flex items-center space-x-1 ml-2">
          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-100"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      </div>
      
      <p 
        className="text-gray-600 text-xs mb-3 line-clamp-2 cursor-pointer"
        onClick={onClick}
      >
        {task.description}
      </p>
      
      <div className="mb-3" onClick={onClick}>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>진행률</span>
          <span>{task.progress}%</span>
        </div>
        <Progress value={task.progress} className="h-2" />
      </div>
      
      <div 
        className="flex justify-between items-center text-xs text-gray-500 cursor-pointer"
        onClick={onClick}
      >
        <span className="font-medium">{task.assignee}</span>
        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
          {format(task.dueDate, 'MM/dd', { locale: ko })}
        </span>
      </div>
      
      {task.subTasks.length > 0 && (
        <div className="mt-2 text-xs text-gray-500" onClick={onClick}>
          세부 업무: {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}
        </div>
      )}
    </div>
  );
};
