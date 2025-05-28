
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

const TeamMembersWithDelete = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTasks } = useTaskContext();

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
      toast.error('팀원 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`정말로 ${memberName}님을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      toast.success(`${memberName}님이 삭제되었습니다.`);
      await loadTeamMembers();
      refreshTasks();
    } catch (error) {
      console.error('사원 삭제 실패:', error);
      toast.error('사원 삭제에 실패했습니다.');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'user': return '사용자';
      default: return '사용자';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">사원 관리</h2>
        </div>
        <div className="text-sm text-gray-600">
          총 {teamMembers.length}명의 사원
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-100"
                  onClick={() => handleDeleteMember(member.id, member.name)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Badge className={getRoleColor(member.role)}>
                  {getRoleLabel(member.role)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                가입일: {new Date(member.created_at).toLocaleDateString('ko-KR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">등록된 사원이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default TeamMembersWithDelete;
