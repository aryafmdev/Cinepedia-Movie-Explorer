import HeroSection from '@/components/HeroSection';
import TrendingMovies from '@/components/TrendingMovies';
import TopRatedMovies from '@/components/TopRatedMovies';
import TrendingTvSeries from '@/components/TrendingTvSeries';
import TopRatedTvSeries from '@/components/TopRatedTvSeries';

export default function Home() {
  return (
    <div className='bg-black min-h-screen text-white'>
      <HeroSection />
      <TrendingMovies />
      <TopRatedMovies />
      <TrendingTvSeries />
      <TopRatedTvSeries />
    </div>
  );
}
