import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, CalendarIcon, X, Filter, Download } from "lucide-react";

import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardFilters } from "@/types/dashboard";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const Leads = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: null,
    endDate: null,
    campanhas: [],
    conjuntos: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingFilter, setTrackingFilter] = useState<string>("all");

  const {
    isLoading,
    isRefetching,
    refetch,
    filteredData,
    allCampanhas,
    allConjuntos,
  } = useDashboardData(filters);

  // Apply additional filters (search + tracking)
  const displayedLeads = useMemo(() => {
    return filteredData.filter((lead) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          lead.Nome?.toLowerCase().includes(search) ||
          lead["E-mail"]?.toLowerCase().includes(search) ||
          lead.Cidade?.toLowerCase().includes(search) ||
          lead.Número?.toString().includes(search);
        if (!matchesSearch) return false;
      }

      // Tracking filter
      if (trackingFilter === "agendado" && lead.Tracking !== "Feito") return false;
      if (trackingFilter === "pendente" && lead.Tracking === "Feito") return false;

      return true;
    });
  }, [filteredData, searchTerm, trackingFilter]);

  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.campanhas.length > 0 || filters.conjuntos.length > 0;

  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      campanhas: [],
      conjuntos: [],
    });
    setSearchTerm("");
    setTrackingFilter("all");
  };

  const toggleCampanha = (campanha: string) => {
    const newCampanhas = filters.campanhas.includes(campanha)
      ? filters.campanhas.filter((c) => c !== campanha)
      : [...filters.campanhas, campanha];
    setFilters({ ...filters, campanhas: newCampanhas });
  };

  const toggleConjunto = (conjunto: string) => {
    const newConjuntos = filters.conjuntos.includes(conjunto)
      ? filters.conjuntos.filter((c) => c !== conjunto)
      : [...filters.conjuntos, conjunto];
    setFilters({ ...filters, conjuntos: newConjuntos });
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Número", "E-mail", "Cidade", "Campanha", "Conjunto", "Anúncio", "Status", "Data"];
    const rows = displayedLeads.map((lead) => [
      lead.Nome || "",
      lead.Número || "",
      lead["E-mail"] || "",
      lead.Cidade || "",
      lead.Campanha || "",
      lead.Conjunto || "",
      lead.Anúncio || "",
      lead.Tracking === "Feito" ? "Agendado" : "Pendente",
      format(new Date(lead.created_at), "dd/MM/yyyy HH:mm"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onRefresh={refetch} isRefreshing={isRefetching} />

      <main className="container mx-auto flex-1 space-y-6 px-4 py-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Listagem de Leads</h2>
            <p className="text-muted-foreground">
              {isLoading ? "Carregando..." : `${displayedLeads.length} leads encontrados`}
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-primary" />
                Filtros
              </CardTitle>
              {(hasActiveFilters || searchTerm || trackingFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search + Status Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={trackingFilter} onValueChange={setTrackingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendados</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "dd/MM") : "De"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate || undefined}
                      onSelect={(date) => setFilters({ ...filters, startDate: date || null })}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "dd/MM") : "Até"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate || undefined}
                      onSelect={(date) => setFilters({ ...filters, endDate: date || null })}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Campaign Filter */}
            {allCampanhas.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Campanhas</label>
                <div className="flex flex-wrap gap-2">
                  {allCampanhas.map((campanha) => (
                    <Badge
                      key={campanha}
                      variant={filters.campanhas.includes(campanha) ? "default" : "outline"}
                      className="cursor-pointer transition-colors hover:bg-primary/90"
                      onClick={() => toggleCampanha(campanha)}
                    >
                      {campanha}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Conjunto Filter */}
            {allConjuntos.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Conjuntos</label>
                <div className="flex flex-wrap gap-2">
                  {allConjuntos.map((conjunto) => (
                    <Badge
                      key={conjunto}
                      variant={filters.conjuntos.includes(conjunto) ? "default" : "outline"}
                      className="cursor-pointer transition-colors hover:bg-primary/90"
                      onClick={() => toggleConjunto(conjunto)}
                    >
                      {conjunto}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Conjunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : displayedLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Nenhum lead encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.Nome || "-"}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.Número && (
                              <div className="text-sm">{lead.Número}</div>
                            )}
                            {lead["E-mail"] && (
                              <div className="text-xs text-muted-foreground">{lead["E-mail"]}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{lead.Cidade || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {lead.Campanha || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {lead.Conjunto || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={lead.Tracking === "Feito" ? "default" : "outline"}
                            className={cn(
                              "text-xs",
                              lead.Tracking === "Feito"
                                ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                                : "text-muted-foreground"
                            )}
                          >
                            {lead.Tracking === "Feito" ? "Agendado" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), "dd/MM/yy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer lastUpdate={new Date()} />
    </div>
  );
};

export default Leads;
