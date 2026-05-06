import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Legend, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailyMetrics } from "@/types/dashboard";

interface TemporalChartProps {
  data: DailyMetrics[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="mb-2 font-medium">
          {format(parseISO(label), "dd 'de' MMMM", { locale: ptBR })}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TemporalChart({ data, isLoading }: TemporalChartProps) {
  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolução Temporal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum dado para exibir
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 100%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210, 100%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(parseISO(value), "dd/MM")}
                  stroke="hsl(215, 15%, 50%)"
                  fontSize={12}
                />
                <YAxis yAxisId="left" stroke="hsl(215, 15%, 50%)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(145, 65%, 42%)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="leads"
                  name="Leads/dia"
                  stroke="hsl(210, 100%, 40%)"
                  strokeWidth={2}
                  fill="url(#colorLeads)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="acumulado"
                  name="Agendamentos Acumulados"
                  stroke="hsl(145, 65%, 42%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(145, 65%, 42%)", strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
