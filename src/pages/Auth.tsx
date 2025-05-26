
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await signIn(signInData.email, signInData.password);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.name);
      toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
    } catch (error: any) {
      toast.error(error.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">팀 워크스페이스</CardTitle>
          <CardDescription className="text-center">
            업무 관리 시스템에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">이메일</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
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
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">이름</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="비밀번호를 입력하세요 (6자 이상)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '가입 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
