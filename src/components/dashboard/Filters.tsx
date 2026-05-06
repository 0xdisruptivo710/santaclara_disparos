import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardFilters } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface FiltersProps {
  filters: DashboardFilters;
  allCampanhas: string[];
  allConjuntos: string[];
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function Filters({ filters, allCampanhas, allConjuntos, onFiltersChange }: FiltersProps) {
  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.campanhas.length > 0 || filters.conjuntos.length > 0;

  const clearFilters = () => {
    onFiltersChange({
      startDate: null,
      endDate: null,
      campanhas: [],
      conjuntos: [],
    });
  };

  const toggleCampanha = (campanha: string) => {
    const newCampanhas = filters.campanhas.includes(campanha)
      ? filters.campanhas.filter((c) => c !== campanha)
      : [...filters.campanhas, campanha];
    onFiltersChange({ ...filters, campanhas: newCampanhas });
  };

  const toggleConjunto = (conjunto: string) => {
    const newConjuntos = filters.conjuntos.includes(conjunto)
      ? filters.conjuntos.filter((c) => c !== conjunto)
      : [...filters.conjuntos, conjunto];
    onFiltersChange({ ...filters, conjuntos: newConjuntos });
  };

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Data Inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => onFiltersChange({ ...filters, startDate: date || null })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Data Final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => onFiltersChange({ ...filters, endDate: date || null })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Campaign Filter */}
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

        {/* Conjunto Filter */}
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
      </CardContent>
    </Card>
  );
}
