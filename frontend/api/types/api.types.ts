export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiError {
    status?: number;
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
    originalError?: unknown;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
