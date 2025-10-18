export type MediaType = 'movie' | 'tv';

export interface TMDBBase {
  id: number;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  original_language?: string;
  genre_ids?: number[];
  media_type?: MediaType;
}

export interface TMDBMovieSummary extends TMDBBase {
  title?: string;
  release_date?: string;
}

export interface TMDBTvSummary extends TMDBBase {
  name?: string;
  first_air_date?: string;
}

export type TMDBItem = TMDBMovieSummary | TMDBTvSummary;

export interface Genre {
  id: number;
  name: string;
}

export interface Language {
  english_name: string;
  iso_639_1: string;
  name?: string;
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}

export interface TMDBVideosResponse {
  id?: number;
  results: TMDBVideo[];
}

export interface TMDBCredits {
  cast: { name: string; profile_path?: string | null }[];
  crew?: { name: string; job?: string }[];
}

export interface TMDBDetailedMovie extends TMDBMovieSummary {
  genres?: Genre[];
  runtime?: number;
}

export interface TMDBDetailedTv extends TMDBTvSummary {
  genres?: Genre[];
  number_of_seasons?: number;
  created_by?: { name: string; profile_path?: string | null }[];
}

export interface TMDBRecommendations {
  results: TMDBItem[];
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
