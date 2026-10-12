// TypeScript declarations for MeeDoo AI SDK

export declare class MeeDooClient {
  constructor(apiKey: string, baseURL?: string, timeout?: number, maxRetries?: number);
  chat: { completions: ChatCompletions };
  models: Models;
  usage: Usage;
  judge: Judge;
  config(): Promise<any>;
  health(): Promise<any>;
}

export declare class ChatCompletions {
  create(params: ChatCompletionParams): Promise<any>;
}

export declare class Models {
  list(): Promise<{ data: any[] }>;
}

export declare class Usage {
  credits(): Promise<{ credit_balance: number; token_balance: number }>;
  stats(): Promise<any>;
}

export declare class Judge {
  status(): Promise<any>;
  decide(state: any, questions: any, model?: string): Promise<any>;
  noul(state: any, instructions: string, criteria?: any): Promise<{ probability: number }>;
  choice(state: any, instructions: string, criteria: any): Promise<any>;
  score(state: any, instructions: string, levels: any[]): Promise<any>;
  shouldSearchWeb(userMessage: string): Promise<{ should_search: boolean }>;
  detectInjection(userMessage: string): Promise<any>;
  moderate(text: string): Promise<any>;
  detectSpam(message: string, userHistory?: string): Promise<any>;
  validateResponse(userMessage: string, llmResponse: string, sources?: string): Promise<any>;
  validateSchema(jsonOutput: string, schemaDescription: string): Promise<any>;
  filterMemory(information: string, conversationContext?: string): Promise<any>;
  isPrayerTimes(userMessage: string): Promise<{ is_prayer_times: boolean }>;
  classifyTicket(subject: string, body: string): Promise<any>;
  classifyAlert(eventType: string, eventDetails: string): Promise<any>;
  scoreSatisfaction(userMessages: string[], assistantMessages: string[]): Promise<any>;
  sentiment(): Promise<any>;
}

export interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  min_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  reasoning_effort?: string;
  seed?: any;
  stop?: string[];
  response_format?: any;
  think?: boolean;
  features?: { web_search?: boolean; memory?: boolean; code_interpreter?: boolean; image_generation?: boolean; voice?: boolean };
  tool_ids?: string[];
  tools?: any[];
  tool_choice?: string;
  params?: { function_calling?: string; system?: string; custom_params?: any; stream_response?: boolean; stream_delta_chunk_size?: number; reasoning_tags?: any[] };
  chat_id?: string;
  id?: string;
  parent_id?: string;
  session_id?: string;
  files?: any[];
  skill_ids?: string[];
  variables?: any;
  filter_ids?: string[];
  background_tasks?: any;
  use_credits?: boolean;
  metadata?: any;
}

export declare class MeeDooError extends Error { statusCode: number; body: any; }
export declare class AuthenticationError extends MeeDooError {}
export declare class RateLimitError extends MeeDooError {}
export declare class InsufficientCreditsError extends MeeDooError {}
export declare class ModelNotFoundError extends MeeDooError {}
export declare class APIError extends MeeDooError {}