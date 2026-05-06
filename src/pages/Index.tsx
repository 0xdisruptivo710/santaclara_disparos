import { useState, useMemo } from "react";
import { Search, Download, MessageCircle, Users, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Interesse } from "@/types/interesse";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function tokenize(s: string): string[] {
  return normalize(s).split(/\s+/).filter(Boolean);
}

function scoreMatch(carroInteresse: string, query: string): number {
  if (!query.trim()) return 0;
  const interesse = normalize(carroInteresse);
  const interesseTokens = interesse.split(/\s+/).filter(Boolean);
  const queryNorm = normalize(query);
  const tokens = tokenize(query);

  let score = 0;

  // Exact full match
  if (interesse === queryNorm) score += 1000;

  // Full query as substring
  if (interesse.includes(queryNorm)) score += 200;

  for (const t of tokens) {
    if (!t) continue;
    // Exact token match (whole word) — Fox === Fox
    if (interesseTokens.includes(t)) score += 100;
    // Starts with token — "Fox Prime"
    else if (interesseTokens.some((it) => it.startsWith(t))) score += 60;
    // Substring — "Crossfox" contains "fox"
    else if (interesse.includes(t)) score += 30;
  }

  // Small boost when shorter strings match (more specific)
  if (score > 0) score += Math.max(0, 20 - interesse.length);

  return score;
}

const PAGE_SIZE = 25;

const Index = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data: interesses = [], isLoading } = useQuery({
    queryKey: ["interesses"],
    queryFn: async (): Promise<Interesse[]> => {
      const { data, error } = await supabase
        .from("interesses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Interesse[];
    },
  });

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return interesses
      .map((i) => ({ item: i, score: scoreMatch(i.carro_interesse, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }, [interesses, query]);

  const allSelected = results.length > 0 && results.every((r) => selected.has(r.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const exportCSV = () => {
    const rows = results.length > 0 ? results : [];
    if (rows.length === 0) {
      toast({ title: "Nada para exportar", description: "Faça uma busca primeiro." });
      return;
    }
    const header = ["Nome", "Numero", "Carro de Interesse", "Nota Interna"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.nome, r.numero, r.carro_interesse, r.nota_interna ?? ""]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `busca-${query}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openMsg = () => {
    if (selected.size === 0) {
      toast({ title: "Selecione clientes", description: "Marque ao menos um cliente para enviar mensagem.", variant: "destructive" });
      return;
    }
    setMsgOpen(true);
  };

  const sendMessages = () => {
    const targets = results.filter((r) => selected.has(r.id));
    if (!message.trim()) {
      toast({ title: "Mensagem vazia", variant: "destructive" });
      return;
    }
    targets.forEach((t, idx) => {
      const phone = t.numero.replace(/\D/g, "");
      const personal = message.replace(/\{nome\}/gi, t.nome).replace(/\{carro\}/gi, t.carro_interesse);
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(personal)}`;
      setTimeout(() => window.open(url, "_blank"), idx * 400);
    });
    setMsgOpen(false);
    toast({ title: `Abrindo WhatsApp para ${targets.length} cliente(s)` });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto flex-1 space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Buscar interessados por veículo</h1>
              <p className="text-sm text-muted-foreground">
                Digite o modelo (ex.: Fox) para encontrar clientes com interesse correspondente.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar carro... (ex.: Fox)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(new Set());
                }}
                className="pl-9 h-11"
              />
            </div>
            <Button onClick={exportCSV} variant="outline" className="gap-2 h-11">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={openMsg} className="gap-2 h-11 bg-gradient-primary">
              <MessageCircle className="h-4 w-4" />
              Enviar mensagem ({selected.size})
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Resultados</h2>
              <Badge variant="secondary">{results.length}</Badge>
            </div>
            {!query.trim() && (
              <span className="text-xs text-muted-foreground">Comece digitando um modelo acima</span>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando base...</div>
          ) : !query.trim() ? (
            <div className="p-12 text-center text-muted-foreground">
              Faça uma busca para ver os clientes correspondentes.
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Nenhum cliente encontrado para "{query}".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Carro de Interesse</TableHead>
                  <TableHead>Nota Interna</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => toggleOne(r.id)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={() => toggleOne(r.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{r.nome}</TableCell>
                    <TableCell>{r.numero}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.carro_interesse}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.nota_interna || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>

      <Footer lastUpdate={new Date()} />

      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensagem ({selected.size} cliente(s))</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use <code className="rounded bg-muted px-1">{"{nome}"}</code> e{" "}
              <code className="rounded bg-muted px-1">{"{carro}"}</code> para personalizar.
            </p>
            <Textarea
              rows={6}
              placeholder="Olá {nome}, temos um {carro} novo no estoque..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMsgOpen(false)}>Cancelar</Button>
            <Button onClick={sendMessages} className="bg-gradient-primary gap-2">
              <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
