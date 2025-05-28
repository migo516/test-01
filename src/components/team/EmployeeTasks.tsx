
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck } from 'lucide-react';
import EmployeeProfile from './EmployeeProfile';

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
      progress: 0
    };
    
    const totalTasks = stats.todo + stats['in-progress'] + stats.completed + stats.delayed;
    stats.progress = totalTasks > 0 ? Math.round((stats.completed / totalTasks) * 100) : 0;
    
    return stats;
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
        <h2 className="text-2xl font-bold">팀</h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="이름 또는 직책 검색..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.map((member) => {
          const memberTasks = getTasksForMember(member.name);
          const stats = getTaskStatusStats(memberTasks);
          
          return (
            <EmployeeProfile
              key={member.id}
              member={{
                ...member,
                email: `${member.name.toLowerCase()}@example.com`,
                phone: `010-1234-500${teamMembers.indexOf(member) + 1}`
              }}
              stats={stats}
            />
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">등록된 사원이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
