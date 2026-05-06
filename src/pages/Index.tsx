import { useState, useCallback } from "react";
import { Users, CalendarCheck, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardFilters } from "@/types/dashboard";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Filters } from "@/components/dashboard/Filters";
import { CampaignRanking } from "@/components/dashboard/CampaignRanking";
import { TemporalChart } from "@/components/dashboard/TemporalChart";
import { CampaignDistribution } from "@/components/dashboard/CampaignDistribution";
import { ConjuntoMetrics } from "@/components/dashboard/ConjuntoMetrics";
import { Footer } from "@/components/dashboard/Footer";

const Index = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: null,
    endDate: null,
    campanhas: [],
    conjuntos: [],
  });

  const {
    isLoading,
    isRefetching,
    refetch,
    totalLeads,
    totalAgendamentos,
    taxaConversao,
    minDate,
    maxDate,
    allCampanhas,
    allConjuntos,
    campaignMetrics,
    conjuntoMetrics,
    dailyMetrics,
  } = useDashboardData(filters);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatDateRange = () => {
    if (!minDate || !maxDate) return "Carregando...";
    return `${format(minDate, "dd/MM/yy")} - ${format(maxDate, "dd/MM/yy")}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onRefresh={handleRefresh} isRefreshing={isRefetching} />

      <main className="container mx-auto flex-1 space-y-6 px-4 py-6">
        {/* KPI Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Leads"
            value={totalLeads.toLocaleString("pt-BR")}
            subtitle="Contatos captados"
            icon={Users}
            variant="primary"
            isLoading={isLoading}
          />
          <MetricCard
            title="Agendamentos"
            value={totalAgendamentos.toLocaleString("pt-BR")}
            subtitle="Tracking = Feito"
            icon={CalendarCheck}
            variant="success"
            isLoading={isLoading}
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${taxaConversao.toFixed(1)}%`}
            subtitle="Agendamentos / Leads"
            icon={TrendingUp}
            isLoading={isLoading}
          />
          <MetricCard
            title="Período"
            value={formatDateRange()}
            subtitle="Dados disponíveis"
            icon={Calendar}
            isLoading={isLoading}
          />
        </section>

        {/* Filters */}
        <Filters
          filters={filters}
          allCampanhas={allCampanhas}
          allConjuntos={allConjuntos}
          onFiltersChange={setFilters}
        />

        {/* Charts Grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          <TemporalChart data={dailyMetrics} isLoading={isLoading} />
          <CampaignDistribution data={campaignMetrics} isLoading={isLoading} />
        </section>

        {/* Campaign Ranking */}
        <CampaignRanking data={campaignMetrics} isLoading={isLoading} />

        {/* Conjunto Metrics */}
        <ConjuntoMetrics data={conjuntoMetrics} isLoading={isLoading} />
      </main>

      <Footer lastUpdate={new Date()} />
    </div>
  );
};

export default Index;
