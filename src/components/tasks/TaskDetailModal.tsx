
import { useState } from 'react';
import { Task, useTaskContext } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Edit, Trash2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal = ({ task, isOpen, onClose }: TaskDetailModalProps) => {
  const { addComment, updateSubTask, updateTask, deleteTask, teamMembers } = useTaskContext();
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('김개발'); // 실제로는 로그인된 사용자 정보
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment, currentUser);
      setNewComment('');
    }
  };

  const handleSubTaskChange = (subTaskId: string, completed: boolean) => {
    updateSubTask(task.id, subTaskId, completed);
  };

  const handleSaveEdit = () => {
    updateTask(task.id, editedTask);
    setIsEditing(false);
    toast.success('업무가 수정되었습니다.');
  };

  const handleCancelEdit = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('정말로 이 업무를 삭제하시겠습니까?')) {
      deleteTask(task.id);
      onClose();
      toast.success('업무가 삭제되었습니다.');
    }
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            {isEditing ? (
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-bold"
              />
            ) : (
              <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
            )}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-1" />
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">업무 설명</h3>
              {isEditing ? (
                <Textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="text-gray-700">{task.description}</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">세부 업무</h3>
              {task.subTasks.length > 0 ? (
                <div className="space-y-2">
                  {task.subTasks.map(subTask => (
                    <div key={subTask.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={subTask.completed}
                        onCheckedChange={(checked) => handleSubTaskChange(subTask.id, !!checked)}
                      />
                      <span className={`flex-1 ${subTask.completed ? 'line-through text-gray-500' : ''}`}>
                        {subTask.title}
                      </span>
                      <span className="text-sm text-gray-600">{subTask.assignee}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">세부 업무가 없습니다.</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">댓글</h3>
              <div className="space-y-3 mb-4">
                {task.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {format(comment.timestamp, 'MM월 dd일 HH:mm', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  댓글 추가
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">상태</h3>
              {isEditing ? (
                <Select value={editedTask.status} onValueChange={(value) => setEditedTask({ ...editedTask, status: value as any })}>
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
                <Select value={editedTask.priority} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as any })}>
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
                <Select value={editedTask.assignee} onValueChange={(value) => setEditedTask({ ...editedTask, assignee: value })}>
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
                      onSelect={(date) => setEditedTask({ ...editedTask, dueDate: date || new Date() })}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
