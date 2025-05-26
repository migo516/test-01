
import { useTaskContext } from '@/contexts/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

const columns = [
  { id: 'todo', title: '시작 전', color: 'bg-gray-100' },
  { id: 'in-progress', title: '진행 중', color: 'bg-blue-100' },
  { id: 'delayed', title: '지연됨', color: 'bg-red-100' },
  { id: 'completed', title: '완료됨', color: 'bg-green-100' },
] as const;

export const KanbanBoard = () => {
  const { tasks, searchTerm, selectedTask, setSelectedTask, isCreateModalOpen, closeCreateModal } = useTaskContext();

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-4 gap-6 h-full">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            color={column.color}
            onTaskClick={setSelectedTask}
          />
        ))}
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
