// TypeScript declarations for MeeDoo AI SDK

export declare class MeeDooClient {
  constructor(apiKey: string, baseURL?: string, timeout?: number, maxRetries?: number);
  chat: { completions: ChatCompletions };
  models: Models;
  usage: Usage;
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
  features?: Record<string, boolean>;
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