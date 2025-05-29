
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import WeekendCalendar from "@/components/calendar/WeekendCalendar";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-2">프로젝트 현황을 한눈에 확인하세요</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <DashboardStats />
        </div>
        <div className="lg:col-span-1">
          <WeekendCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
