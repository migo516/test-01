
import { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';

export const TaskTable = () => {
  const { tasks, searchTerm, isCreateModalOpen, closeCreateModal } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'delayed': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800',
    };
    
    const labels = {
      'todo': '시작 전',
      'in-progress': '진행 중',
      'delayed': '지연됨',
      'completed': '완료됨',
    };
    
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800',
    };
    
    const labels = {
      'high': '높음',
      'medium': '보통',
      'low': '낮음',
    };
    
    return <Badge className={colors[priority]}>{labels[priority]}</Badge>;
  };

  const uniqueAssignees = [...new Set(tasks.map(task => task.assignee))];

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="todo">시작 전</SelectItem>
            <SelectItem value="in-progress">진행 중</SelectItem>
            <SelectItem value="delayed">지연됨</SelectItem>
            <SelectItem value="completed">완료됨</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="우선순위 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 우선순위</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="medium">보통</SelectItem>
            <SelectItem value="low">낮음</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="담당자 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 담당자</SelectItem>
            {uniqueAssignees.map(assignee => (
              <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>업무 제목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>진행률</TableHead>
              <TableHead>마감일</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => {
              const isOverdue = new Date() > task.dueDate && task.status !== 'completed';
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>
                    <div className="w-20">
                      <Progress value={task.progress} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {format(task.dueDate, 'yyyy-MM-dd', { locale: ko })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            조건에 맞는 업무가 없습니다.
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
      />
    </div>
  );
};
