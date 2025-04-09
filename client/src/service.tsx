// src/api.ts
import { API_BASE_URL } from './constant';
import { Book } from './app';

export const fetchBooksFromServer = async (
  query: string,
  page: number,
  limit: number
): Promise<Book[]> => {
  const res = await fetch(
    `${API_BASE_URL}/books?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }

  const data = await res.json();
  return data?.items ?? [];
};
