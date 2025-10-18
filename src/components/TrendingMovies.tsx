import Card from '@/components/Card';
import type { TMDBMovieSummary } from '@/types/tmdb';

// fetch the trending movies of the week from TMDB
async function fetchTrendingMovies(): Promise<TMDBMovieSummary[]> {
  // get the api key
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // make api request to get the trending movies of the week
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
  );

  // return empty array if request failed
  if (!res.ok) return [];

  // convert the response JSON and display only 5 movies starting from index 3
  const data = await res.json();
  const movies: TMDBMovieSummary[] = data.results ? data.results.slice(3, 18) : [];

  // return the movies list
  return movies;
}
export default async function TrendingMovies() {
  // fetch the trending movies
  const movies = await fetchTrendingMovies();

  return (
    <section className='py-8 px-4 sm:px-8 md:px-20 bg-black text-white'>
      <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-4'>
        Trending Movies
      </h2>

      <div className='flex overflow-x-auto gap-14 pb-4'>
        {movies.length > 0 ? (
          movies.map((movie) => <Card key={movie.id} media={movie} />)
        ) : (
          <p className='text-gray-400'>No Trending Movies Found</p>
        )}
      </div>
    </section>
  );
}
