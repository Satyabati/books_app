import { API_BASE_URL } from './constant.ts';
import { Book } from './app';

export const  fetchBooksFromServer = async (
    query: string,
    page: number,
    limit: number
  ): Promise<{ items: Book[]; totalItems: number; responseTime: number,allAuthors:string[] }> => {
    const start = performance.now();
    const res = await fetch(
      `${API_BASE_URL}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    const end = performance.now(); // capture end time
    const elapsed = end - start;
  
    if (!res.ok) {
      throw new Error('Failed to fetch books');
    }
  
    const data = await res.json();
    return {
      items: data?.items ?? [],
      totalItems: data?.totalItems ?? 0,
      responseTime: elapsed,
      allAuthors: data?.allAuthors??[]
    };
  };
