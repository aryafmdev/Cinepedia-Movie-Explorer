import Card from '@/components/Card';
import type { TMDBMovieSummary } from '@/types/tmdb';

// fetch the top rated movies from TMDB
async function fetchTopRatedMovies(): Promise<TMDBMovieSummary[]> {
  // get the api key
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // make api request to get the top rated movies
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`
  );

  // return empty array if request failed
  if (!res.ok) return [];

  // convert the response JSON and display only 5 movies
  const data = await res.json();
  const movies: TMDBMovieSummary[] = data.results ? data.results.slice(0, 7) : [];

  // return the movies list
  return movies;
}
export default async function TopRatedMovies() {
  // fetch the top rated movies
  const movies = await fetchTopRatedMovies();

  return (
    <section className='py-8 px-4 sm:px-8 md:px-20 bg-black text-white'>
      <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-4'>
        Top Rated Movies
      </h2>

      <div className='flex overflow-x-auto gap-14 pb-4'>
        {movies.length > 0 ? (
          movies.map((movie) => <Card key={movie.id} media={movie} />)
        ) : (
          <p className='text-gray-400'>No Top Rated Movies Found</p>
        )}
      </div>
    </section>
  );
}
