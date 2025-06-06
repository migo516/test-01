
import { useState } from 'react';
import { Comment, useTaskContext } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface TaskCommentsProps {
  taskId: string;
  comments: Comment[];
}

export const TaskComments = ({ taskId, comments }: TaskCommentsProps) => {
  const { addComment } = useTaskContext();
  const { userProfile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  const handleAddComment = async () => {
    if (!userProfile) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (newComment.trim()) {
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        author: userProfile.name,
        content: newComment,
        timestamp: new Date()
      };

      // Optimistic update - 즉시 화면에 표시
      setLocalComments(prev => [...prev, tempComment]);
      setNewComment('');

      try {
        await addComment(taskId, newComment, userProfile.name);
        // 서버에서 성공하면 임시 댓글을 제거 (실제 댓글은 props로 들어옴)
        setLocalComments(prev => prev.filter(c => c.id !== tempComment.id));
        toast.success('댓글이 추가되었습니다.');
      } catch (error) {
        console.error('댓글 추가 실패:', error);
        // 실패하면 임시 댓글 제거하고 입력값 복원
        setLocalComments(prev => prev.filter(c => c.id !== tempComment.id));
        setNewComment(tempComment.content);
        toast.error('댓글 추가에 실패했습니다.');
      }
    }
  };

  if (!userProfile) {
    return (
      <div>
        <h3 className="font-semibold mb-3">댓글</h3>
        <p className="text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  // 실제 댓글과 임시 댓글을 합쳐서 표시
  const allComments = [...comments, ...localComments].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div>
      <h3 className="font-semibold mb-3">댓글</h3>
      <div className="space-y-3 mb-4">
        {allComments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">{comment.author}</span>
              <span className="text-xs text-gray-500">
                {format(comment.timestamp, 'MM월 dd일 HH:mm', { locale: ko })}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
            {comment.id.startsWith('temp-') && (
              <div className="text-xs text-gray-400 mt-1">전송 중...</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <Textarea
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          댓글 추가
        </Button>
      </div>
    </div>
  );
};
