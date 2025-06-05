
import { useState } from 'react';
import { SubTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface SubTaskItemProps {
  subTask: SubTask;
  teamMembers: string[];
  isCompleted: boolean;
  assignee: string;
  memo: string;
  onStatusChange: (completed: boolean) => void;
  onAssigneeChange: (assignee: string) => void;
  onMemoChange: (memo: string) => void;
  onMemoSave: () => void;
  onDelete: () => void;
}

export const SubTaskItem = ({
  subTask,
  teamMembers,
  isCompleted,
  assignee,
  memo,
  onStatusChange,
  onAssigneeChange,
  onMemoChange,
  onMemoSave,
  onDelete
}: SubTaskItemProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
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
                    <AlertDialogAction onClick={onDelete}>
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
                  onValueChange={onAssigneeChange}
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
                onValueChange={(value) => onStatusChange(value === 'completed')}
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
            onChange={(e) => onMemoChange(e.target.value)}
            placeholder="협업을 위한 메모를 입력하세요..."
            rows={3}
          />
          <Button 
            size="sm" 
            onClick={onMemoSave}
          >
            메모 저장
          </Button>
        </div>
      </div>
    </div>
  );
};
