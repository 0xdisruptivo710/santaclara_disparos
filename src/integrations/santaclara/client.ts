// Cliente Supabase do banco de leads Santa Clara (dados de interesses em veículos).
// As credenciais abaixo são públicas (anon key) e podem ficar no código.
import { createClient } from "@supabase/supabase-js";
import type { Interesse } from "@/types/interesse";

const URL = "https://ehlpmukjdknnyhkycncb.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobHBtdWtqZGtubnloa3ljbmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzQwOTgsImV4cCI6MjA2MjU1MDA5OH0.y3NYzn7hQbuYZ2ZsUm4YGe-dh4GjlFKpTpKyIgrby-E";

export const santaclara = createClient(URL, ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const TABLE = "Interesse_SantaClara";

// Mapeamento das colunas externas -> formato interno usado pelo app.
type Row = {
  id?: string | number;
  Nome: string;
  Numero: string;
  Interesse: string;
  ["Anotação"]: string | null;
  created_at?: string;
};

const toInteresse = (r: Row): Interesse => ({
  id: String(r.id ?? `${r.Nome}-${r.Numero}`),
  nome: r.Nome ?? "",
  numero: r.Numero ?? "",
  carro_interesse: r.Interesse ?? "",
  nota_interna: (r["Anotação"] as string | null) ?? null,
  created_at: r.created_at ?? "",
  updated_at: r.created_at ?? "",
});

export const santaclaraApi = {
  async list(): Promise<Interesse[]> {
    // O PostgREST do Supabase limita cada requisição a 1000 linhas, então
    // paginamos com .range() até trazer toda a base.
    const PAGE = 1000;
    const all: Row[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await santaclara
        .from(TABLE)
        .select("*")
        .order("id", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      const rows = (data as Row[]) ?? [];
      all.push(...rows);
      if (rows.length < PAGE) break;
    }
    return all.map(toInteresse);
  },
  async insert(input: { nome: string; numero: string; carro_interesse: string; nota_interna: string | null }) {
    const { error } = await santaclara.from(TABLE).insert({
      Nome: input.nome,
      Numero: input.numero,
      Interesse: input.carro_interesse,
      ["Anotação"]: input.nota_interna,
    });
    if (error) throw error;
  },
  async update(id: string, input: { nome: string; numero: string; carro_interesse: string; nota_interna: string | null }) {
    const idVal: string | number = /^\d+$/.test(id) ? Number(id) : id;
    const { error } = await santaclara
      .from(TABLE)
      .update({
        Nome: input.nome,
        Numero: input.numero,
        Interesse: input.carro_interesse,
        ["Anotação"]: input.nota_interna,
      })
      .eq("id", idVal);
    if (error) throw error;
  },
  async remove(id: string) {
    const idVal: string | number = /^\d+$/.test(id) ? Number(id) : id;
    const { error } = await santaclara.from(TABLE).delete().eq("id", idVal);
    if (error) throw error;
  },
};
