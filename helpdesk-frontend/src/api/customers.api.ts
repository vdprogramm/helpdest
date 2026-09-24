import api from './axios';
import { unwrapData } from './api-response';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await api.get('/customers');

  const data = unwrapData<Customer[]>(
    response.data,
  );

  return Array.isArray(data) ? data : [];
}

export async function getCustomerById(
  id: string,
): Promise<Customer> {
  const response = await api.get(
    `/customers/${id}`,
  );

  return unwrapData<Customer>(
    response.data,
  );
}

export async function createCustomer(
  data: CreateCustomerRequest,
): Promise<Customer> {
  const response = await api.post(
    '/customers',
    data,
  );

  return unwrapData<Customer>(
    response.data,
  );
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest,
): Promise<Customer> {
  const response = await api.patch(
    `/customers/${id}`,
    data,
  );

  return unwrapData<Customer>(
    response.data,
  );
}

export async function deleteCustomer(
  id: string,
): Promise<void> {
  await api.delete(`/customers/${id}`);
}