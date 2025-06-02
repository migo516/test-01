import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
  memo?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'delayed' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  progress: number;
  subTasks: SubTask[];
  comments: Comment[];
  tags: string[];
}

interface TaskContextType {
  tasks: Task[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, content: string, author: string) => void;
  updateSubTask: (taskId: string, subTaskId: string, completed: boolean) => void;
  updateSubTaskMemo: (taskId: string, subTaskId: string, memo: string) => void;
  refreshTasks: () => void;
  teamMembers: string[];
  deleteTeamMember: (memberId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    loadTasks();
    loadTeamMembers();
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee_profile:profiles!tasks_assignee_id_fkey(name),
          sub_tasks(*,
            assignee_profile:profiles!sub_tasks_assignee_id_fkey(name)
          ),
          comments(*,
            author_profile:profiles!comments_author_id_fkey(name)
          )
        `);

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status as 'todo' | 'in-progress' | 'delayed' | 'completed',
        priority: task.priority as 'low' | 'medium' | 'high',
        assignee: task.assignee_profile?.name || '미배정',
        dueDate: task.due_date ? new Date(task.due_date) : new Date(),
        createdAt: new Date(task.created_at),
        progress: task.progress || 0,
        subTasks: (task.sub_tasks || []).map((st: any) => ({
          id: st.id,
          title: st.title,
          completed: st.completed,
          assignee: st.assignee_profile?.name || '미배정',
          memo: st.memo || ''
        })),
        comments: (task.comments || []).map((c: any) => ({
          id: c.id,
          author: c.author_profile?.name || '알 수 없음',
          content: c.content,
          timestamp: new Date(c.created_at)
        })),
        tags: task.tags || []
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('업무 로드 실패:', error);
      setTasks([]);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeamMembers((data || []).map(profile => profile.name));
    } catch (error) {
      console.error('팀원 로드 실패:', error);
      setTeamMembers([]);
    }
  };

  const deleteTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadTeamMembers();
    } catch (error) {
      console.error('사원 삭제 실패:', error);
      throw error;
    }
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const refreshTasks = () => {
    loadTasks();
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.dueDate.toISOString(),
          progress: taskData.progress,
          tags: taskData.tags
        })
        .select()
        .single();

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('업무 추가 실패:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString();
      if (updates.progress !== undefined) updateData.progress = updates.progress;
      if (updates.tags) updateData.tags = updates.tags;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('업무 수정 실패:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('업무 삭제 실패:', error);
    }
  };

  const addComment = async (taskId: string, content: string, author: string) => {
    try {
      // 현재 사용자의 프로필 ID를 가져옵니다
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', author)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('comments')
        .insert({
          task_id: taskId,
          content,
          author_id: profile.id
        });

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('댓글 추가 실패:', error);
    }
  };

  const updateSubTask = async (taskId: string, subTaskId: string, completed: boolean) => {
    try {
      console.log('updateSubTask 호출됨:', { taskId, subTaskId, completed });
      
      const { error } = await supabase
        .from('sub_tasks')
        .update({ completed })
        .eq('id', subTaskId);

      if (error) {
        console.error('Supabase 에러:', error);
        throw error;
      }
      
      console.log('Supabase 업데이트 성공');
      await loadTasks();
    } catch (error) {
      console.error('세부 업무 수정 실패:', error);
      throw error;
    }
  };

  const updateSubTaskMemo = async (taskId: string, subTaskId: string, memo: string) => {
    try {
      const { error } = await supabase
        .from('sub_tasks')
        .update({ memo })
        .eq('id', subTaskId);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('세부 업무 메모 수정 실패:', error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      searchTerm,
      setSearchTerm,
      selectedTask,
      setSelectedTask,
      isCreateModalOpen,
      openCreateModal,
      closeCreateModal,
      addTask,
      updateTask,
      deleteTask,
      addComment,
      updateSubTask,
      updateSubTaskMemo,
      refreshTasks,
      teamMembers,
      deleteTeamMember,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
