
import { useState } from 'react';
import { Task, useTaskContext } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { SubTaskList } from './SubTaskList';
import { TaskComments } from './TaskComments';
import { TaskSidebar } from './TaskSidebar';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal = ({ task, isOpen, onClose }: TaskDetailModalProps) => {
  const { updateTask, deleteTask, teamMembers } = useTaskContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  // task가 변경될 때마다 editedTask 업데이트
  useState(() => {
    setEditedTask(task);
  });

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
            
            <SubTaskList
              taskId={task.id}
              subTasks={task.subTasks}
              teamMembers={teamMembers}
            />
            
            <TaskComments
              taskId={task.id}
              comments={task.comments}
            />
          </div>
          
          <TaskSidebar
            task={task}
            editedTask={editedTask}
            isEditing={isEditing}
            teamMembers={teamMembers}
            onTaskChange={setEditedTask}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
