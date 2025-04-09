import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SelectChangeEvent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Book } from './app';
// import { API_BASE_URL } from './constant';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [responseTime, setResponseTime] = useState<number | null>(null);


  const fetchBooksFromServer = async (
    query: string,
    page: number,
    limit: number
  ): Promise<{ items: Book[]; totalItems: number; responseTime: number }> => {
    const start = performance.now();
    const res = await fetch(
      `http://localhost:3000/books?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    const end = performance.now(); // capture end time
    const elapsed = end - start;
  
    if (!res.ok) {
      throw new Error('Failed to fetch books');
    }
  
    const data = await res.json();
    return {
      items: data.items ?? [],
      totalItems: data.totalItems ?? 0,
      responseTime: elapsed,
    };
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1); 
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(Number(event.target.value));
    setPage(1); // reset to page 1 on limit change
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const fetchBooks = useCallback(async () => {
    if (!query.trim()) {
      setBooks([]);
      setTotalItems(0);
      return;
    }

    try {
      const res = await fetchBooksFromServer(query, page, limit);
      setBooks(res.items);
      setTotalItems(res.totalItems);
      setResponseTime(Math.round(res.responseTime));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }, [query, page, limit]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / limit));
  }, [totalItems, limit]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book Finder
      </Typography>
  
      <TextField
        label="Search books"
        fullWidth
        margin="normal"
        value={query}
        onChange={handleSearchChange}
      />
  
      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <FormControl>
          <InputLabel id="limit-label">Results per page</InputLabel>
          <Select
            labelId="limit-label"
            value={limit}
            onChange={handleLimitChange}
            label="Results per page"
            size="small"
          >
            {[5, 10, 20].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
  
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        )}
      </Box>
  
      {books.length === 0 && query && (
        <Typography variant="body1">No books found.</Typography>
      )}
      {totalItems > 0 && (
  <Typography variant="subtitle1" sx={{ my: 2 }}>
    Showing {books.length} of {totalItems} result{totalItems !== 1 && 's'}
  </Typography>
)}
  
      <Box mt={2}>
        {books.map((book) => {
          const { title, authors = ['Unknown author'], description } = book.volumeInfo;
          console.log("desc",description);
          return (
            <Accordion key={book.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1">
                  {authors.join(', ')} - <strong>{title}</strong>
                </Typography>
              </AccordionSummary>
              {description && (
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </AccordionDetails>
              )}
            </Accordion>
          );
        })}
      </Box>
      {responseTime !== null && (
  <Typography variant="subtitle2" mt={1} color="text.secondary">
    Server response time: {responseTime} ms
  </Typography>
)}
    </Container>
  );
  
};

export default App;
