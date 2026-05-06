import { Trophy, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignMetrics } from "@/types/dashboard";

interface CampaignRankingProps {
  data: CampaignMetrics[];
  isLoading: boolean;
}

export function CampaignRanking({ data, isLoading }: CampaignRankingProps) {
  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking de Campanhas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum dado encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Agendamentos</TableHead>
                  <TableHead className="text-right">Conversão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((campaign, index) => (
                  <TableRow key={campaign.campanha} className="group">
                    <TableCell className="font-medium">
                      {index === 0 ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning text-xs font-bold text-warning-foreground">
                          1
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{campaign.campanha}</TableCell>
                    <TableCell className="text-right">{campaign.totalLeads}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">
                        {campaign.agendamentos}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={campaign.taxaConversao >= 10 ? "default" : "outline"}
                        className={
                          campaign.taxaConversao >= 10
                            ? "bg-success text-success-foreground hover:bg-success/90"
                            : ""
                        }
                      >
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {campaign.taxaConversao.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
