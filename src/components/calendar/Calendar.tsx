
import { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';

export const Calendar = () => {
  const { tasks } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const today = new Date();

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => isSameDay(task.dueDate, date));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-200';
      case 'in-progress': return 'bg-blue-200';
      case 'delayed': return 'bg-red-200';
      case 'completed': return 'bg-green-200';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'yyyy년 MM월', { locale: ko })}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            오늘은 {format(today, 'MM월 dd일', { locale: ko })} 입니다.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={`bg-white p-2 min-h-24 border-r border-b ${
                !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
              } ${isTodayDate ? 'bg-blue-100 border-2 border-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isTodayDate ? 'text-blue-700 font-bold bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center' : ''
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(task.status)}`}
                    title={task.title}
                  >
                    <div className="truncate font-medium">{task.title}</div>
                    <div className="truncate text-gray-600">{task.assignee}</div>
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 p-1">
                    +{dayTasks.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
