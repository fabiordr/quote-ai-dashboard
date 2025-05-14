
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
import { StatusBadge } from "@/components/ui/status-badge";
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
import { getQuotationTasks } from "@/services/api";
import { QuotationTaskStatus } from "@/types";
import TaskDetailsModal from "@/components/dashboard/TaskDetailsModal";
import { useToast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "all", label: "Todos" }, // Changed from empty string to "all"
  { value: "new", label: "Nova" },
  { value: "queued_for_contact", label: "Na Fila para Contato" },
  { value: "contact_failed_retry_scheduled", label: "Falha no Contato - Agendado Retentativa" },
  { value: "initial_contact_sent", label: "Contato Inicial Enviado" },
  { value: "awaiting_supplier_response", label: "Aguardando Resposta Fornecedor" },
  { value: "supplier_response_received_positive", label: "Resposta Positiva Recebida" },
  { value: "supplier_response_received_negative", label: "Resposta Negativa Recebida" },
  { value: "supplier_response_unclear", label: "Resposta do Fornecedor Não Clara" },
  { value: "parts_list_sent", label: "Lista de Peças Enviada" },
  { value: "awaiting_system_quote_update", label: "Aguardando Atualização no Sistema" },
  { value: "quote_finalized_by_system", label: "Cotação Finalizada pelo Sistema" },
  { value: "timeout_reminder_sent", label: "Lembrete de Timeout Enviado" },
  { value: "timeout_final_no_response", label: "Timeout Final - Sem Resposta" },
  { value: "error_processing", label: "Erro no Processamento" },
  { value: "closed_supplier_declined", label: "Fechado - Fornecedor Recusou" },
];

const Dashboard = () => {
  const { toast } = useToast();
  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // Changed initial state to "all"
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Estados para os dados e paginação
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Estado para o modal de detalhes
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Função para buscar as tarefas
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const result = await getQuotationTasks(
        searchTerm,
        statusFilter === "all" ? undefined : statusFilter as QuotationTaskStatus, // Modified to handle "all" value
        startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        currentPage,
        pageSize,
        'updated_at',
        'desc'
      );
      
      setTasks(result.data);
      setTotalPages(Math.ceil(result.total / pageSize));
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efeito para buscar as tarefas quando os filtros mudam
  useEffect(() => {
    fetchTasks();
  }, [currentPage, pageSize]);
  
  // Função para aplicar os filtros
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset para a primeira página
    fetchTasks();
  };
  
  // Função para limpar os filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
    fetchTasks();
  };
  
  // Função para abrir o modal de detalhes
  const handleViewDetails = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };
  
  // Função para fechar o modal de detalhes
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard de Acompanhamento de Cotações</h1>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-medium">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca Global */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Buscar ID, fornecedor ou telefone" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {/* Filtro por Status */}
          <div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      
      {/* Tabela de Tarefas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Tarefa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido Original</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próxima Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Skeleton loader
                Array(5).fill(null).map((_, index) => (
                  <tr key={index}>
                    {Array(9).fill(null).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.id_pedido_cotacao_original}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.nome_fornecedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.telefone_fornecedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${task.marca_veiculo} ${task.modelo_veiculo} ${task.ano_veiculo}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.next_action_at 
                        ? format(new Date(task.next_action_at), 'dd/MM/yyyy HH:mm')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(task.updated_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(task.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  {Math.min(currentPage * pageSize, tasks.length + (currentPage - 1) * pageSize)}
                </span>{" "}
                de <span className="font-medium">{tasks.length + (currentPage - 1) * pageSize}</span> resultados
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
                    {[10, 20, 50].map((size) => (
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
      
      {/* Modal de Detalhes da Tarefa */}
      {isModalOpen && selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
