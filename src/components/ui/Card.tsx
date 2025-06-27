import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white border border-gray-100 rounded-lg shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("px-6 py-4 border-b border-gray-50", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-semibold text-gray-900", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-gray-500 mt-1", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("px-6 py-4 border-t border-gray-50", className)}
      {...props}
    />
  );
}

// Modern metric card component
function StatCard({
  title,
  value,
  icon,
  className,
  change,
  trend,
}: {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className={cn("bg-white", className)}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </div>
          {change && (
            <div
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-md",
                trend === "up"
                  ? "text-green-600 bg-green-50"
                  : trend === "down"
                  ? "text-red-600 bg-red-50"
                  : "text-gray-500 bg-gray-50"
              )}
            >
              {change}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 font-medium">{title}</div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </div>
    </div>
  );
}

// Clean error message component
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
      <svg
        className="w-4 h-4 text-red-500 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

// Modern loading spinner
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn("animate-spin text-gray-300", className)}
        viewBox="0 0 24 24"
        fill="none"
        width="20"
        height="20"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
}

// Metric display card
function MetricCard({
  title,
  value,
  change,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-100 rounded-lg p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 mt-1">{title}</div>
        </div>
        {change && (
          <div
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-md",
              trend === "up"
                ? "text-green-600 bg-green-50"
                : trend === "down"
                ? "text-red-600 bg-red-50"
                : "text-gray-500 bg-gray-50"
            )}
          >
            {change}
          </div>
        )}
      </div>
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  StatCard,
  ErrorMessage,
  LoadingSpinner,
  MetricCard,
};
