import { RosenLineChart } from "./charts/RosenLineChart";
import { Card } from "./ui/Card";
import { type PageviewData } from "../services/analytics";

interface PageviewChartProps {
  data: PageviewData[];
  loading?: boolean;
}

export function PageviewChart({ data, loading }: PageviewChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.createdAt),
    value: item._count.id,
  }));

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">
            Page Views Over Time
          </h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-700 border-t-blue-500"></div>
            <span>Loading chart data...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 bg-transparent border-none shadow-none">
      <RosenLineChart
        data={chartData}
        title="Page Views Over Time"
        height={320}
        color="#3b82f6"
        className="w-full"
      />
    </Card>
  );
}
