import api from './axios';
import { unwrapData } from './api-response';

export interface CannedResponse {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCannedResponseRequest {
    title: string;
    content: string;
}

export interface UpdateCannedResponseRequest {
    title?: string;
    content?: string;
}

/**
 * GET /canned-responses
 */
export async function getCannedResponses(): Promise<CannedResponse[]> {
    const response = await api.get('/canned-responses');

    const data = unwrapData<CannedResponse[]>(response.data);

    return Array.isArray(data) ? data : [];
}

/**
 * GET /canned-responses/:id
 */
export async function getCannedResponseById(
    id: string,
): Promise<CannedResponse> {
    const response = await api.get(`/canned-responses/${id}`);

    return unwrapData<CannedResponse>(response.data);
}

/**
 * POST /canned-responses
 */
export async function createCannedResponse(
    data: CreateCannedResponseRequest,
): Promise<CannedResponse> {
    const response = await api.post('/canned-responses', data);

    return unwrapData<CannedResponse>(response.data);
}

/**
 * PATCH /canned-responses/:id
 */
export async function updateCannedResponse(
    id: string,
    data: UpdateCannedResponseRequest,
): Promise<CannedResponse> {
    const response = await api.patch(`/canned-responses/${id}`, data);

    return unwrapData<CannedResponse>(response.data);
}

/**
 * DELETE /canned-responses/:id
 */
export async function deleteCannedResponse(
    id: string,
): Promise<void> {
    await api.delete(`/canned-responses/${id}`);
}