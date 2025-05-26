
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface Profile {
  id: string;
  name: string;
}

interface SubTask {
  title: string;
  assignee_id: string;
}

export const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignee_id: '',
    due_date: '',
    tags: '',
  });
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      toast.error('팀원 목록을 불러오지 못했습니다.');
    }
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, { title: '', assignee_id: '' }]);
  };

  const removeSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const updateSubTask = (index: number, field: keyof SubTask, value: string) => {
    const updated = [...subTasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubTasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.assignee_id || !formData.due_date) {
      toast.error('제목, 담당자, 마감일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 업무 생성
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          assignee_id: formData.assignee_id,
          due_date: formData.due_date,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // 세부 업무 생성
      if (subTasks.length > 0) {
        const validSubTasks = subTasks.filter(st => st.title.trim() && st.assignee_id);
        if (validSubTasks.length > 0) {
          const { error: subTaskError } = await supabase
            .from('sub_tasks')
            .insert(
              validSubTasks.map(st => ({
                task_id: task.id,
                title: st.title,
                assignee_id: st.assignee_id,
              }))
            );

          if (subTaskError) throw subTaskError;
        }
      }

      toast.success('업무가 성공적으로 생성되었습니다.');
      
      // 폼 리셋
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_id: '',
        due_date: '',
        tags: '',
      });
      setSubTasks([]);
      
      onTaskCreated();
      onClose();
    } catch (error: any) {
      console.error('업무 생성 실패:', error);
      toast.error(error.message || '업무 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 업무 추가</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">업무 제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="업무 제목을 입력하세요"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">업무 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="업무 설명을 입력하세요"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">상태</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
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
            </div>
            
            <div>
              <Label htmlFor="priority">우선순위</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee">담당자 *</Label>
              <Select value={formData.assignee_id} onValueChange={(value) => setFormData(prev => ({ ...prev, assignee_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="담당자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dueDate">마감일 *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>세부 업무</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubTask}>
                <Plus className="w-4 h-4 mr-1" />
                세부 업무 추가
              </Button>
            </div>
            {subTasks.map((subTask, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="세부 업무 제목"
                  value={subTask.title}
                  onChange={(e) => updateSubTask(index, 'title', e.target.value)}
                  className="flex-1"
                />
                <Select value={subTask.assignee_id} onValueChange={(value) => updateSubTask(index, 'assignee_id', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="담당자" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => removeSubTask(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div>
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="예: 개발, 디자인, 마케팅"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '생성 중...' : '업무 추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
