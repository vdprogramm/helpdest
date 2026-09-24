export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export function unwrapData<T>(
  response: any,
): T {
  if (!response) return response;

  if (Array.isArray(response)) {
    return response as T;
  }

  if (typeof response === 'object') {
    // Check common wrapper keys
    const keys = ['data', 'items', 'result', 'tickets', 'agents', 'customers', 'conversations', 'departments'];
    for (const key of keys) {
      if (key in response && Array.isArray(response[key])) {
        return response[key] as T;
      }
    }
    
    // If it's a single object wrapper
    if ('data' in response) return response.data;
    if ('result' in response) return response.result;
  }

  return response;
}
