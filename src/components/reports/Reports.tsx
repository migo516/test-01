
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Reports = () => {
  const { tasks, teamMembers } = useTaskContext();

  // 상태별 업무 통계
  const statusData = [
    { name: '시작 전', value: tasks.filter(t => t.status === 'todo').length, color: '#6B7280' },
    { name: '진행 중', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3B82F6' },
    { name: '지연됨', value: tasks.filter(t => t.status === 'delayed').length, color: '#EF4444' },
    { name: '완료됨', value: tasks.filter(t => t.status === 'completed').length, color: '#10B981' },
  ];

  // 우선순위별 업무 통계
  const priorityData = [
    { name: '높음', value: tasks.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: '보통', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: '낮음', value: tasks.filter(t => t.priority === 'low').length, color: '#10B981' },
  ];

  // 팀원별 업무 통계
  const memberData = teamMembers.map(member => ({
    name: member,
    total: tasks.filter(t => t.assignee === member).length,
    completed: tasks.filter(t => t.assignee === member && t.status === 'completed').length,
    inProgress: tasks.filter(t => t.assignee === member && t.status === 'in-progress').length,
    delayed: tasks.filter(t => t.assignee === member && t.status === 'delayed').length,
  }));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 전체 현황 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">전체 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">완료된 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">진행 중 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">지연된 업무</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{delayedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>업무 상태별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>우선순위별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 팀원별 업무 현황 */}
      <Card>
        <CardHeader>
          <CardTitle>팀원별 업무 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" stackId="a" fill="#10B981" name="완료됨" />
              <Bar dataKey="inProgress" stackId="a" fill="#3B82F6" name="진행 중" />
              <Bar dataKey="delayed" stackId="a" fill="#EF4444" name="지연됨" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 전체 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 프로젝트 진행률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{overallProgress}%</div>
            <div className="text-gray-600">
              {completedTasks}개 완료 / {totalTasks}개 전체
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
