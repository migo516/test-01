
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';

const DashboardStats = () => {
  const { tasks, teamMembers } = useTaskContext();

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      delayed: tasks.filter(t => t.status === 'delayed').length,
      todo: tasks.filter(t => t.status === 'todo').length,
    };

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return { ...stats, completionRate };
  };

  const getUrgentTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= 3 && task.status !== 'completed';
    });
  };

  const getTopPerformers = () => {
    const memberStats = teamMembers.map(member => {
      const memberTasks = tasks.filter(task => task.assignee === member);
      const completed = memberTasks.filter(task => task.status === 'completed').length;
      const total = memberTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { name: member, completed, total, rate };
    }).filter(member => member.total > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    return memberStats;
  };

  const stats = getTaskStats();
  const urgentTasks = getUrgentTasks();
  const topPerformers = getTopPerformers();

  return (
    <div className="space-y-6">
      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 업무</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">완료된 업무</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">진행 중</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">지연된 업무</p>
                <p className="text-2xl font-bold text-red-600">{stats.delayed}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 완료율 및 팀 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">프로젝트 진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">전체 완료율</span>
                <span className="text-lg font-semibold">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">시작 전:</span>
                  <span className="font-medium">{stats.todo}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">진행 중:</span>
                  <span className="font-medium">{stats.inProgress}개</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              팀 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">총 팀원 수</span>
                <span className="text-lg font-semibold">{teamMembers.length}명</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">활성 업무</span>
                <span className="font-medium">{stats.inProgress + stats.todo}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">긴급 업무</span>
                <Badge variant="destructive">{urgentTasks.length}개</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 긴급 업무 및 우수 사원 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              긴급 업무 (3일 이내 마감)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTasks.length === 0 ? (
                <p className="text-sm text-gray-500">긴급 업무가 없습니다.</p>
              ) : (
                urgentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-600">{task.assignee}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {new Date(task.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">우수 사원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.length === 0 ? (
                <p className="text-sm text-gray-500">업무 데이터가 없습니다.</p>
              ) : (
                topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{performer.name}</p>
                        <p className="text-xs text-gray-600">{performer.completed}/{performer.total} 완료</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {performer.rate}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
