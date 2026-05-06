import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { CampaignMetrics } from "@/types/dashboard";

interface CampaignDistributionProps {
  data: CampaignMetrics[];
  isLoading: boolean;
}

const COLORS = [
  "hsl(210, 100%, 40%)",
  "hsl(210, 100%, 50%)",
  "hsl(210, 80%, 55%)",
  "hsl(190, 80%, 45%)",
  "hsl(145, 65%, 42%)",
  "hsl(32, 95%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(350, 70%, 55%)",
  "hsl(170, 60%, 45%)",
  "hsl(45, 90%, 50%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="mb-1 font-medium">{data.campanha}</p>
        <p className="text-sm text-muted-foreground">
          Leads: <span className="font-medium text-foreground">{data.totalLeads}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Agendamentos: <span className="font-medium text-foreground">{data.agendamentos}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function CampaignDistribution({ data, isLoading }: CampaignDistributionProps) {
  const top10 = data.slice(0, 10);

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Distribuição por Campanha
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : top10.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum dado para exibir
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" horizontal={false} />
                <XAxis type="number" stroke="hsl(215, 15%, 50%)" fontSize={12} />
                <YAxis
                  dataKey="campanha"
                  type="category"
                  width={120}
                  stroke="hsl(215, 15%, 50%)"
                  fontSize={11}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalLeads" radius={[0, 4, 4, 0]}>
                  {top10.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
