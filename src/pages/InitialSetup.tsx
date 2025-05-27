
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const InitialSetup = () => {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123!');
  const [name, setName] = useState('관리자');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, name);
      toast.success('관리자 계정이 생성되었습니다. 로그인해주세요.');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || '계정 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>초기 관리자 설정</CardTitle>
          <CardDescription>
            시스템을 처음 사용하시는군요! 관리자 계정을 설정해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                관리자 이름
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 (기본값 사용 권장)
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 (기본값 사용 권장)
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>기본 관리자 계정:</strong><br/>
                이메일: admin@company.com<br/>
                비밀번호: admin123!<br/>
                로그인 후 프로필에서 변경 가능합니다.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '생성 중...' : '관리자 계정 생성'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialSetup;
