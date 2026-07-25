import { toDashboardViewModel } from "@/components/dashboard-view-model";
import { Dashboard } from "@/components/layout/dashboard";
import { loadDashboardData } from "@/services/data/load-generated-data";

export default function HomePage() {
  const data = toDashboardViewModel(loadDashboardData());
  return <Dashboard data={data} />;
}
