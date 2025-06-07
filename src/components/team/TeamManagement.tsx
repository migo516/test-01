import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2, KeyRound, RefreshCw, AlertTriangle } from 'lucide-react';
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

interface DeleteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
}

const TeamManagement = () => {
  const { isAdmin, userProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [profileForPasswordReset, setProfileForPasswordReset] = useState<Profile | null>(null);
  const [registerData, setRegisterData] = useState({
    name: '',
    userId: '',
    password: '',
    phone: '',
    role: 'user',
  });
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    role: 'user',
  });
  const [newPassword, setNewPassword] = useState('');

  // fetchProfiles 함수를 useEffect 이전에 정의
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

  useEffect(() => {
    fetchProfiles();
  }, []);

  // 관리자가 아닌 경우 접근 제한
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="w-16 h-16 text-amber-500" />
        <h2 className="text-2xl font-bold text-gray-800">접근 권한이 없습니다</h2>
        <p className="text-gray-600 text-center">
          사원 관리 기능은 관리자만 사용할 수 있습니다.
          <br />
          현재 로그인된 계정: {userProfile?.name} ({userProfile?.role})
        </p>
      </div>
    );
  }

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.userId || !registerData.password) {
      toast.error('이름, 사용자 ID, 비밀번호를 입력해주세요.');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    // 사용자 ID에 공백이나 특수문자가 있는지 확인
    if (!/^[a-zA-Z0-9가-힣]+$/.test(registerData.userId)) {
      toast.error('사용자 ID는 영문, 숫자, 한글만 사용할 수 있습니다.');
      return;
    }

    setLoading(true);
    try {
      // 사용자 ID를 이메일 형식으로 변환
      const email = `${registerData.userId}@company.com`;
      
      // 회원가입 API 사용
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            phone: registerData.phone,
          }
        }
      });

      if (signUpError) throw signUpError;

      // 프로필 정보 직접 업데이트 (역할 설정)
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: registerData.role,
            phone: registerData.phone 
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('프로필 업데이트 실패:', updateError);
        }
      }

      toast.success('사원이 성공적으로 등록되었습니다.');
      
      setRegisterData({
        name: '',
        userId: '',
        password: '',
        phone: '',
        role: 'user',
      });
      setIsRegisterModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      console.error('사원 등록 실패:', error);
      if (error.message?.includes('User already registered')) {
        toast.error('이미 등록된 사용자 ID입니다.');
      } else {
        toast.error(error.message || '사원 등록에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfile || !editData.name) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      console.log('수정 시작:', selectedProfile.id, editData);
      
      // 프로필 정보 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name: editData.name,
          role: editData.role,
          phone: editData.phone 
        })
        .eq('id', selectedProfile.id);

      if (profileError) {
        console.error('프로필 업데이트 오류:', profileError);
        throw profileError;
      }

      console.log('수정 성공');
      toast.success('사원 정보가 성공적으로 수정되었습니다.');
      
      setIsEditModalOpen(false);
      setSelectedProfile(null);
      
      // 목록 새로고침
      await fetchProfiles();
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
      phone: profile.phone || '',
      role: profile.role,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (profile: Profile) => {
    setProfileToDelete(profile);
    setIsDeleteModalOpen(true);
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

  const handleDeleteUser = async () => {
    if (!profileToDelete) return;

    setLoading(true);
    try {
      console.log('사용자 완전 삭제 시작:', profileToDelete.id, profileToDelete.name);
      
      // 새로운 RPC 함수를 사용하여 사용자를 완전히 삭제
      const { data, error } = await supabase.rpc('delete_user_completely', {
        user_id_to_delete: profileToDelete.id
      });

      if (error) {
        console.error('RPC 함수 호출 오류:', error);
        throw error;
      }

      // RPC 함수의 응답 확인 (올바른 타입 단언 사용)
      const response = data as unknown as DeleteUserResponse;
      if (!response.success) {
        throw new Error(response.error || '사용자 삭제에 실패했습니다.');
      }

      console.log('사용자 완전 삭제 성공');
      toast.success(`${profileToDelete.name}님이 완전히 삭제되었습니다. 로그인도 불가능합니다.`);
      
      setIsDeleteModalOpen(false);
      setProfileToDelete(null);
      
      // 목록 새로고침
      await fetchProfiles();
    } catch (error: any) {
      console.error('사용자 삭제 실패:', error);
      toast.error(`사용자 삭제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async () => {
    if (!profileForPasswordReset || !newPassword) {
      toast.error('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      console.log('비밀번호 변경 시작:', profileForPasswordReset.id);
      
      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: profileForPasswordReset.id,
          newPassword: newPassword
        }
      });

      if (error) {
        console.error('Edge Function 호출 오류:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('비밀번호 변경 성공');
      toast.success(`${profileForPasswordReset.name}님의 비밀번호가 성공적으로 변경되었습니다.`);
      
      setIsPasswordResetModalOpen(false);
      setNewPassword('');
      setProfileForPasswordReset(null);
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      toast.error(error.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openPasswordResetModal = (profile: Profile) => {
    setProfileForPasswordReset(profile);
    setNewPassword('');
    setIsPasswordResetModalOpen(true);
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
                    className="h-8 w-8 p-0 hover:bg-orange-100"
                    onClick={() => openPasswordResetModal(profile)}
                    disabled={loading}
                    title="비밀번호 재설정"
                  >
                    <KeyRound className="w-4 h-4 text-orange-600" />
                  </Button>
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
                    onClick={() => openDeleteModal(profile)}
                    disabled={loading}
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
              <Label htmlFor="userId">사용자 ID *</Label>
              <Input
                id="userId"
                value={registerData.userId}
                onChange={(e) => setRegisterData(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="로그인에 사용할 사용자 ID를 입력하세요 (영문, 숫자, 한글만)"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                로그인 시 이 ID를 사용합니다 (예: 홍길동, user123)
              </p>
            </div>

            <div>
              <Label htmlFor="phone">휴대전화번호</Label>
              <Input
                id="phone"
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="010-1234-5678"
              />
            </div>
            
            <div>
              <Label htmlFor="password">초기 비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="6자 이상의 비밀번호를 입력하세요"
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

      {/* 비밀번호 재설정 모달 */}
      <Dialog open={isPasswordResetModalOpen} onOpenChange={setIsPasswordResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 재설정</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>{profileForPasswordReset?.name}</strong>님의 비밀번호를 재설정합니다.
            </p>
            
            <div>
              <Label htmlFor="newPassword">새 비밀번호 *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6자 이상의 새 비밀번호를 입력하세요"
                required
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>안내:</strong> 새 비밀번호를 설정한 후 해당 사용자에게 직접 전달해주세요.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPasswordResetModalOpen(false)}
                disabled={loading}
              >
                취소
              </Button>
              <Button 
                onClick={updateUserPassword}
                disabled={loading}
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사원 완전 삭제 확인</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              정말로 <strong>{profileToDelete?.name}</strong>님을 완전히 삭제하시겠습니까?
            </p>
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-800">
                <strong>경고:</strong> 이 작업은 되돌릴 수 없습니다.
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>해당 사원의 계정이 완전히 삭제됩니다</li>
                <li>로그인이 불가능해집니다</li>
                <li>배정된 모든 업무의 배정이 해제됩니다</li>
                <li>작성한 댓글이 삭제됩니다</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading}
              >
                취소
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? '삭제 중...' : '완전 삭제'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
