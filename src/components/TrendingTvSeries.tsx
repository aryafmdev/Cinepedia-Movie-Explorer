import Card from '@/components/Card';
import type { TMDBTvSummary } from '@/types/tmdb';

// fetch the trending tv series of the week from TMDB
async function fetchTrendingTvSeries(): Promise<TMDBTvSummary[]> {
  // get the api key
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // make api request to get the trending tv series of the week
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`
  );

  // return empty array if request failed
  if (!res.ok) return [];

  // convert the response JSON and display only 7 tv series
  const data = await res.json();
  const tvSeries: TMDBTvSummary[] = data.results ? data.results.slice(0, 7) : [];

  // return the tv series list
  return tvSeries;
}
export default async function TrendingTvSeries() {
  // fetch the trending tv series
  const tvSeries = await fetchTrendingTvSeries();

  return (
    <section className='py-8 px-4 sm:px-8 md:px-20 bg-black text-white'>
      <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-4'>
        Trending TV Series
      </h2>

      <div className='flex overflow-x-auto gap-14 pb-4'>
        {tvSeries.length > 0 ? (
          tvSeries.map((item) => <Card key={item.id} media={item} />)
        ) : (
          <p className='text-gray-400'>No Trending TV Series Found</p>
        )}
      </div>
    </section>
  );
}
