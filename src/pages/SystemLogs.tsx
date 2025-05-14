
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSystemLogs } from "@/services/api";
import { LogLevel, getLogLevelColor } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const levelOptions = [
  { value: "all", label: "Todos" }, // Changed from empty string to "all"
  { value: "INFO", label: "INFO" },
  { value: "WARN", label: "WARN" },
  { value: "ERROR", label: "ERROR" },
  { value: "DEBUG", label: "DEBUG" },
  { value: "CRITICAL", label: "CRITICAL" },
];

const eventTypeOptions = [
  { value: "all", label: "Todos" }, // Changed from empty string to "all"
  { value: "new_task_created", label: "Nova Tarefa Criada" },
  { value: "gemini_api_call_sent", label: "Chamada API Gemini" },
  { value: "evolution_api_send_text", label: "Envio de Texto WhatsApp" },
  { value: "webhook_received_message", label: "Mensagem Recebida" },
  { value: "task_status_updated", label: "Status de Tarefa Atualizado" },
];

const SystemLogs = () => {
  const { toast } = useToast();
  
  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all"); // Changed from empty string to "all"
  const [eventTypeFilter, setEventTypeFilter] = useState("all"); // Changed from empty string to "all"
  const [taskIdFilter, setTaskIdFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Estados para os dados e paginação
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // Função para buscar os logs
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const result = await getSystemLogs(
        searchTerm,
        levelFilter === "all" ? undefined : levelFilter as LogLevel, // Modified to handle "all" value
        eventTypeFilter === "all" ? undefined : eventTypeFilter, // Modified to handle "all" value
        taskIdFilter || undefined,
        startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        currentPage,
        pageSize,
        'timestamp',
        'desc'
      );
      
      setLogs(result.data);
      setTotalPages(Math.ceil(result.total / pageSize));
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs do sistema.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efeito para buscar os logs quando os filtros mudam
  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize]);
  
  // Função para aplicar os filtros
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset para a primeira página
    fetchLogs();
  };
  
  // Função para limpar os filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setLevelFilter("all"); // Changed from empty string to "all"
    setEventTypeFilter("all"); // Changed from empty string to "all"
    setTaskIdFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Logs do Sistema do Agente de Cotações</h1>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-medium">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Busca por Mensagem/Detalhes */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Buscar na mensagem ou detalhes" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {/* Filtro por Nível */}
          <div>
            <Select 
              value={levelFilter} 
              onValueChange={setLevelFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro por Tipo de Evento */}
          <div>
            <Select 
              value={eventTypeFilter} 
              onValueChange={setEventTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Evento" />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro por ID Tarefa */}
          <div>
            <Input 
              placeholder="ID da Tarefa Relacionada" 
              value={taskIdFilter}
              onChange={(e) => setTaskIdFilter(e.target.value)}
            />
          </div>
          
          {/* Filtro por Data Inicial */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PP', { locale: ptBR }) : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Filtro por Data Final */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PP', { locale: ptBR }) : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </div>
      </div>
      
      {/* Tabela de Logs */}
      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loader
          Array(5).fill(null).map((_, index) => (
            <div key={index} className="border rounded-md overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-12"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
            Nenhum log encontrado.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border rounded-md overflow-hidden bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between bg-gray-50 p-3">
                <div className="flex items-center space-x-2">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getLogLevelColor(log.level))}>
                    {log.level}
                  </span>
                  <span className="text-sm font-medium">
                    {log.event_type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {log.related_task_id && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Tarefa: {log.related_task_id}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm">{log.message}</p>
              </div>
              <div className="border-t">
                <Accordion type="single" collapsible>
                  <AccordionItem value="details">
                    <AccordionTrigger className="px-3 py-2 text-sm">
                      Detalhes
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-900 text-gray-100 p-3 text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Paginação */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-lg shadow-sm">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Próxima
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, logs.length + (currentPage - 1) * pageSize)}
              </span>{" "}
              de <span className="font-medium">{logs.length + (currentPage - 1) * pageSize}</span> resultados
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Itens por página:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  Primeira
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-2 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Próxima
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Última
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
