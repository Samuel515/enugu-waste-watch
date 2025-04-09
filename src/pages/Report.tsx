
import Layout from "@/components/layout/Layout";
import ReportForm from "@/components/reporting/ReportForm";

const Report = () => {
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Report Waste Issue</h1>
          <p className="text-muted-foreground">
            Submit details about waste-related problems in your area
          </p>
        </div>
        
        <ReportForm />
      </div>
    </Layout>
  );
};

export default Report;
