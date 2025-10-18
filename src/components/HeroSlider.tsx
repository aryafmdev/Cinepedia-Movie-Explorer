'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectFade, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Link from 'next/link';
import useSWR from 'swr';
import TrailerModal from './TrailerModal';
import type { TMDBItem, TMDBVideosResponse, TMDBVideo, MediaType, TMDBMovieSummary, TMDBTvSummary } from '@/types/tmdb';
import type { Swiper as SwiperInstance } from 'swiper';

// fetch data from the url and return it as JSON and throw error if the request fails
const fetcher = <T,>(url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch trailer');
    }
    return res.json() as Promise<T>;
  });

type MediaWithExtras = TMDBItem & {
  genres?: { id: number; name: string }[];
  runtime?: number;
};

export default function HeroSlider({ movies = [] }: { movies?: MediaWithExtras[] }) {
  const [currentSlide, setCurrentSlide] = useState(0); // state to track the current slide index
  const [swiperInstance, setSwiperInstance] = useState<SwiperInstance | null>(null); // store swiper instance for controlling slide navigation
  const [isModalOpen, setIsModalOpen] = useState(false); // state to show or hide the trailer modal
  const [selectedMedia, setSelectedMedia] = useState<MediaWithExtras | null>(null); // state to store the selected media to display the trailer

  // create a function to get the media title
  const isMovie = (item: TMDBItem): item is TMDBMovieSummary => item.media_type === 'movie';
  const isTv = (item: TMDBItem): item is TMDBTvSummary => item.media_type === 'tv';
  const getMediaTitle = (media: TMDBItem): string => {
    if (isMovie(media)) {
      return media.title || 'Untitled';
    }
    return media.name || 'Untitled';
  };

  // create a function to get the movie genres
  const getGenres = (media: MediaWithExtras): string => {
    if (
      media.media_type === 'movie' &&
      media.genres &&
      media.genres.length > 0
    ) {
      return media.genres.map((g) => g.name).join(', ');
    }
    return '';
  };

  // create a function to format movie runtime into hours and minutes
  const formatDuration = (media: MediaWithExtras): string => {
    if (media.media_type === 'movie' && media.runtime) {
      const h = Math.floor(media.runtime / 60);
      const m = media.runtime % 60;
      return `${h}h ${m}m`;
    }
    return '';
  };

  // handle navigation button clicks to switch to specified slide and update current slide state
  const handleButtonClick = (index: number) => {
    if (swiperInstance) {
      swiperInstance.slideToLoop(index);
      setCurrentSlide(index);
    }
  };

  // fetch trailer videos for the selected media using SWR
  // fallback media_type to 'movie' to handle data sources that don't include media_type
  const mediaType: MediaType = selectedMedia?.media_type ?? 'movie';
  const { data: trailerData } = useSWR<TMDBVideosResponse>(
    selectedMedia
      ? `https://api.themoviedb.org/3/${mediaType}/${selectedMedia.id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
      : null,
    fetcher
  );

  // find the first youtube trailer form the fetched videos
  const trailer: TMDBVideo | undefined = trailerData?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );

  // build the youtube embed URL for the trailer if it founds
  const trailerUrl = trailer 
    ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&playsinline=1&mute=1&controls=1&rel=0&modestbranding=1`
    : null;

  // open the trailer modal and set the selected media to display the trailer
  const openModal = (media: MediaWithExtras) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  // close the trailer modal and clear the selected media
  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <section className='relative min-h-[360px] sm:min-h-[480px] md:min-h-[720px] w-full'>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect='fade'
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={movies.length > 1}
        onSlideChange={(swiper: SwiperInstance) => setCurrentSlide(swiper.realIndex)}
        onSwiper={(swiper: SwiperInstance) => setSwiperInstance(swiper)}
        className='w-full h-full'
      >
        {/* map through movies to create a slide for each movie */}
        {movies.map((media) => (
          <SwiperSlide key={media.id}>
            <div className='relative w-full h-[360px] sm:h-[480px] md:h-[720px]'>
              <div
                className='absolute inset-0 bg-cover bg-center'
                style={{
                  backgroundImage: media.backdrop_path
                    ? `url(https://image.tmdb.org/t/p/w1280${media.backdrop_path})`
                    : `url(/default-poster.jpg)`,
                }}
              ></div>
              <div className='absolute inset-0 bg-gradient-to-b from-black/40 to-black/80'></div>
              <div className='absolute inset-0 flex items-center sm:items-end p-4 sm:p-8 md:p-20 text-white max-w-xs sm:max-w-md md:max-w-2xl'>
                <div>
                  <Link
                    href={`/details?id=${media.id}&media_type=${media.media_type ?? 'movie'}`}
                  >
                    <h1 className='text-2xl sm:text-2xl md:text-5xl font-bold leading-tight sm:leading-snug'>
                      {getMediaTitle(media)}
                    </h1>
                  </Link>
                  <p className='text-sm sm:text-sm md:text-lg mt-0.5 sm:mt-2 text-yellow-400 font-semibold sm:leading-5'>
                    {getGenres(media)}
                  </p>
                  <p className='text-sm sm:text-sm md:text-lg mt-5 line-clamp-5 hidden sm:block sm:leading-5'>
                    {media.overview || 'No Description Available'}
                  </p>
                  <p className='text-sm sm:text-sm md:text-lg mt-5 sm:leading-5'>
                    <span className='mr-4'>
                      ⭐ {media.vote_average != null ? media.vote_average.toFixed(1) : 'N/A'}
                    </span>
                    {media.media_type === 'movie' && (
                      <>
                        <span className='mr-4'>|</span>
                        <span>{formatDuration(media)}</span>
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => openModal(media)}
                    disabled={!media.id}
                    className={`mt-5 sm:mt-8 inline-block bg-yellow-400 px-4 sm:px-4 py-2 sm:py-2 md:px-6 md:py-3 text-black font-semibold rounded-lg hover:bg-yellow-500 transition text-sm sm:text-base md:text-base ${
                      !media.id
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }`}
                  >
                    Watch Trailer
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* the navigation buttons */}
      {movies.length > 1 && (
        <div className='absolute right-4 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-1'>
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              aria-label={`slide ${index + 1}`}
              className={`w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors ${
                currentSlide === index
                  ? 'bg-yellow-400 border-yellow-400'
                  : 'bg-transparent border-white'
              }`}
            ></button>
          ))}
        </div>
      )}

      <TrailerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        trailerUrl={trailerUrl}
        title={selectedMedia ? getMediaTitle(selectedMedia) : 'Trailer'}
      />
    </section>
  );
}
