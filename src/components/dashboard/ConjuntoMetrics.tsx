import { Layers, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ConjuntoMetrics as ConjuntoMetricsType } from "@/types/dashboard";

interface ConjuntoMetricsProps {
  data: ConjuntoMetricsType[];
  isLoading: boolean;
}

export function ConjuntoMetrics({ data, isLoading }: ConjuntoMetricsProps) {
  const maxLeads = Math.max(...data.map((d) => d.totalLeads), 1);

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Métricas por Conjunto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum dado encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((conjunto) => (
              <div
                key={conjunto.conjunto}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{conjunto.conjunto}</p>
                    <p className="text-sm text-muted-foreground">
                      {conjunto.totalLeads} leads • {conjunto.agendamentos} agendamentos
                    </p>
                  </div>
                  <Badge
                    variant={conjunto.taxaConversao >= 10 ? "default" : "outline"}
                    className={
                      conjunto.taxaConversao >= 10
                        ? "bg-success text-success-foreground hover:bg-success/90"
                        : ""
                    }
                  >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {conjunto.taxaConversao.toFixed(1)}%
                  </Badge>
                </div>
                <Progress
                  value={(conjunto.totalLeads / maxLeads) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
