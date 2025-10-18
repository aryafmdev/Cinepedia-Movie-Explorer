'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type {
  TMDBItem,
  PaginatedResponse,
  TMDBMovieSummary,
  TMDBTvSummary,
} from '@/types/tmdb';

export default function Header() {
  const pathname = usePathname(); // using pathname to highlight the active navigation link
  const [isMenuOpen, setIsMenuOpen] = useState(false); // state for control mobile menu
  const [isSearchOpen, setIsSearchOpen] = useState(false); // state to controll the search visibility
  const [searchTerm, setSearchTerm] = useState(''); // state to store the search input value
  const [suggestions, setSuggestions] = useState<TMDBItem[]>([]); // state to store the search suggestions results
  const [isLoading, setIsLoading] = useState(false); // state to track loading status

  // navigation links
  const navLinks = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Movies',
      href: '/movies',
    },
    {
      name: 'TV Series',
      href: '/tv-series',
    },
  ];

  // fetch search suggestions from TMDB based on input value
  const fetchSuggestions = async (query: string): Promise<void> => {
    // clear suggestions if query is empty or spaces
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // show loading indicator before starting API call
    setIsLoading(true);
    try {
      // get TMDB API key from .env.local
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      // build API URL with encoded query for safe URL formatting
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}`;
      // fetch search results without caching for fresh data
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        // convert response to JSON
        const data: PaginatedResponse<TMDBItem> = await res.json();
        // keep only movies and tv series and set the limit to 5 results
        const filteredResults: TMDBItem[] =
          data.results
            ?.filter(
              (item) => item.media_type === 'movie' || item.media_type === 'tv'
            )
            .slice(0, 5) || [];
        // update suggestions with filtered results
        setSuggestions(filteredResults);
      } else {
        // clear suggestions if API request fails
        setSuggestions([]);
      }
    } catch (error) {
      // log error and clear suggestions if API request fails
      console.log(error);
      setSuggestions([]);
    } finally {
      // hide loading indicator after API call completes
      setIsLoading(false);
    }
  };

  // handle search button click behavior
  const handleSearchClick = () => {
    // if search is open and suggestions exist, close search and reset suggestions
    if (isSearchOpen && suggestions.length > 0) {
      setIsSearchOpen(false);
      setSearchTerm('');
      setSuggestions([]);
    } else if (searchTerm.trim()) {
      // if search term is exist, open search and fetch suggestions
      setIsSearchOpen(true);
      fetchSuggestions(searchTerm);
    }
  };

  // handle Enter key to trigger search without clicking the button
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        setIsSearchOpen(true);
        fetchSuggestions(searchTerm);
      } else {
        setIsSearchOpen(false);
        setSuggestions([]);
      }
    }
  };

  return (
    <motion.header
      className='bg-transparent text-white w-full py-2 z-50 px-4 md:px-10 xl:px-36 absolute top-0 left-0'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* desktop design section */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        {/* logo section */}
        <div className='flex items-center justify-between w-full md:w-auto'>
          <Link href='/' className='flex flex-col items-center'>
            <span className='text-2xl md:text-xl lg:text-3xl font-bold text-yellow-400'>
              CinemaPedia
            </span>
            <span className='text-xs lg:text-base text-white'>
              Movies & TV Series
            </span>
          </Link>

          {/* mobile menu toggle button */}
          <motion.button
            className='md:hidden text-white hover:text-white/80 cursor-pointer'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </motion.button>
        </div>

        {/* search bar */}
        <motion.div className='relative w-full md:w-1/3 md:mx-8 hidden md:block'>
          <input
            type='text'
            placeholder='Quick Search'
            className='w-full px-4 py-1.5 lg:py-3 bg-white text-sm text-gray-500 focus:outline-none placeholder-gray-500 rounded-xl border border-gray-500 focus:border-white pr-10'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            className='absolute top-1/2 right-3 transform -translate-y-1/2 cursor-default'
            onClick={handleSearchClick}
          >
            {isLoading ? (
              // show loading spinner during API call
              <div className='w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin' />
            ) : isSearchOpen && suggestions.length > 0 ? (
              // show close icon when search is open and suggestions exist
              <X className='w-5 h-5 text-gray-500' />
            ) : (
              // show search icon when search is closed and no suggestions
              <Search className='w-5 h-5 text-gray-500' />
            )}
          </button>

          {/* animated suggestion dropdown */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                className='absolute top-full mt-1 w-full bg-[#18181b] border border-gray-500 rounded-lg shadow-lg z-50'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* render suggestions or no results found message */}
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={
                        isMovieItem(item)
                          ? {
                              pathname: '/details',
                              query: { id: item.id, media_type: 'movie' },
                            }
                          : {
                              pathname: '/details',
                              query: { id: item.id, media_type: 'tv' },
                            }
                      }
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchTerm('');
                        setSuggestions([]);
                      }}
                    >
                      <div className='flex items-center gap-2 p-2 hover:bg-[#252525] rounded-lg cursor-pointer'>
                        <Image
                          src={
                            item.poster_path
                              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                              : '/default-poster.jpg'
                          }
                          alt={
                            isMovieItem(item)
                              ? item.title || 'Unnamed'
                              : item.name || 'Unnamed'
                          }
                          width={32}
                          height={48}
                          className='w-8 aspect-[2/3] object-cover rounded'
                          quality={75}
                        />
                        <div className='flex-1'>
                          <h3 className='text-sm text-white line-clamp-2 h-10'>
                            {isMovieItem(item)
                              ? item.title || 'Unnamed'
                              : item.name || 'Unnamed'}
                          </h3>
                          <p>
                            {(isMovieItem(item)
                              ? item.release_date
                              : item.first_air_date
                            )?.split('-')[0] || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // no results found message
                  <div className='p-2 text-sm text-center text-gray-400'>
                    No Results Found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* navigation links */}
        <nav className='hidden md:flex md:items-center md:space-x-6'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm sm:text-base font-medium relative text-white ${
                pathname === link.href ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              {link.name}

              {/* underline animation for active link */}
              {pathname === link.href && (
                <motion.span
                  className='absolute left-0 right-0 bottom-0 h-0.5 bg-yellow-400'
                  layoutId='underline'
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* mobile menu */}
      <motion.div
        className={`md:hidden backdrop-blur-xs bg-[rgba(24,24,27,0.6)] z-50 absolute left-0 w-full px-4 py-4 ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={isMenuOpen ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* mobile search bar */}
        <motion.div className='relative w-full mb-4'>
          <input
            type='text'
            placeholder='Quick Search'
            className='w-full px-4 py-2 bg-white text-gray-500 focus:outline-none placeholder-gray-500 rounded-xl border border-gray-500 focus:border-white pr-10'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            className='absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer'
            onClick={handleSearchClick}
          >
            {isLoading ? (
              // show loading spinner during API call
              <div className='w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin' />
            ) : isSearchOpen && suggestions.length > 0 ? (
              // show close icon when search is open and suggestions exist
              <X className='w-5 h-5 text-gray-500' />
            ) : (
              // show search icon when search is closed and no suggestions
              <Search className='w-5 h-5 text-gray-500' />
            )}
          </button>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                className='absolute top-full mt-1 w-full bg-[#18181b] border border-gray-500 rounded-lg shadow-lg z-50'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* render suggestions or no results found message */}
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={
                        isMovieItem(item)
                          ? {
                              pathname: '/details',
                              query: { id: item.id, media_type: 'movie' },
                            }
                          : {
                              pathname: '/details',
                              query: { id: item.id, media_type: 'tv' },
                            }
                      }
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchTerm('');
                        setSuggestions([]);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className='flex items-center gap-2 p-2 hover:bg-[#252525] rounded-lg cursor-pointer'>
                        <Image
                          src={
                            item.poster_path
                              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                              : '/default-poster.jpg'
                          }
                          alt={
                            isMovieItem(item)
                              ? item.title || 'Unnamed'
                              : item.name || 'Unnamed'
                          }
                          width={32}
                          height={48}
                          className='w-8 aspect-[2/3] object-cover rounded'
                          quality={75}
                        />
                        <div className='flex-1'>
                          <h3 className='text-sm text-white line-clamp-2 h-10'>
                            {isMovieItem(item)
                              ? item.title || 'Unnamed'
                              : item.name || 'Unnamed'}
                          </h3>
                          <p>
                            {(isMovieItem(item)
                              ? item.release_date
                              : item.first_air_date
                            )?.split('-')[0] || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // no results found message
                  <div className='p-2 text-sm text-center text-gray-400'>
                    No Results Found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* mobile navigation links */}
        <nav className='flex flex-col items-center gap-2'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className='block text-white text-base font-medium hover:text-white/80'
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </motion.div>
    </motion.header>
  );
}

// type guards for TMDBItem union
const isMovieItem = (item: TMDBItem): item is TMDBMovieSummary =>
  item.media_type === 'movie';
const isTvItem = (item: TMDBItem): item is TMDBTvSummary =>
  item.media_type === 'tv';
