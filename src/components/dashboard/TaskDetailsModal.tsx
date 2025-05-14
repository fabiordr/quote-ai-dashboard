
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getQuotationTaskDetails, retryTaskContact, cancelTask } from "@/services/api";
import { QuotationTask, getLogLevelColor } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TaskDetailsModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
}) => {
  const { toast } = useToast();
  const [task, setTask] = useState<QuotationTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  const fetchTaskDetails = async () => {
    setIsLoading(true);
    try {
      const taskData = await getQuotationTaskDetails(taskId);
      setTask(taskData);
    } catch (error) {
      console.error("Erro ao buscar detalhes da tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da tarefa.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryContact = async () => {
    if (!task) return;
    
    setIsProcessing(true);
    try {
      await retryTaskContact(task.id);
      toast({
        title: "Sucesso",
        description: "Retentativa de contato agendada com sucesso.",
      });
      fetchTaskDetails();
      onTaskUpdated();
    } catch (error) {
      console.error("Erro ao agendar retentativa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a retentativa.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelTask = async () => {
    if (!task) return;
    
    if (!window.confirm("Tem certeza que deseja cancelar esta tarefa?")) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await cancelTask(task.id);
      toast({
        title: "Sucesso",
        description: "Tarefa cancelada com sucesso.",
      });
      fetchTaskDetails();
      onTaskUpdated();
    } catch (error) {
      console.error("Erro ao cancelar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : task ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Detalhes da Tarefa: {task.id} - Pedido: {task.id_pedido_cotacao_original}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="info">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="info" className="flex-1">Informações Gerais</TabsTrigger>
                <TabsTrigger value="parts" className="flex-1">Lista de Peças</TabsTrigger>
                <TabsTrigger value="messages" className="flex-1">Histórico de Mensagens</TabsTrigger>
                <TabsTrigger value="logs" className="flex-1">Logs do Sistema</TabsTrigger>
              </TabsList>
              
              {/* Aba de Informações Gerais */}
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Informações da Tarefa</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Criada em:</span>
                        <span>{format(new Date(task.created_at), 'dd/MM/yyyy HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Atualizada em:</span>
                        <span>{format(new Date(task.updated_at), 'dd/MM/yyyy HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tentativas:</span>
                        <span>{task.retry_attempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último contato:</span>
                        <span>{format(new Date(task.last_contact_attempt_at), 'dd/MM/yyyy HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Próxima ação:</span>
                        <span>{task.next_action_at ? format(new Date(task.next_action_at), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Informações do Fornecedor</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nome:</span>
                        <span>{task.nome_fornecedor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telefone:</span>
                        <span>{task.telefone_fornecedor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL Única:</span>
                        <a 
                          href={task.url_unica_fornecedor} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Abrir Link
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Informações do Veículo</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Marca:</span>
                        <span>{task.marca_veiculo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Modelo:</span>
                        <span>{task.modelo_veiculo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ano:</span>
                        <span>{task.ano_veiculo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chassi:</span>
                        <span>{task.chassi_veiculo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Respostas do Fornecedor</h3>
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-gray-600">Resposta recebida:</span>
                        <span className="mt-1 bg-white p-2 rounded border text-sm">
                          {task.supplier_response_content || 'Nenhuma resposta recebida ainda.'}
                        </span>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-gray-600">Interpretação Gemini:</span>
                        <span className="mt-1 bg-white p-2 rounded border text-sm">
                          {task.gemini_interpretation_of_response || 'Nenhuma interpretação disponível.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Payload Original Recebido</h3>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Visualizar JSON</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                          {JSON.stringify(task.received_input_payload, null, 2)}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  {task.status === 'contact_failed_retry_scheduled' && (
                    <Button 
                      onClick={handleRetryContact} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processando...' : 'Forçar Retentativa de Contato'}
                    </Button>
                  )}
                  
                  {!['timeout_final_no_response', 'error_processing', 'closed_supplier_declined', 'quote_finalized_by_system'].includes(task.status) && (
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelTask} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processando...' : 'Cancelar Tarefa'}
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              {/* Aba de Lista de Peças */}
              <TabsContent value="parts">
                <div className="bg-white border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {task.parts_list.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                            Nenhuma peça encontrada.
                          </td>
                        </tr>
                      ) : (
                        task.parts_list.map((part, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {part.descricao}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {part.codigo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {part.quantidade}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              {/* Aba de Histórico de Mensagens */}
              <TabsContent value="messages">
                <div className="space-y-4">
                  {task.message_history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma mensagem trocada ainda.
                    </div>
                  ) : (
                    task.message_history.map((message, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-4 rounded-lg max-w-[80%]",
                          message.direction === "agent_to_supplier" 
                            ? "bg-blue-100 ml-auto" 
                            : "bg-gray-100 mr-auto"
                        )}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-medium">
                            {message.direction === "agent_to_supplier" ? "Agente → Fornecedor" : "Fornecedor → Agente"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Tipo: {message.content_type}</span>
                          <span>Status: {message.evolution_status}</span>
                          <span>ID: {message.evolution_message_id}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              {/* Aba de Logs do Sistema */}
              <TabsContent value="logs">
                <div className="space-y-2">
                  {task.system_logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum log encontrado.
                    </div>
                  ) : (
                    task.system_logs.map((log, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <div className="flex items-center bg-gray-50 p-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium mr-2", getLogLevelColor(log.level))}>
                            {log.level}
                          </span>
                          <span className="text-sm font-medium mr-2">
                            {log.event_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                          </span>
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
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Erro ao carregar os detalhes da tarefa.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;
