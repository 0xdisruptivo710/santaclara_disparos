import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  isLoading?: boolean;
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-gradient-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  primary: "bg-primary-foreground/20 text-primary-foreground",
  success: "bg-success-foreground/20 text-success-foreground",
  warning: "bg-warning-foreground/20 text-warning-foreground",
};

const textStyles = {
  default: {
    title: "text-muted-foreground",
    value: "text-foreground",
    subtitle: "text-muted-foreground",
  },
  primary: {
    title: "text-primary-foreground/80",
    value: "text-primary-foreground",
    subtitle: "text-primary-foreground/70",
  },
  success: {
    title: "text-success-foreground/80",
    value: "text-success-foreground",
    subtitle: "text-success-foreground/70",
  },
  warning: {
    title: "text-warning-foreground/80",
    value: "text-warning-foreground",
    subtitle: "text-warning-foreground/70",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  isLoading = false,
}: MetricCardProps) {
  return (
    <Card className={`${variantStyles[variant]} shadow-card card-hover animate-fade-in`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${textStyles[variant].title}`}>
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className={`text-3xl font-bold tracking-tight ${textStyles[variant].value}`}>
                {value}
              </p>
            )}
            {subtitle && (
              <p className={`text-xs ${textStyles[variant].subtitle}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`rounded-lg p-2.5 ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
