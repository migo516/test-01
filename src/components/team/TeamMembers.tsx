
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User } from 'lucide-react';

export const TeamMembers = () => {
  const { tasks, teamMembers } = useTaskContext();

  const getMemberStats = (member: string) => {
    const memberTasks = tasks.filter(task => task.assignee === member);
    const completed = memberTasks.filter(task => task.status === 'completed').length;
    const inProgress = memberTasks.filter(task => task.status === 'in-progress').length;
    const delayed = memberTasks.filter(task => task.status === 'delayed').length;
    const todo = memberTasks.filter(task => task.status === 'todo').length;
    const total = memberTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      delayed,
      todo,
      completionRate,
      tasks: memberTasks,
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => {
          const stats = getMemberStats(member);
          
          return (
            <Card key={member} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member}</CardTitle>
                    <p className="text-sm text-gray-500">팀원</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">완료율</span>
                    <span className="text-sm font-bold">{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-600">전체 업무</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-gray-600">완료</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">진행 중</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats.inProgress}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">지연됨</span>
                    <Badge className="bg-red-100 text-red-800">{stats.delayed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">시작 전</span>
                    <Badge className="bg-gray-100 text-gray-800">{stats.todo}</Badge>
                  </div>
                </div>
                
                {stats.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">최근 업무</h4>
                    <div className="space-y-1">
                      {stats.tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="text-xs p-2 bg-gray-50 rounded">
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-gray-500">진행률: {task.progress}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
