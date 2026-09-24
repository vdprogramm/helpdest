import api from './axios';
import { unwrapData } from './api-response';

export interface DepartmentAgent {
  id: string;
  name: string;
  email: string;
  role: 'AGENT';
  status: 'ACTIVE' | 'INACTIVE';
  isOnline: boolean;
}

export interface AgentDepartment {
  agent: DepartmentAgent;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;

  _count?: {
    agentDepartments: number;
    tickets: number;
  };

  agentDepartments?: {
    agent: {
      id: string;
      name: string;
      email: string;
      role: 'AGENT';
      status: 'ACTIVE' | 'INACTIVE';
      isOnline: boolean;
    };
  }[];
}

interface DepartmentsResponse {
  total: number;
  departments: Department[];
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
}

export async function getDepartments(): Promise<Department[]> {
  const response =
    await api.get<DepartmentsResponse>('/departments');

  return Array.isArray(response.data.departments)
    ? response.data.departments
    : [];
}

export async function getPublicDepartments(): Promise<Department[]> {
  const response =
    await api.get('/public/departments');

  const data =
    unwrapData<Department[]>(
      response.data,
    );

  return Array.isArray(data)
    ? data
    : [];
}

export async function getDepartmentById(
  id: string,
): Promise<Department> {
  const response =
    await api.get(
      `/departments/${id}`,
    );

  return unwrapData<Department>(
    response.data,
  );
}

export async function createDepartment(
  data: CreateDepartmentRequest,
): Promise<Department> {
  const response =
    await api.post(
      '/departments',
      data,
    );

  return unwrapData<Department>(
    response.data,
  );
}

export async function updateDepartment(
  id: string,
  data: UpdateDepartmentRequest,
): Promise<Department> {
  const response =
    await api.patch(
      `/departments/${id}`,
      data,
    );

  return unwrapData<Department>(
    response.data,
  );
}

export async function deleteDepartment(
  id: string,
): Promise<void> {
  await api.delete(
    `/departments/${id}`,
  );
}

export async function addAgentToDepartment(
  departmentId: string,
  agentId: string,
): Promise<void> {
  await api.post(
    `/departments/${departmentId}/agents`,
    { agentId },
  );
}

export async function removeAgentFromDepartment(
  departmentId: string,
  agentId: string,
): Promise<void> {
  await api.delete(
    `/departments/${departmentId}/agents/${agentId}`,
  );
}