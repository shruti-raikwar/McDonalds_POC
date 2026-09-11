import { apiClient } from '../client/apiClient';
import { BRIEF_ENDPOINTS } from '../endpoints/briefs.endpoints';
import { PaginatedResponse, PaginationParams } from '../types/api.types';
import { BriefData } from '../../constants/app.constants';

export interface GetBriefsParams extends PaginationParams {
    status?: string;
}

export const briefService = {
    getAll: async (params?: GetBriefsParams): Promise<PaginatedResponse<BriefData>> => {
        const response = await apiClient.get(BRIEF_ENDPOINTS.list, { params });
        return response.data;
    },

    getById: async (briefId: string): Promise<BriefData> => {
        const response = await apiClient.get(BRIEF_ENDPOINTS.details(briefId));
        return response.data;
    },

    create: async (payload: Partial<BriefData>): Promise<BriefData> => {
        const response = await apiClient.post(BRIEF_ENDPOINTS.create, payload);
        return response.data;
    },

    update: async (briefId: string, payload: Partial<BriefData>): Promise<BriefData> => {
        const response = await apiClient.put(BRIEF_ENDPOINTS.update(briefId), payload);
        return response.data;
    },
    
    delete: async (briefId: string): Promise<void> => {
        await apiClient.delete(BRIEF_ENDPOINTS.delete(briefId));
    }
};
