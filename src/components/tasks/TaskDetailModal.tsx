
import { useState } from 'react';
import { Task, useTaskContext } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal = ({ task, isOpen, onClose }: TaskDetailModalProps) => {
  const { addComment, updateSubTask, teamMembers } = useTaskContext();
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('김개발'); // 실제로는 로그인된 사용자 정보

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment, currentUser);
      setNewComment('');
    }
  };

  const handleSubTaskChange = (subTaskId: string, completed: boolean) => {
    updateSubTask(task.id, subTaskId, completed);
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
          <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">업무 설명</h3>
              <p className="text-gray-700">{task.description}</p>
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
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">우선순위</h3>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">담당자</h3>
              <p>{task.assignee}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">마감일</h3>
              <p>{format(task.dueDate, 'yyyy년 MM월 dd일', { locale: ko })}</p>
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
