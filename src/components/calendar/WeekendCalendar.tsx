
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WeekendCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>캘린더</CardTitle>
      </CardHeader>
      <CardContent>
        <style jsx>{`
          .weekend-calendar .rdp-day_button:not(.rdp-day_selected):not(.rdp-day_today) {
            color: inherit;
          }
          
          .weekend-calendar .rdp-day_button[data-day="0"]:not(.rdp-day_selected):not(.rdp-day_today) {
            color: #dc2626 !important;
          }
          
          .weekend-calendar .rdp-day_button[data-day="6"]:not(.rdp-day_selected):not(.rdp-day_today) {
            color: #2563eb !important;
          }
        `}</style>
        <div className="weekend-calendar">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              sunday: (date) => date.getDay() === 0,
              saturday: (date) => date.getDay() === 6,
            }}
            modifiersStyles={{
              sunday: { color: '#dc2626' },
              saturday: { color: '#2563eb' },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekendCalendar;
