import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Profile {
  id: string;
  name: string;
  role: string;
  phone?: string;
  created_at: string;
}

const TeamManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      toast.error('사원 목록을 불러오지 못했습니다.');
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error('이름, 이메일, 비밀번호를 입력해주세요.');
      return;
    }

    if (registerData.password.length < 4) {
      toast.error('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
        email: registerData.email,
        password: registerData.password,
        email_confirm: true,
        user_metadata: {
          name: registerData.name,
          phone: registerData.phone,
        }
      });

      if (signUpError) throw signUpError;

      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: registerData.role,
            phone: registerData.phone 
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      toast.success('사원이 성공적으로 등록되었습니다.');
      
      setRegisterData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
      });
      setIsRegisterModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      console.error('사원 등록 실패:', error);
      toast.error(error.message || '사원 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfile || !editData.name || !editData.email) {
      toast.error('이름과 이메일을 입력해주세요.');
      return;
    }

    if (editData.password && editData.password.length < 4) {
      toast.error('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      // 프로필 정보 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name: editData.name,
          role: editData.role,
          phone: editData.phone 
        })
        .eq('id', selectedProfile.id);

      if (profileError) throw profileError;

      // 비밀번호가 입력된 경우에만 비밀번호 업데이트
      if (editData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          selectedProfile.id,
          { password: editData.password }
        );
        if (passwordError) throw passwordError;
      }

      // 이메일이 변경된 경우 이메일 업데이트
      if (editData.email !== selectedProfile.id) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(
          selectedProfile.id,
          { email: editData.email }
        );
        if (emailError) throw emailError;
      }

      toast.success('사원 정보가 성공적으로 수정되었습니다.');
      
      setIsEditModalOpen(false);
      setSelectedProfile(null);
      fetchProfiles();
    } catch (error: any) {
      console.error('사원 수정 실패:', error);
      toast.error(error.message || '사원 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditData({
      name: profile.name,
      email: '',
      password: '',
      phone: profile.phone || '',
      role: profile.role,
    });
    setIsEditModalOpen(true);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success('역할이 성공적으로 변경되었습니다.');
      fetchProfiles();
    } catch (error: any) {
      console.error('역할 변경 실패:', error);
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`정말로 ${userName}님을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // Supabase Auth에서 사용자 삭제
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // 프로필 테이블에서도 삭제 (외래키 관계로 인해 자동으로 삭제될 수도 있음)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError && !profileError.message.includes('No rows')) {
        throw profileError;
      }
      
      toast.success(`${userName}님이 삭제되었습니다.`);
      fetchProfiles();
    } catch (error: any) {
      console.error('사원 삭제 실패:', error);
      toast.error('사원 삭제에 실패했습니다.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'manager': return '매니저';
      case 'user': return '일반 사용자';
      default: return '사용자';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">사원 관리</h2>
          <p className="text-gray-600 mt-1">사원을 등록하고 역할을 관리하세요</p>
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          사원 등록
        </Button>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold">{profile.name}</h3>
                    {profile.phone && (
                      <p className="text-sm text-gray-500">{profile.phone}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      등록일: {format(new Date(profile.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={profile.role}
                    onValueChange={(value) => updateUserRole(profile.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">일반 사용자</SelectItem>
                      <SelectItem value="manager">매니저</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={() => openEditModal(profile)}
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={() => handleDeleteUser(profile.id, profile.name)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 사원 등록 모달 */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사원 등록</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleRegisterUser} className="space-y-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={registerData.name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="사원 이름을 입력하세요"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">휴대전화번호 *</Label>
              <Input
                id="phone"
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="010-1234-5678"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">초기 비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="4자 이상의 비밀번호를 입력하세요"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">역할</Label>
              <Select value={registerData.role} onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">일반 사용자</SelectItem>
                  <SelectItem value="manager">매니저</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '등록 중...' : '사원 등록'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 사원 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사원 정보 수정</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="editName">이름 *</Label>
              <Input
                id="editName"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="사원 이름을 입력하세요"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editEmail">이메일 *</Label>
              <Input
                id="editEmail"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <Label htmlFor="editPhone">휴대전화번호</Label>
              <Input
                id="editPhone"
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="010-1234-5678"
              />
            </div>
            
            <div>
              <Label htmlFor="editPassword">새 비밀번호 (변경시에만 입력)</Label>
              <Input
                id="editPassword"
                type="password"
                value={editData.password}
                onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="4자 이상의 비밀번호를 입력하세요"
              />
            </div>
            
            <div>
              <Label htmlFor="editRole">역할</Label>
              <Select value={editData.role} onValueChange={(value) => setEditData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">일반 사용자</SelectItem>
                  <SelectItem value="manager">매니저</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '수정 중...' : '사원 수정'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
