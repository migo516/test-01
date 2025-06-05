import { useState } from 'react';
import { Task, useTaskContext, SubTask } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Edit, Trash2, Save, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

interface SubTaskFormData {
  title: string;
  assignee: string;
}

export const TaskDetailModal = ({ task, isOpen, onClose }: TaskDetailModalProps) => {
  const { 
    addComment, 
    updateSubTask, 
    updateSubTaskMemo, 
    updateTask, 
    deleteTask, 
    teamMembers, 
    addSubTask,
    deleteSubTask,
    updateSubTaskAssignee
  } = useTaskContext();
  
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('김개발');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  
  // 즉시 UI 업데이트를 위한 로컬 상태들
  const [localSubTasks, setLocalSubTasks] = useState<SubTask[]>(task.subTasks);
  const [localSubTaskStates, setLocalSubTaskStates] = useState<{ [key: string]: boolean }>({});
  const [localSubTaskAssignees, setLocalSubTaskAssignees] = useState<{ [key: string]: string }>({});
  const [localSubTaskMemos, setLocalSubTaskMemos] = useState<{ [key: string]: string }>({});

  const subTaskForm = useForm<SubTaskFormData>({
    defaultValues: {
      title: '',
      assignee: teamMembers[0] || ''
    }
  });

  // task가 변경될 때마다 로컬 상태 업데이트
  useState(() => {
    setLocalSubTasks(task.subTasks);
    setLocalSubTaskStates({});
    setLocalSubTaskAssignees({});
    setLocalSubTaskMemos({});
  });

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await addComment(task.id, newComment, currentUser);
        setNewComment('');
        toast.success('댓글이 추가되었습니다.');
      } catch (error) {
        console.error('댓글 추가 실패:', error);
        toast.error('댓글 추가에 실패했습니다.');
      }
    }
  };

  const handleSubTaskStatusChange = async (subTaskId: string, completed: boolean) => {
    try {
      // 즉시 로컬 상태 업데이트
      setLocalSubTaskStates(prev => ({
        ...prev,
        [subTaskId]: completed
      }));

      await updateSubTask(task.id, subTaskId, completed);
      const statusText = completed ? '완료' : '미완료';
      toast.success(`세부 업무가 ${statusText}로 변경되었습니다.`);
    } catch (error) {
      // 실패 시 롤백
      setLocalSubTaskStates(prev => {
        const newState = { ...prev };
        delete newState[subTaskId];
        return newState;
      });
      console.error('세부 업무 상태 변경 실패:', error);
      toast.error('세부 업무 상태 변경에 실패했습니다.');
    }
  };

  const getSubTaskCompletedStatus = (subTaskId: string, originalCompleted: boolean) => {
    return localSubTaskStates.hasOwnProperty(subTaskId) 
      ? localSubTaskStates[subTaskId] 
      : originalCompleted;
  };

  const handleMemoSave = async (subTaskId: string, memo: string) => {
    try {
      // 즉시 로컬 상태 업데이트
      setLocalSubTaskMemos(prev => ({
        ...prev,
        [subTaskId]: memo
      }));

      await updateSubTaskMemo(task.id, subTaskId, memo);
      toast.success('메모가 저장되었습니다.');
    } catch (error) {
      // 실패 시 롤백
      setLocalSubTaskMemos(prev => {
        const newState = { ...prev };
        delete newState[subTaskId];
        return newState;
      });
      console.error('메모 저장 실패:', error);
      toast.error('메모 저장에 실패했습니다.');
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    try {
      // 즉시 로컬 상태에서 제거
      setLocalSubTasks(prev => prev.filter(st => st.id !== subTaskId));
      
      await deleteSubTask(task.id, subTaskId);
      toast.success('세부 업무가 삭제되었습니다.');
    } catch (error) {
      // 실패 시 롤백
      setLocalSubTasks(task.subTasks);
      console.error('세부 업무 삭제 실패:', error);
      toast.error('세부 업무 삭제에 실패했습니다.');
    }
  };

  const handleAssigneeChange = async (subTaskId: string, newAssignee: string) => {
    try {
      // 즉시 로컬 상태 업데이트
      setLocalSubTaskAssignees(prev => ({
        ...prev,
        [subTaskId]: newAssignee
      }));
      
      await updateSubTaskAssignee(task.id, subTaskId, newAssignee);
      toast.success('담당자가 변경되었습니다.');
    } catch (error) {
      // 실패 시 롤백
      setLocalSubTaskAssignees(prev => {
        const newState = { ...prev };
        delete newState[subTaskId];
        return newState;
      });
      console.error('담당자 변경 실패:', error);
      toast.error('담당자 변경에 실패했습니다.');
    }
  };

  const getSubTaskAssignee = (subTaskId: string, originalAssignee: string) => {
    return localSubTaskAssignees.hasOwnProperty(subTaskId) 
      ? localSubTaskAssignees[subTaskId] 
      : originalAssignee;
  };

  const getSubTaskMemo = (subTaskId: string, originalMemo: string) => {
    return localSubTaskMemos.hasOwnProperty(subTaskId) 
      ? localSubTaskMemos[subTaskId] 
      : originalMemo;
  };

  const handleCreateSubTask = async (data: SubTaskFormData) => {
    try {
      // 임시 ID로 즉시 로컬 상태 업데이트
      const tempId = `temp_${Date.now()}`;
      const newSubTask: SubTask = {
        id: tempId,
        title: data.title,
        assignee: data.assignee,
        completed: false,
        memo: ''
      };
      
      setLocalSubTasks(prev => [...prev, newSubTask]);
      
      await addSubTask(task.id, data.title, data.assignee);
      subTaskForm.reset();
      setIsAddingSubTask(false);
      toast.success('세부 업무가 추가되었습니다.');
    } catch (error) {
      // 실패 시 롤백
      setLocalSubTasks(prev => prev.filter(st => !st.id.startsWith('temp_')));
      console.error('세부 업무 추가 실패:', error);
      toast.error('세부 업무 추가에 실패했습니다.');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateTask(task.id, editedTask);
      setIsEditing(false);
      toast.success('업무가 수정되었습니다.');
    } catch (error) {
      console.error('업무 수정 실패:', error);
      toast.error('업무 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      onClose();
      toast.success('업무가 삭제되었습니다.');
    } catch (error) {
      console.error('업무 삭제 실패:', error);
      toast.error('업무 삭제에 실패했습니다.');
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
          <div className="flex justify-between items-start pr-8">
            {isEditing ? (
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-bold"
              />
            ) : (
              <DialogTitle className="text-xl font-bold pr-4">{task.title}</DialogTitle>
            )}
            <div className="flex space-x-2 ml-4">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>업무 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 이 업무를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">세부 업무</h3>
                <Button size="sm" onClick={() => setIsAddingSubTask(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  세부 업무 추가
                </Button>
              </div>

              {isAddingSubTask && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">새 세부 업무 추가</h4>
                  <Form {...subTaskForm}>
                    <form onSubmit={subTaskForm.handleSubmit(handleCreateSubTask)} className="space-y-3">
                      <FormField
                        control={subTaskForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>세부 업무 제목</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="세부 업무를 입력하세요..." 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={subTaskForm.control}
                        name="assignee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>담당자</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="담당자를 선택하세요" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers.map(member => (
                                  <SelectItem key={member} value={member}>{member}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm">추가</Button>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingSubTask(false);
                            subTaskForm.reset();
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {localSubTasks.length > 0 ? (
                <div className="space-y-4">
                  {localSubTasks.map(subTask => {
                    const isCompleted = getSubTaskCompletedStatus(subTask.id, subTask.completed);
                    const assignee = getSubTaskAssignee(subTask.id, subTask.assignee);
                    const memo = getSubTaskMemo(subTask.id, subTask.memo || '');
                    
                    return (
                      <div key={subTask.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 mr-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`flex-1 font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {subTask.title}
                              </span>
                              <div className="flex items-center space-x-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>세부 업무 삭제</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        정말로 이 세부 업무를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>취소</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteSubTask(subTask.id)}>
                                        삭제
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">담당자:</span>
                                <div className="flex items-center space-x-2">
                                  <Select 
                                    value={assignee}
                                    onValueChange={(value) => handleAssigneeChange(subTask.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {teamMembers.map(member => (
                                        <SelectItem key={member} value={member}>{member}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700">진행 상태:</span>
                                <RadioGroup
                                  value={isCompleted ? 'completed' : 'incomplete'}
                                  onValueChange={(value) => handleSubTaskStatusChange(subTask.id, value === 'completed')}
                                  className="flex space-x-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="incomplete" id={`incomplete-${subTask.id}`} />
                                    <label htmlFor={`incomplete-${subTask.id}`} className="text-sm text-gray-600">
                                      미완료
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="completed" id={`completed-${subTask.id}`} />
                                    <label htmlFor={`completed-${subTask.id}`} className="text-sm text-gray-600">
                                      완료
                                    </label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">협업 메모</h4>
                          </div>
                          <div className="space-y-2">
                            <Textarea
                              value={memo}
                              onChange={(e) => setLocalSubTaskMemos(prev => ({
                                ...prev,
                                [subTask.id]: e.target.value
                              }))}
                              placeholder="협업을 위한 메모를 입력하세요..."
                              rows={3}
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleMemoSave(subTask.id, memo)}
                            >
                              메모 저장
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">세부 업무가 없습니다. 새 세부 업무를 추가해보세요.</p>
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
