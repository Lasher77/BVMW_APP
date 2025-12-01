import { useQuery } from '@tanstack/react-query';
import { getNews, getNewsArticle } from '../api/client';
import type { NewsArticle, NewsSummary } from '../api/types';

export function useNews(limit = 10) {
  return useQuery<{ news: NewsSummary[] }, Error>({
    queryKey: ['news', limit],
    queryFn: () => getNews({ limit }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewsArticle(id: string) {
  return useQuery<{ article: NewsArticle }, Error>({
    queryKey: ['news-article', id],
    queryFn: () => getNewsArticle(id),
    enabled: Boolean(id),
  });
}
