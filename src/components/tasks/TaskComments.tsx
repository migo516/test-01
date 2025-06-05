
import { useState } from 'react';
import { Comment, useTaskContext } from '@/contexts/TaskContext';
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
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('김개발');

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await addComment(taskId, newComment, currentUser);
        setNewComment('');
        toast.success('댓글이 추가되었습니다.');
      } catch (error) {
        console.error('댓글 추가 실패:', error);
        toast.error('댓글 추가에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-3">댓글</h3>
      <div className="space-y-3 mb-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">{comment.author}</span>
              <span className="text-xs text-gray-500">
                {format(comment.timestamp, 'MM월 dd일 HH:mm', { locale: ko })}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
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
