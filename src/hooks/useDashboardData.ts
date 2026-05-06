import { useQuery } from "@tanstack/react-query";
import { supabaseExternal } from "@/lib/supabase-external";
import { RastreamentoRecord, DashboardFilters, CampaignMetrics, ConjuntoMetrics, DailyMetrics } from "@/types/dashboard";
import { format, parseISO } from "date-fns";

const PAGE_SIZE = 1000;

async function fetchRastreamento(): Promise<RastreamentoRecord[]> {
  console.log("Iniciando varredura completa em Rastreamento_face_doctor_itupeva...");

  const { count, error: countError } = await supabaseExternal
    .from("Rastreamento_face_doctor_itupeva")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Erro ao contar registros no banco:", countError);
    throw countError;
  }

  const totalEsperado = count ?? 0;
  const registros: RastreamentoRecord[] = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabaseExternal
      .from("Rastreamento_face_doctor_itupeva")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Erro ao buscar lote de registros:", error);
      throw error;
    }

    if (!data || data.length === 0) break;

    registros.push(...data);

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  if (totalEsperado > 0 && registros.length !== totalEsperado) {
    console.warn(
      `Divergência detectada: esperados ${totalEsperado}, carregados ${registros.length}.`
    );
  } else {
    console.log(`Varredura concluída com sucesso: ${registros.length} registros reais carregados.`);
  }

  return registros;
}

export function useDashboardData(filters: DashboardFilters) {
  const query = useQuery({
    queryKey: ["rastreamento"],
    queryFn: fetchRastreamento,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const filteredData = query.data?.filter((record) => {
    // Date filter
    if (filters.startDate || filters.endDate) {
      const recordDate = new Date(record.created_at);
      if (filters.startDate && recordDate < filters.startDate) return false;
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (recordDate > endOfDay) return false;
      }
    }

    // Campaign filter
    if (filters.campanhas.length > 0 && record.Campanha) {
      if (!filters.campanhas.includes(record.Campanha)) return false;
    }

    // Conjunto filter
    if (filters.conjuntos.length > 0 && record.Conjunto) {
      if (!filters.conjuntos.includes(record.Conjunto)) return false;
    }

    return true;
  }) || [];

  // Calculate metrics
  const totalLeads = filteredData.length;
  const totalAgendamentos = filteredData.filter((r) => r.Tracking === "Feito").length;
  const taxaConversao = totalLeads > 0 ? (totalAgendamentos / totalLeads) * 100 : 0;

  // Get date range
  const dates = filteredData.map((r) => new Date(r.created_at));
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  // Get unique campaigns and conjuntos for filters
  const allCampanhas = [...new Set(query.data?.map((r) => r.Campanha).filter(Boolean) || [])] as string[];
  const allConjuntos = [...new Set(query.data?.map((r) => r.Conjunto).filter(Boolean) || [])] as string[];

  // Campaign metrics
  const campaignMetrics: CampaignMetrics[] = Object.values(
    filteredData.reduce((acc, record) => {
      const campanha = record.Campanha || "Sem Campanha";
      if (!acc[campanha]) {
        acc[campanha] = { campanha, totalLeads: 0, agendamentos: 0, taxaConversao: 0 };
      }
      acc[campanha].totalLeads++;
      if (record.Tracking === "Feito") acc[campanha].agendamentos++;
      return acc;
    }, {} as Record<string, CampaignMetrics>)
  ).map((c) => ({
    ...c,
    taxaConversao: c.totalLeads > 0 ? (c.agendamentos / c.totalLeads) * 100 : 0,
  })).sort((a, b) => b.agendamentos - a.agendamentos);

  // Conjunto metrics
  const conjuntoMetrics: ConjuntoMetrics[] = Object.values(
    filteredData.reduce((acc, record) => {
      const conjunto = record.Conjunto || "Sem Conjunto";
      if (!acc[conjunto]) {
        acc[conjunto] = { conjunto, totalLeads: 0, agendamentos: 0, taxaConversao: 0 };
      }
      acc[conjunto].totalLeads++;
      if (record.Tracking === "Feito") acc[conjunto].agendamentos++;
      return acc;
    }, {} as Record<string, ConjuntoMetrics>)
  ).map((c) => ({
    ...c,
    taxaConversao: c.totalLeads > 0 ? (c.agendamentos / c.totalLeads) * 100 : 0,
  })).sort((a, b) => b.totalLeads - a.totalLeads);

  // Daily metrics for temporal chart
  const dailyData = filteredData.reduce((acc, record) => {
    const date = format(parseISO(record.created_at), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = { date, leads: 0, agendamentos: 0, acumulado: 0 };
    }
    acc[date].leads++;
    if (record.Tracking === "Feito") acc[date].agendamentos++;
    return acc;
  }, {} as Record<string, DailyMetrics>);

  const dailyMetrics: DailyMetrics[] = Object.values(dailyData)
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce((acc, curr, index) => {
      const prevAcumulado = index > 0 ? acc[index - 1].acumulado : 0;
      acc.push({ ...curr, acumulado: prevAcumulado + curr.agendamentos });
      return acc;
    }, [] as DailyMetrics[]);

  return {
    ...query,
    filteredData,
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
  };
}
