'use client';

import useSWR from 'swr';
import MediaDisplay from '@/components/MediaDisplay';
import Pagination from '@/components/Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import FilterSection from '@/components/FilterSection';
import React, { useMemo } from 'react';
import { Suspense } from 'react';
import type { PaginatedResponse, TMDBMovieSummary, Language, Genre } from '@/types/tmdb';

// create helper function to fetch JSON data from URL ( used with SWR to automatically fetch and cache data)
const fetcher = <T,>(url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Failed To Fetch Data');
    }
    return res.json() as Promise<T>;
  });

// -filter section- step 1 : define fixed year ranges for filtering by release date
const yearRanges: Record<string, { gte?: string; lte?: string }> = {
  2025: { gte: '2025-01-01', lte: '2025-12-31' },
  2024: { gte: '2024-01-01', lte: '2024-12-31' },
  '2020-now': { gte: '2020-01-01' },
  '2010-2019': { gte: '2010-01-01', lte: '2019-12-31' },
  '2000-2009': { gte: '2000-01-01', lte: '2009-12-31' },
  '1990-1999': { gte: '1990-01-01', lte: '1999-12-31' },
};

function MoviesPageContent() {
  const router = useRouter(); // to change the page url when the pagination happens
  const pathname = usePathname(); // to get the current page path
  const searchParams = useSearchParams(); // to read the current url query (like: ?page=2)
  const [page, setPage] = useState(1); // to store the current page number

  // get the current page number from the url and update the page stats (defaults to 1 if missing or invalid)
  useEffect(() => {
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    setPage(isNaN(pageParam) || pageParam < 1 ? 1 : pageParam);
  }, [searchParams]);

  // -filter section- step 2 : extract filter values from the URL (default to "all")
  const genre = searchParams.get('genre') || 'all';
  const year = searchParams.get('year') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const language = searchParams.get('language') || 'all';
  const sortBy = searchParams.get('sortBy') || 'popularity.desc';
  const query = searchParams.get('query') || '';

  // -filter section- step 3 : convert the selected year to a date range object for filtering
  const yearRange = useMemo<{ gte?: string; lte?: string }>(() => yearRanges[year] ?? {}, [year]);

  // -filter section- step 4 : modify the API URL to support both discover modes based on query presence
  const baseUrl = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.NEXT_PUBLIC_TMDB_API_KEY
      }&query=${encodeURIComponent(query)}`
    : `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

  // -filter section- step 5 : apply filter parameters to API URL in discover mode
  const apiUrl = new URL(baseUrl);
  apiUrl.searchParams.set('page', String(page));
  if (!query) {
    if (genre !== 'all') apiUrl.searchParams.set('with_genres', genre);
    if (language !== 'all')
      apiUrl.searchParams.set('with_original_language', language);
    if (rating !== 'all') apiUrl.searchParams.set('vote_average.gte', rating);
    if (sortBy) apiUrl.searchParams.set('sort_by', sortBy);
    if (yearRange.gte)
      apiUrl.searchParams.set('primary_release_date.gte', yearRange.gte);
    if (yearRange.lte)
      apiUrl.searchParams.set('primary_release_date.lte', yearRange.lte);
  }

  // use SWR to fetch and cache the movie data
  const { data: moviesData } = useSWR<PaginatedResponse<TMDBMovieSummary>>(apiUrl.toString(), fetcher);

  // -filter section- step 6 : fetch genres and languages for filter dropdown options
  const { data: languagesData } = useSWR<Language[]>(
    `https://api.themoviedb.org/3/configuration/languages?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    fetcher
  );

  const { data: genresData } = useSWR<{ genres: Genre[] }>(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
    fetcher
  );

  // -filter section- step 7 : add a helper function manually filter movies in search mode (because TMDB search endpoint doesn't support filter params)
  function filterMovies(
    movies: TMDBMovieSummary[],
    { genre, yearRange, rating, language }: {
      genre: string;
      yearRange: { gte?: string; lte?: string };
      rating: string;
      language: string;
    }
  ) {
    return movies.filter((movie) => {
      const date = movie.release_date ? new Date(movie.release_date) : null;
      const gteOk = !yearRange.gte || (date && date >= new Date(yearRange.gte));
      const lteOk = !yearRange.lte || (date && date <= new Date(yearRange.lte));
      return (
        (genre === 'all' || movie.genre_ids?.includes(Number(genre))) &&
        (language === 'all' || movie.original_language === language) &&
        (rating === 'all' || (movie.vote_average ?? 0) >= Number(rating)) &&
        gteOk &&
        lteOk
      );
    });
  }

  // -filter section- step 8 : apply manual filtering in search mode using useMemo to optimize performance
  const filteredMovies: TMDBMovieSummary[] = useMemo(() => {
    if (!moviesData?.results) return [];
    return query
      ? filterMovies(moviesData.results, { genre, yearRange, rating, language })
      : moviesData.results;
  }, [moviesData, query, genre, yearRange, rating, language]);

  // get total number of pages from the API response, and fallback to 1 if not available
  const totalPages = moviesData?.total_pages || 1;

  // -filter section- step 9 : extract genres and languages for filterSection component, default to empty array if undefined
  const genres: Genre[] = genresData?.genres || [];
  const languages: Language[] = languagesData || [];

  // update the url with the new page number when navigate to a different page
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // -filter section- step 10 : update the loading state to include genres and languages data
  // if the data is still loading show a loading message
  if (!moviesData || !genresData || !languagesData) {
    return <div>Loading...</div>;
  }

  // if the data is available, render the movie list
  return (
    <div className='container mx-auto px-4'>
      {/* -filter section- step 11 : add filterSection component to render filter UI with genres and languages */}
      <FilterSection
        genres={genres}
        languages={languages}
        placeholder='Search Movies'
      />

      {/* use filteredMovies instead of movies in mediaDisplay component */}
      <MediaDisplay items={filteredMovies} />

      {/* show the pagination only if there are enough results - update pagination to reflect filteredMovies length */}
      {filteredMovies.length >= 15 && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MoviesPageContent />
    </Suspense>
  );
}
