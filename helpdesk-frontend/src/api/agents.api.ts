import api from './axios';
import { unwrapData } from './api-response';

export type AgentStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export interface AgentDepartment {
  department: {
    id: string;
    name: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  status: AgentStatus;
  isOnline: boolean;

  createdAt: string;
  updatedAt: string;

  agentDepartments: AgentDepartment[];
}

interface AgentsResponse {
  total: number;
  agents: Agent[];
}

export interface CreateAgentRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAgentRequest {
  name?: string;
  email?: string;
  status?: AgentStatus;
}

export async function getAgents(): Promise<Agent[]> {
  const response =
    await api.get<AgentsResponse>('/agents');

  return Array.isArray(response.data.agents)
    ? response.data.agents
    : [];
}

export async function getAgentById(
  id: string,
): Promise<Agent> {
  const response =
    await api.get(
      `/agents/${id}`,
    );

  return (
    response.data.agent ??
    response.data
  ) as Agent;
}

export async function createAgent(
  data: CreateAgentRequest,
): Promise<Agent> {
  const response =
    await api.post(
      '/agents',
      data,
    );

  return (
    response.data.agent ??
    response.data
  ) as Agent;
}

export async function updateAgent(
  id: string,
  data: UpdateAgentRequest,
): Promise<Agent> {
  const response =
    await api.patch(
      `/agents/${id}`,
      data,
    );

  return (
    response.data.agent ??
    response.data
  ) as Agent;
}

export async function deleteAgent(
  id: string,
): Promise<void> {
  await api.delete(
    `/agents/${id}`,
  );
}