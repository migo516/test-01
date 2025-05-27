import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

const teamMembers = [
  {
    name: '김철수',
    position: '프론트엔드 개발자',
    email: 'chulsoo@example.com',
  },
  {
    name: '이영희',
    position: '백엔드 개발자',
    email: 'younghee@example.com',
  },
];

const Team = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">팀원 소개</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member, index) => (
          <Card key={index} className="p-4">
            <CardContent className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 bg-gray-300 text-white font-bold flex items-center justify-center">
                {member.name.charAt(0)}
              </Avatar>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500">{member.position}</p>
                <p className="text-sm text-gray-400">{member.email}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Team;
