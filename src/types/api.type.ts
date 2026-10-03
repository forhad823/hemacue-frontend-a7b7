export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  totalPage?: number;
}

export interface ApiError {
  path: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta?: ApiMeta;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiError[];
  stack?: string;
}
