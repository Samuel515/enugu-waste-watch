
import Layout from "@/components/layout/Layout";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";

const Schedule = () => {
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pickup Schedule</h1>
          <p className="text-muted-foreground">
            View upcoming waste collection schedules in your area
          </p>
        </div>
        
        <ScheduleCalendar />
      </div>
    </Layout>
  );
};

export default Schedule;
