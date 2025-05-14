
export interface QuotationTask {
  id: string;                        // ID da tarefa no sistema do agente (sim_task_1)
  id_pedido_cotacao_original: string; // ID da cotação do sistema principal (COTACAO_12345_XYZ)
  nome_fornecedor: string;           // Nome do fornecedor
  telefone_fornecedor: string;       // Telefone do fornecedor
  marca_veiculo: string;             // Marca do veículo
  modelo_veiculo: string;            // Modelo do veículo
  ano_veiculo: number;               // Ano do veículo
  chassi_veiculo: string;            // Chassi do veículo
  url_unica_fornecedor: string;      // URL única para o fornecedor
  status: QuotationTaskStatus;       // Status atual da tarefa
  retry_attempts: number;            // Número de tentativas de contato
  last_contact_attempt_at: string;   // Data/hora da última tentativa de contato
  next_action_at: string | null;     // Data/hora da próxima ação agendada
  supplier_response_content: string | null; // Conteúdo da resposta do fornecedor
  gemini_interpretation_of_response: string | null; // Interpretação da resposta pelo Gemini
  created_at: string;                // Data/hora de criação
  updated_at: string;                // Data/hora de atualização
  received_input_payload: any;       // JSON original do pedido
  parts_list: QuotationPart[];       // Lista de peças solicitadas
  message_history: QuotationMessage[]; // Histórico de mensagens
  system_logs: SystemLog[];          // Logs do sistema relacionados a esta tarefa
}

export interface QuotationPart {
  descricao: string;                 // Descrição da peça
  codigo: string;                    // Código da peça
  quantidade: number;                // Quantidade solicitada
}

export interface QuotationMessage {
  timestamp: string;                 // Data/hora da mensagem
  direction: 'agent_to_supplier' | 'supplier_to_agent'; // Direção da mensagem
  content: string;                   // Conteúdo da mensagem
  content_type: 'text' | 'image' | 'audio' | 'video' | 'document'; // Tipo do conteúdo
  evolution_message_id: string;      // ID da mensagem no Evolution
  evolution_status: 'sent' | 'delivered' | 'read'; // Status da mensagem no Evolution
}

export interface SystemLog {
  id: string;                        // ID do log
  timestamp: string;                 // Data/hora do log
  level: LogLevel;                   // Nível do log
  event_type: string;                // Tipo de evento
  message: string;                   // Mensagem do log
  related_task_id: string | null;    // ID da tarefa relacionada
  details: any;                      // Detalhes do log (JSON)
}

export interface AgentSetting {
  key: string;                       // Chave da configuração
  value: string | number;            // Valor da configuração
  description: string;               // Descrição da configuração
  type: 'text' | 'number' | 'textarea' | 'password'; // Tipo da configuração
  category: 'general' | 'prompts' | 'api'; // Categoria da configuração
}

export type QuotationTaskStatus = 
  | 'new'
  | 'queued_for_contact'
  | 'contact_failed_retry_scheduled'
  | 'initial_contact_sent'
  | 'awaiting_supplier_response'
  | 'supplier_response_received_positive'
  | 'supplier_response_received_negative'
  | 'supplier_response_unclear'
  | 'parts_list_sent'
  | 'awaiting_system_quote_update'
  | 'quote_finalized_by_system'
  | 'timeout_reminder_sent'
  | 'timeout_final_no_response'
  | 'error_processing'
  | 'closed_supplier_declined';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'CRITICAL';

export const translateStatus = (status: QuotationTaskStatus): string => {
  const statusMap: Record<QuotationTaskStatus, string> = {
    'new': 'Nova',
    'queued_for_contact': 'Na Fila para Contato',
    'contact_failed_retry_scheduled': 'Falha no Contato - Agendado Retentativa',
    'initial_contact_sent': 'Contato Inicial Enviado',
    'awaiting_supplier_response': 'Aguardando Resposta Fornecedor',
    'supplier_response_received_positive': 'Resposta Positiva Recebida',
    'supplier_response_received_negative': 'Resposta Negativa Recebida',
    'supplier_response_unclear': 'Resposta do Fornecedor Não Clara',
    'parts_list_sent': 'Lista de Peças Enviada',
    'awaiting_system_quote_update': 'Aguardando Atualização no Sistema',
    'quote_finalized_by_system': 'Cotação Finalizada pelo Sistema',
    'timeout_reminder_sent': 'Lembrete de Timeout Enviado',
    'timeout_final_no_response': 'Timeout Final - Sem Resposta',
    'error_processing': 'Erro no Processamento',
    'closed_supplier_declined': 'Fechado - Fornecedor Recusou'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status: QuotationTaskStatus): string => {
  const statusColorMap: Record<QuotationTaskStatus, string> = {
    'new': 'bg-status-info',
    'queued_for_contact': 'bg-status-info',
    'contact_failed_retry_scheduled': 'bg-status-warning',
    'initial_contact_sent': 'bg-status-info',
    'awaiting_supplier_response': 'bg-status-info',
    'supplier_response_received_positive': 'bg-status-success',
    'supplier_response_received_negative': 'bg-status-error',
    'supplier_response_unclear': 'bg-status-warning',
    'parts_list_sent': 'bg-status-success',
    'awaiting_system_quote_update': 'bg-status-info',
    'quote_finalized_by_system': 'bg-status-success',
    'timeout_reminder_sent': 'bg-status-warning',
    'timeout_final_no_response': 'bg-status-error',
    'error_processing': 'bg-status-error',
    'closed_supplier_declined': 'bg-status-error'
  };
  
  return statusColorMap[status] || 'bg-gray-500';
};

export const getLogLevelColor = (level: LogLevel): string => {
  const levelColorMap: Record<LogLevel, string> = {
    'INFO': 'bg-blue-100 text-blue-800',
    'WARN': 'bg-yellow-100 text-yellow-800',
    'ERROR': 'bg-red-100 text-red-800',
    'DEBUG': 'bg-gray-100 text-gray-800',
    'CRITICAL': 'bg-red-100 text-red-800'
  };
  
  return levelColorMap[level] || 'bg-gray-100 text-gray-800';
};
