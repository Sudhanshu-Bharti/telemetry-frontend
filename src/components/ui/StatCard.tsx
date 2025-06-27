import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  const trendColor = trend === "up" ? "text-emerald-500" : "text-red-500";
  const TrendIcon = trend === "up" ? ArrowUp : ArrowDown;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-gray-400">{icon}</div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} />
            <span>{change} vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
} 