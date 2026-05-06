export interface RastreamentoRecord {
  id: number;
  created_at: string;
  Nome: string | null;
  Número: number | null;
  "E-mail": string | null;
  Cidade: string | null;
  Campanha: string | null;
  Conjunto: string | null;
  Anúncio: string | null;
  source_id: string | null;
  cta_clid: string | null;
  thumbnail: string | null;
  cta: string | null;
  url: string | null;
  mensagem: string | null;
  Tracking: string | null;
}

export interface CampaignMetrics {
  campanha: string;
  totalLeads: number;
  agendamentos: number;
  taxaConversao: number;
}

export interface ConjuntoMetrics {
  conjunto: string;
  totalLeads: number;
  agendamentos: number;
  taxaConversao: number;
}

export interface DailyMetrics {
  date: string;
  leads: number;
  agendamentos: number;
  acumulado: number;
}

export interface DashboardFilters {
  startDate: Date | null;
  endDate: Date | null;
  campanhas: string[];
  conjuntos: string[];
}
