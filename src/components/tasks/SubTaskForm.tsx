
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SubTaskFormData {
  title: string;
  assignee: string;
}

interface SubTaskFormProps {
  teamMembers: string[];
  onSubmit: (data: SubTaskFormData) => void;
  onCancel: () => void;
}

export const SubTaskForm = ({ teamMembers, onSubmit, onCancel }: SubTaskFormProps) => {
  const form = useForm<SubTaskFormData>({
    defaultValues: {
      title: '',
      assignee: teamMembers[0] || ''
    }
  });

  const handleSubmit = (data: SubTaskFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium mb-3">새 세부 업무 추가</h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>세부 업무 제목</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="세부 업무를 입력하세요..." 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>담당자</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="담당자를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex space-x-2">
            <Button type="submit" size="sm">추가</Button>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
            >
              취소
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
