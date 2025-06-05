
import { useState } from 'react';
import { SubTask, useTaskContext } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { SubTaskItem } from './SubTaskItem';
import { SubTaskForm } from './SubTaskForm';

interface SubTaskFormData {
  title: string;
  assignee: string;
}

interface SubTaskListProps {
  taskId: string;
  subTasks: SubTask[];
  teamMembers: string[];
}

export const SubTaskList = ({ taskId, subTasks, teamMembers }: SubTaskListProps) => {
  const { 
    updateSubTask, 
    updateSubTaskMemo, 
    addSubTask,
    deleteSubTask,
    updateSubTaskAssignee
  } = useTaskContext();
  
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [localSubTasks, setLocalSubTasks] = useState<SubTask[]>(subTasks);
  const [localSubTaskStates, setLocalSubTaskStates] = useState<{ [key: string]: boolean }>({});
  const [localSubTaskAssignees, setLocalSubTaskAssignees] = useState<{ [key: string]: string }>({});
  const [localSubTaskMemos, setLocalSubTaskMemos] = useState<{ [key: string]: string }>({});

  const handleSubTaskStatusChange = async (subTaskId: string, completed: boolean) => {
    try {
      setLocalSubTaskStates(prev => ({
        ...prev,
        [subTaskId]: completed
      }));

      await updateSubTask(taskId, subTaskId, completed);
      const statusText = completed ? '완료' : '미완료';
      toast.success(`세부 업무가 ${statusText}로 변경되었습니다.`);
    } catch (error) {
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
      setLocalSubTaskMemos(prev => ({
        ...prev,
        [subTaskId]: memo
      }));

      await updateSubTaskMemo(taskId, subTaskId, memo);
      toast.success('메모가 저장되었습니다.');
    } catch (error) {
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
      setLocalSubTasks(prev => prev.filter(st => st.id !== subTaskId));
      
      await deleteSubTask(taskId, subTaskId);
      toast.success('세부 업무가 삭제되었습니다.');
    } catch (error) {
      setLocalSubTasks(subTasks);
      console.error('세부 업무 삭제 실패:', error);
      toast.error('세부 업무 삭제에 실패했습니다.');
    }
  };

  const handleAssigneeChange = async (subTaskId: string, newAssignee: string) => {
    try {
      setLocalSubTaskAssignees(prev => ({
        ...prev,
        [subTaskId]: newAssignee
      }));
      
      await updateSubTaskAssignee(taskId, subTaskId, newAssignee);
      toast.success('담당자가 변경되었습니다.');
    } catch (error) {
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
      const tempId = `temp_${Date.now()}`;
      const newSubTask: SubTask = {
        id: tempId,
        title: data.title,
        assignee: data.assignee,
        completed: false,
        memo: ''
      };
      
      setLocalSubTasks(prev => [...prev, newSubTask]);
      
      await addSubTask(taskId, data.title, data.assignee);
      setIsAddingSubTask(false);
      toast.success('세부 업무가 추가되었습니다.');
    } catch (error) {
      setLocalSubTasks(prev => prev.filter(st => !st.id.startsWith('temp_')));
      console.error('세부 업무 추가 실패:', error);
      toast.error('세부 업무 추가에 실패했습니다.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">세부 업무</h3>
        <Button size="sm" onClick={() => setIsAddingSubTask(true)}>
          <Plus className="w-4 h-4 mr-1" />
          세부 업무 추가
        </Button>
      </div>

      {isAddingSubTask && (
        <SubTaskForm
          teamMembers={teamMembers}
          onSubmit={handleCreateSubTask}
          onCancel={() => setIsAddingSubTask(false)}
        />
      )}

      {localSubTasks.length > 0 ? (
        <div className="space-y-4">
          {localSubTasks.map(subTask => {
            const isCompleted = getSubTaskCompletedStatus(subTask.id, subTask.completed);
            const assignee = getSubTaskAssignee(subTask.id, subTask.assignee);
            const memo = getSubTaskMemo(subTask.id, subTask.memo || '');
            
            return (
              <SubTaskItem
                key={subTask.id}
                subTask={subTask}
                teamMembers={teamMembers}
                isCompleted={isCompleted}
                assignee={assignee}
                memo={memo}
                onStatusChange={(completed) => handleSubTaskStatusChange(subTask.id, completed)}
                onAssigneeChange={(newAssignee) => handleAssigneeChange(subTask.id, newAssignee)}
                onMemoChange={(newMemo) => setLocalSubTaskMemos(prev => ({
                  ...prev,
                  [subTask.id]: newMemo
                }))}
                onMemoSave={() => handleMemoSave(subTask.id, memo)}
                onDelete={() => handleDeleteSubTask(subTask.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">세부 업무가 없습니다. 새 세부 업무를 추가해보세요.</p>
      )}
    </div>
  );
};
