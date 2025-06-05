
import { Task } from '@/contexts/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskSidebarProps {
  task: Task;
  editedTask: Task;
  isEditing: boolean;
  teamMembers: string[];
  onTaskChange: (updatedTask: Task) => void;
}

export const TaskSidebar = ({ 
  task, 
  editedTask, 
  isEditing, 
  teamMembers, 
  onTaskChange 
}: TaskSidebarProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return '시작 전';
      case 'in-progress': return '진행 중';
      case 'delayed': return '지연됨';
      case 'completed': return '완료됨';
      default: return '시작 전';
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">상태</h3>
        {isEditing ? (
          <Select value={editedTask.status} onValueChange={(value) => onTaskChange({ ...editedTask, status: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">시작 전</SelectItem>
              <SelectItem value="in-progress">진행 중</SelectItem>
              <SelectItem value="delayed">지연됨</SelectItem>
              <SelectItem value="completed">완료됨</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getStatusColor(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">우선순위</h3>
        {isEditing ? (
          <Select value={editedTask.priority} onValueChange={(value) => onTaskChange({ ...editedTask, priority: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="low">낮음</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </Badge>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">담당자</h3>
        {isEditing ? (
          <Select value={editedTask.assignee} onValueChange={(value) => onTaskChange({ ...editedTask, assignee: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map(member => (
                <SelectItem key={member} value={member}>{member}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p>{task.assignee}</p>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">마감일</h3>
        {isEditing ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !editedTask.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editedTask.dueDate ? format(editedTask.dueDate, 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 선택'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={editedTask.dueDate}
                onSelect={(date) => onTaskChange({ ...editedTask, dueDate: date || new Date() })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <p>{format(task.dueDate, 'yyyy년 MM월 dd일', { locale: ko })}</p>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">진행률</h3>
        <div className="space-y-2">
          <Progress value={task.progress} />
          <p className="text-sm text-gray-600">{task.progress}% 완료</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">태그</h3>
        <div className="flex flex-wrap gap-1">
          {task.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">생성일</h3>
        <p className="text-sm text-gray-600">
          {format(task.createdAt, 'yyyy년 MM월 dd일', { locale: ko })}
        </p>
      </div>
    </div>
  );
};
