
import { AgentSetting, QuotationTask, SystemLog } from "@/types";

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Replace with your actual API URL

// Helper function for handling API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro no servidor');
  }
  return response.json();
};

// Quotation Tasks API
export const getQuotationTasks = async (
  search?: string,
  status?: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 10,
  sortBy = 'created_at',
  order = 'desc'
) => {
  const params = new URLSearchParams();
  if (search) params.append('search_term', search);
  if (status) params.append('status', status);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('sort_by', sortBy);
  params.append('order', order);

  // For demo purposes, simulating data
  return {
    data: Array(limit).fill(null).map((_, i) => ({
      id: `sim_task_${i + 1 + (page - 1) * limit}`,
      id_pedido_cotacao_original: `COTACAO_${12345 + i + (page - 1) * limit}_XYZ`,
      nome_fornecedor: `Fornecedor ${i + 1 + (page - 1) * limit}`,
      telefone_fornecedor: `+55 11 9${9000 + i + (page - 1) * limit}-${8000 + i + (page - 1) * limit}`,
      marca_veiculo: ['Volkswagen', 'Toyota', 'Fiat', 'Chevrolet', 'Honda'][i % 5],
      modelo_veiculo: ['Virtus', 'Corolla', 'Argo', 'Onix', 'Civic'][i % 5],
      ano_veiculo: 2020 + (i % 4),
      chassi_veiculo: `9BW${i}L21U8${i}P${i}63682`,
      status: ['new', 'awaiting_supplier_response', 'parts_list_sent', 'error_processing', 'quote_finalized_by_system'][i % 5] as any,
      next_action_at: i % 3 === 0 ? new Date(Date.now() + 3600000 * (i % 24)).toISOString() : null,
      updated_at: new Date().toISOString(),
    })),
    total: 100,
    page,
    limit
  };
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/quotation-tasks?${params.toString()}`)
  //  .then(handleResponse);
};

export const getQuotationTaskDetails = async (taskId: string): Promise<QuotationTask> => {
  // For demo purposes, simulating data
  return {
    id: taskId,
    id_pedido_cotacao_original: `COTACAO_${12345}_XYZ`,
    nome_fornecedor: "Carlos Silva Auto Peças",
    telefone_fornecedor: "+55 11 99876-5432",
    marca_veiculo: "Volkswagen",
    modelo_veiculo: "Virtus",
    ano_veiculo: 2023,
    chassi_veiculo: "9BW7L21U8PP363682",
    url_unica_fornecedor: "https://example.com/cotacao/xyz123",
    status: "awaiting_supplier_response",
    retry_attempts: 1,
    last_contact_attempt_at: new Date(Date.now() - 3600000).toISOString(),
    next_action_at: new Date(Date.now() + 3600000).toISOString(),
    supplier_response_content: "Olá, sim, temos essas peças. Posso te enviar os valores.",
    gemini_interpretation_of_response: "O fornecedor respondeu positivamente e está disposto a fornecer cotação para as peças solicitadas.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    received_input_payload: {
      id_cotacao: "COTACAO_12345_XYZ",
      fornecedor: {
        nome: "Carlos Silva Auto Peças",
        telefone: "+55 11 99876-5432"
      },
      veiculo: {
        marca: "Volkswagen",
        modelo: "Virtus",
        ano: 2023,
        chassi: "9BW7L21U8PP363682"
      },
      pecas: [
        { codigo: "5U0807221", descricao: "Para-choque dianteiro", quantidade: 1 },
        { codigo: "5U0853761", descricao: "Grade do radiador", quantidade: 1 },
        { codigo: "5U0941005", descricao: "Farol dianteiro direito", quantidade: 1 }
      ]
    },
    parts_list: [
      { codigo: "5U0807221", descricao: "Para-choque dianteiro", quantidade: 1 },
      { codigo: "5U0853761", descricao: "Grade do radiador", quantidade: 1 },
      { codigo: "5U0941005", descricao: "Farol dianteiro direito", quantidade: 1 }
    ],
    message_history: [
      {
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        direction: "agent_to_supplier",
        content: "Olá! Sou o assistente da Oficina Brasil e gostaria de solicitar cotação para algumas peças de um Volkswagen Virtus 2023.",
        content_type: "text",
        evolution_message_id: "evo_msg_123",
        evolution_status: "read"
      },
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        direction: "supplier_to_agent",
        content: "Olá, sim, temos essas peças. Posso te enviar os valores.",
        content_type: "text",
        evolution_message_id: "evo_msg_124",
        evolution_status: "read"
      },
      {
        timestamp: new Date().toISOString(),
        direction: "agent_to_supplier",
        content: "Ótimo! Segue a lista das peças que precisamos:\n\n- Para-choque dianteiro (5U0807221) x1\n- Grade do radiador (5U0853761) x1\n- Farol dianteiro direito (5U0941005) x1\n\nAguardo sua cotação. Obrigado!",
        content_type: "text",
        evolution_message_id: "evo_msg_125",
        evolution_status: "delivered"
      }
    ],
    system_logs: [
      {
        id: "log_001",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        level: "INFO",
        event_type: "new_task_created",
        message: "Nova tarefa de cotação criada",
        related_task_id: taskId,
        details: { task_id: taskId }
      },
      {
        id: "log_002",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        level: "INFO",
        event_type: "evolution_api_send_text",
        message: "Mensagem inicial enviada para o fornecedor",
        related_task_id: taskId,
        details: { 
          message_id: "evo_msg_123",
          status: "sent"
        }
      },
      {
        id: "log_003",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: "INFO",
        event_type: "webhook_received_message",
        message: "Mensagem recebida do fornecedor",
        related_task_id: taskId,
        details: {
          message_id: "evo_msg_124",
          content: "Olá, sim, temos essas peças. Posso te enviar os valores."
        }
      },
      {
        id: "log_004",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        level: "INFO",
        event_type: "gemini_api_call_sent",
        message: "Chamada para API Gemini para interpretar resposta",
        related_task_id: taskId,
        details: {
          prompt: "Analise a seguinte resposta de um fornecedor...",
          response: "O fornecedor respondeu positivamente..."
        }
      },
      {
        id: "log_005",
        timestamp: new Date().toISOString(),
        level: "INFO",
        event_type: "evolution_api_send_text",
        message: "Lista de peças enviada para o fornecedor",
        related_task_id: taskId,
        details: {
          message_id: "evo_msg_125",
          status: "sent"
        }
      }
    ]
  };
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/quotation-tasks/${taskId}`)
  //  .then(handleResponse);
};

