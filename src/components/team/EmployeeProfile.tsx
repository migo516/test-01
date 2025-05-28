
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, BarChart3 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface TaskStats {
  todo: number;
  'in-progress': number;
  completed: number;
  delayed: number;
  progress: number;
}

interface EmployeeProfileProps {
  member: TeamMember;
  stats: TaskStats;
}

const EmployeeProfile = ({ member, stats }: EmployeeProfileProps) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'manager': return '매니저';
      case 'user': return '사용자';
      default: return '사용자';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalTasks = stats.todo + stats['in-progress'] + stats.completed + stats.delayed;

  return (
    <Card className="w-full aspect-square">
      <CardHeader className="text-center pb-3">
        <div className="flex flex-col items-center space-y-2">
          <div>
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <Badge className={getRoleColor(member.role)} variant="outline">
              {getRoleLabel(member.role)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 px-4 pb-4">
        {member.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        
        {member.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{member.phone}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">업무 통계</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="bg-gray-50 p-1 rounded text-center">
              <div className="font-semibold text-gray-800">{stats.todo}</div>
              <div className="text-gray-600">대기</div>
            </div>
            <div className="bg-blue-50 p-1 rounded text-center">
              <div className="font-semibold text-blue-800">{stats['in-progress']}</div>
              <div className="text-blue-600">진행중</div>
            </div>
            <div className="bg-orange-50 p-1 rounded text-center">
              <div className="font-semibold text-orange-800">{stats.delayed}</div>
              <div className="text-orange-600">지연</div>
            </div>
            <div className="bg-green-50 p-1 rounded text-center">
              <div className="font-semibold text-green-800">{stats.completed}</div>
              <div className="text-green-600">완료</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>완료율</span>
              <span>{stats.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeProfile;
