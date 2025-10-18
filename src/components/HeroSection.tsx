import HeroSlider from "./HeroSlider";
import type { TMDBDetailedMovie, TMDBMovieSummary } from "@/types/tmdb";

// fetch the trending movies from TMDB API including extra details for each movie like poster, backdrop, title, overview, rating, release date, etc.
async function fetchTrendingMovies(): Promise<TMDBDetailedMovie[]> {
  // get the API key
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // fetch past week trending movies
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
  );

  // if the request fails return an empty list
  if (!res.ok) return [] as TMDBDetailedMovie[];

  // convert the response to JSON and display only 3 movies from the results
  const data = (await res.json()) as { results?: TMDBMovieSummary[] };
  const movies: TMDBMovieSummary[] = data.results ? data.results.slice(0, 3) : [];

  // fetch extra details for each movie
  const detailedMovies: TMDBDetailedMovie[] = await Promise.all(
    movies.map(async (movie): Promise<TMDBDetailedMovie> => {
      if (movie.media_type === 'movie') {
        const detailRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`
        );

        // if details are fetched successfully add them to the movie
        if (detailRes.ok) {
          const detailData = (await detailRes.json()) as TMDBDetailedMovie;
          return {
            ...movie,
            genres: detailData.genres,
            runtime: detailData.runtime,
          } as TMDBDetailedMovie;
        }
      }

      // if there is no extra dat fetched return the movie as is
      return movie as TMDBDetailedMovie;
    })
  );

  // return the final list of movies with extra details
  return detailedMovies;
}

export default async function HeroSection() {
  const movies = await fetchTrendingMovies();

  return <HeroSlider movies={movies} />;
}