export const retryTaskContact = async (taskId: string) => {
  // For demo purposes, just returning success
  return { success: true };
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/quotation-tasks/${taskId}/retry`, {
  //   method: 'POST',
  // }).then(handleResponse);
};

export const cancelTask = async (taskId: string) => {
  // For demo purposes, just returning success
  return { success: true };
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/quotation-tasks/${taskId}/cancel`, {
  //   method: 'POST',
  // }).then(handleResponse);
};

// System Logs API
export const getSystemLogs = async (
  message?: string,
  level?: string,
  eventType?: string,
  relatedTaskId?: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 50,
  sortBy = 'timestamp',
  order = 'desc'
) => {
  const params = new URLSearchParams();
  if (message) params.append('message', message);
  if (level) params.append('level', level);
  if (eventType) params.append('event_type', eventType);
  if (relatedTaskId) params.append('related_task_id', relatedTaskId);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('sort_by', sortBy);
  params.append('order', order);

  // For demo purposes, simulating data
  const levels: Array<"INFO" | "WARN" | "ERROR" | "DEBUG" | "CRITICAL"> = ["INFO", "WARN", "ERROR", "DEBUG", "CRITICAL"];
  const eventTypes = [
    "new_task_created",
    "gemini_api_call_sent",
    "evolution_api_send_text",
    "webhook_received_message",
    "task_status_updated"
  ];
  
  return {
    data: Array(limit).fill(null).map((_, i) => ({
      id: `log_${i + 1 + (page - 1) * limit}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      level: levels[i % levels.length],
      event_type: eventTypes[i % eventTypes.length],
      message: `Log message ${i + 1 + (page - 1) * limit}`,
      related_task_id: i % 3 === 0 ? `sim_task_${i % 10 + 1}` : null,
      details: { some_key: `some_value_${i}`, another_key: i }
    })),
    total: 250,
    page,
    limit
  };
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/system-logs?${params.toString()}`)
  //  .then(handleResponse);
};

// Agent Settings API
export const getAgentSettings = async (): Promise<AgentSetting[]> => {
  // For demo purposes, simulating data
  return [
    // General Settings
    {
      key: "max_retry_attempts_initial_contact",
      value: 3,
      description: "Número máximo de tentativas de contato inicial",
      type: "number",
      category: "general"
    },
    {
      key: "delay_initial_contact_min_seconds",
      value: 60,
      description: "Tempo mínimo (segundos) de espera entre tentativas de contato inicial",
      type: "number",
      category: "general"
    },
    {
      key: "delay_initial_contact_max_seconds",
      value: 300,
      description: "Tempo máximo (segundos) de espera entre tentativas de contato inicial",
      type: "number",
      category: "general"
    },
    {
      key: "timeout_supplier_response_hours",
      value: 4,
      description: "Tempo (horas) até enviar lembrete para fornecedor não responsivo",
      type: "number",
      category: "general"
    },
    {
      key: "timeout_supplier_final_hours",
      value: 24,
      description: "Tempo (horas) até finalizar tarefa por não resposta do fornecedor",
      type: "number",
      category: "general"
    },
    {
      key: "timeout_system_quote_response_hours",
      value: 48,
      description: "Tempo (horas) até finalizar tarefa por não atualização do sistema",
      type: "number",
      category: "general"
    },
    
    // Prompt Settings
    {
      key: "prompt_initial_greeting",
      value: "Olá! Sou o assistente da Oficina Brasil e gostaria de solicitar cotação para algumas peças de um {marca_veiculo} {modelo_veiculo} {ano_veiculo}.",
      description: "Mensagem inicial de saudação ao fornecedor",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_interpret_supplier_response",
      value: "Analise a seguinte resposta de um fornecedor para uma solicitação de cotação de peças para um {marca_veiculo} {modelo_veiculo} {ano_veiculo}: \"{response}\". O fornecedor demonstrou interesse em fornecer cotação para as peças? Responda com 'positivo', 'negativo' ou 'não está claro'.",
      description: "Prompt para interpretação da resposta do fornecedor pelo Gemini",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_clarify_unclear_response",
      value: "Não ficou claro se você pode fornecer cotação para estas peças. Poderia por favor confirmar se tem interesse em enviar os valores?",
      description: "Mensagem para esclarecer resposta não clara do fornecedor",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_send_parts_list",
      value: "Ótimo! Segue a lista das peças que precisamos:\n\n{parts_list}\n\nAguardo sua cotação. Obrigado!",
      description: "Mensagem para envio da lista de peças",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_negative_response_thanks",
      value: "Entendo. Agradeço pelo retorno mesmo assim. Tenha um ótimo dia!",
      description: "Agradecimento para resposta negativa do fornecedor",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_timeout_reminder",
      value: "Olá novamente! Gostaria de saber se ainda tem interesse em fornecer cotação para as peças que solicitei anteriormente. Aguardo seu retorno.",
      description: "Mensagem de lembrete após timeout inicial",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_unsupported_media_type",
      value: "Desculpe, mas não consigo processar este tipo de mídia. Poderia por favor enviar sua resposta em formato de texto?",
      description: "Mensagem para tipo de mídia não suportado",
      type: "textarea",
      category: "prompts"
    },
    {
      key: "prompt_out_of_context_message",
      value: "Desculpe, não compreendi sua mensagem no contexto da cotação que estamos tratando. Poderia esclarecer?",
      description: "Mensagem para resposta fora de contexto",
      type: "textarea",
      category: "prompts"
    },
    
    // API Settings
    {
      key: "gemini_api_key",
      value: "**************",
      description: "Chave de API para o serviço Gemini",
      type: "password",
      category: "api"
    },
    {
      key: "webhook_base_url_agent",
      value: "https://api.exemplo.com/webhook/",
      description: "URL base para webhooks do agente",
      type: "text",
      category: "api"
    }
  ];
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/agent-settings`)
  //  .then(handleResponse);
};

export const updateAgentSettings = async (settings: Partial<Record<string, string | number>>) => {
  // For demo purposes, just returning success
  return { success: true };
  
  // Real implementation would be:
  // return fetch(`${API_BASE_URL}/agent-settings`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(settings),
  // }).then(handleResponse);
};
