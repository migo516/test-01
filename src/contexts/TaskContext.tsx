
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
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
  teamMembers: string[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: '1',
    title: '웹사이트 리뉴얼 프로젝트',
    description: '회사 홈페이지를 새롭게 디자인하고 개발하는 프로젝트입니다.',
    status: 'in-progress',
    priority: 'high',
    assignee: '김개발',
    dueDate: new Date('2024-06-15'),
    createdAt: new Date('2024-05-01'),
    progress: 45,
    subTasks: [
      { id: 'sub1', title: '요구사항 분석', completed: true, assignee: '김개발' },
      { id: 'sub2', title: 'UI/UX 디자인', completed: true, assignee: '박디자인' },
      { id: 'sub3', title: '프론트엔드 개발', completed: false, assignee: '김개발' },
      { id: 'sub4', title: '백엔드 API 개발', completed: false, assignee: '이백엔드' },
    ],
    comments: [
      {
        id: 'c1',
        author: '김개발',
        content: '디자인 시안 확인 완료했습니다. 개발 진행하겠습니다.',
        timestamp: new Date('2024-05-20'),
      },
    ],
    tags: ['웹개발', '리뉴얼'],
  },
  {
    id: '2',
    title: '마케팅 캠페인 기획',
    description: '신제품 출시를 위한 마케팅 전략 수립 및 실행',
    status: 'todo',
    priority: 'medium',
    assignee: '최마케팅',
    dueDate: new Date('2024-06-10'),
    createdAt: new Date('2024-05-10'),
    progress: 0,
    subTasks: [
      { id: 'sub5', title: '시장 조사', completed: false, assignee: '최마케팅' },
      { id: 'sub6', title: '타겟 고객 분석', completed: false, assignee: '최마케팅' },
    ],
    comments: [],
    tags: ['마케팅', '기획'],
  },
  {
    id: '3',
    title: '서버 인프라 구축',
    description: '새로운 서비스를 위한 클라우드 인프라 설계 및 구축',
    status: 'delayed',
    priority: 'high',
    assignee: '정인프라',
    dueDate: new Date('2024-05-30'),
    createdAt: new Date('2024-05-05'),
    progress: 20,
    subTasks: [
      { id: 'sub7', title: '클라우드 서비스 선택', completed: true, assignee: '정인프라' },
      { id: 'sub8', title: '네트워크 설계', completed: false, assignee: '정인프라' },
    ],
    comments: [
      {
        id: 'c2',
        author: '정인프라',
        content: '예상보다 복잡한 요구사항으로 일정이 지연되고 있습니다.',
        timestamp: new Date('2024-05-25'),
      },
    ],
    tags: ['인프라', '클라우드'],
  },
  {
    id: '4',
    title: '고객 지원 시스템 개선',
    description: '고객 만족도 향상을 위한 지원 시스템 업그레이드',
    status: 'completed',
    priority: 'medium',
    assignee: '김개발',
    dueDate: new Date('2024-05-20'),
    createdAt: new Date('2024-04-15'),
    progress: 100,
    subTasks: [
      { id: 'sub9', title: '현재 시스템 분석', completed: true, assignee: '김개발' },
      { id: 'sub10', title: '개선 사항 도출', completed: true, assignee: '김개발' },
      { id: 'sub11', title: '시스템 업데이트', completed: true, assignee: '김개발' },
    ],
    comments: [],
    tags: ['고객지원', '시스템'],
  },
];

const teamMembers = ['김개발', '박디자인', '이백엔드', '최마케팅', '정인프라'];

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      comments: [],
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const addComment = (taskId: string, content: string, author: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      content,
      timestamp: new Date(),
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...task.comments, newComment] }
        : task
    ));
  };

  const updateSubTask = (taskId: string, subTaskId: string, completed: boolean) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSubTasks = task.subTasks.map(subTask =>
          subTask.id === subTaskId ? { ...subTask, completed } : subTask
        );
        const completedCount = updatedSubTasks.filter(st => st.completed).length;
        const progress = updatedSubTasks.length > 0 
          ? Math.round((completedCount / updatedSubTasks.length) * 100)
          : 0;
        
        return { ...task, subTasks: updatedSubTasks, progress };
      }
      return task;
    }));
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
      teamMembers,
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
