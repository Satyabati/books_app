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
import { fetchBooksFromServer } from './service.tsx';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [mostFrequentAuthor, setMostFrequentAuthor] = useState<string | null>(null);
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);
  const [latestDate, setLatestDate] = useState<Date | null>(null);



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
      const authorCount: Record<string, number> = {};
      const res = await fetchBooksFromServer(query, page, limit);

        const authors = res.allAuthors ?? ['Unknown author'];
        authors.forEach((author) => {
          authorCount[author] = (authorCount[author] || 0) + 1;
        });

      const mostCommonAuthor = Object.entries(authorCount).reduce(
        (max, current) => (current[1] > max[1] ? current : max),
        ['', 0]
      )[0];

const publicationDates = books
  .map(book => book.volumeInfo.publishedDate)
  .filter((date): date is string => typeof date === 'string') // ensures date is a string
  .map(dateStr => new Date(dateStr))
  .filter(date => !isNaN(date.getTime())); // removes invalid dates

const earliestDate = publicationDates.length
  ? new Date(Math.min(...publicationDates.map(d => d.getTime())))
  : null;

const latestDate = publicationDates.length
  ? new Date(Math.max(...publicationDates.map(d => d.getTime())))
  : null;
  setEarliestDate(earliestDate);
  setLatestDate(latestDate);
      setBooks(res.items);
      setTotalItems(res.totalItems);
      setResponseTime(Math.round(res.responseTime));
      setMostFrequentAuthor(mostCommonAuthor || null);
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
{earliestDate && latestDate && (
  <Typography variant="body2" sx={{ mb: 2 }}>
    📚 Published between <strong>{earliestDate.toDateString()}</strong> and <strong>{latestDate.toDateString()}</strong>
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
              {description ? (
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </AccordionDetails>
              ):(
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                   No description present
                  </Typography>
                </AccordionDetails>
              )}
            </Accordion>
          );
        })}
      </Box>
      {mostFrequentAuthor && (
  <Typography variant="subtitle1" mt={2}>
    Most common author in results: <strong>{mostFrequentAuthor}</strong>
  </Typography>
)}
      {responseTime !== null && (
  <Typography variant="subtitle2" mt={1} color="text.secondary">
    Server response time: {responseTime} ms
  </Typography>
)}
    </Container>
  );
  
};

export default App;
