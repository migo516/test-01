
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCheck, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

const EmployeeTasks = () => {
  const { tasks } = useTaskContext();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('팀원 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksForMember = (memberName: string) => {
    return tasks.filter(task => task.assignee === memberName);
  };

  const getTaskStatusStats = (memberTasks: any[]) => {
    const stats = {
      todo: memberTasks.filter(t => t.status === 'todo').length,
      'in-progress': memberTasks.filter(t => t.status === 'in-progress').length,
      completed: memberTasks.filter(t => t.status === 'completed').length,
      delayed: memberTasks.filter(t => t.status === 'delayed').length,
    };
    return stats;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return '대기';
      case 'in-progress': return '진행중';
      case 'completed': return '완료';
      case 'delayed': return '지연';
      default: return status;
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <UserCheck className="w-6 h-6" />
        <h2 className="text-2xl font-bold">사원별 업무 현황</h2>
      </div>

      <div className="grid gap-6">
        {teamMembers.map((member) => {
          const memberTasks = getTasksForMember(member.name);
          const stats = getTaskStatusStats(memberTasks);
          
          return (
            <Card key={member.id} className="w-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        총 {memberTasks.length}개 업무
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="bg-gray-50">
                      대기 {stats.todo}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      진행 {stats['in-progress']}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      완료 {stats.completed}
                    </Badge>
                    {stats.delayed > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        지연 {stats.delayed}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {memberTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    배정된 업무가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                마감: {format(task.dueDate, 'MM월 dd일', { locale: ko })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>진행률: {task.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {memberTasks.length > 5 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        +{memberTasks.length - 5}개 업무 더 있음
                      </div>
                    )}
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

export default EmployeeTasks;
