
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Auth = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    userId: '',
    password: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.userId || !signInData.password) {
      toast.error('사용자 ID와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 사용자 ID를 이메일 형식으로 변환
      const email = `${signInData.userId}@company.com`;
      
      await signIn(email, signInData.password);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      // 더 구체적인 오류 메시지 제공
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('사용자 ID 또는 비밀번호가 올바르지 않습니다.');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('계정 인증이 필요합니다. 관리자에게 문의하세요.');
      } else if (error.message?.includes('Too many requests')) {
        toast.error('너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
      } else {
        toast.error('로그인에 실패했습니다. 사용자 ID와 비밀번호를 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">업무 관리 시스템</CardTitle>
          <CardDescription className="text-center">
            사용자 ID와 비밀번호로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="signin-userId">사용자 ID</Label>
              <Input
                id="signin-userId"
                type="text"
                value={signInData.userId}
                onChange={(e) => setSignInData(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="사용자 ID를 입력하세요"
                required
              />
            </div>
            <div>
              <Label htmlFor="signin-password">비밀번호</Label>
              <Input
                id="signin-password"
                type="password"
                value={signInData.password}
                onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
