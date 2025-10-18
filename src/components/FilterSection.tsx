'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Genre, Language } from '@/types/tmdb';

export default function FilterSection({
  genres = [],
  languages = [],
  placeholder,
}: {
  genres: Genre[];
  languages: Language[];
  placeholder: string;
}) {
  // initialize state for filter values
  const [filters, setFilters] = useState<{
    genre: string;
    year: string;
    rating: string;
    language: string;
    sortBy: string;
    query: string;
  }>({
    genre: '',
    year: '',
    rating: '',
    language: '',
    sortBy: '',
    query: '',
  });
  const router = useRouter();
  const pathname = usePathname();

  // sync filter state with URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters((prev) => ({
      ...prev,
      genre: params.get('genre') || '',
      year: params.get('year') || '',
      rating: params.get('rating') || '',
      language: params.get('language') || '',
      sortBy: params.get('sortBy') || '',
      query: params.get('query') || '',
    }));
  }, []); // empty dependency array ensures this effect runs once on mount

  // handle changes to filter inputs and update state
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    })); // update specific filter field
  };

  // handle select dropdown changes
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle search button click to update URL with filter values
  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value); // add non-empty filter values to URL
    });
    params.set('page', '1'); // reset to page 1 for new filter results
    // window.history.pushState({}, '', `?${params}`);
    router.push(`${pathname}?${params.toString()}`);
  };

  // trigger search when pressing Enter on the search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // define static filter options for years, rating, and sortBy
  const filterOptions = {
    years: ['2025', '2024', '2020-now', '2010-2019', '2000-2009', '1990-1999'],
    ratings: ['9', '8', '7', '6', '5', '4', '3', '2', '1'],
    sortBy: [
      { label: 'Most Popular', value: 'popularity.desc' },
      { label: 'Newest', value: 'release_date.desc' },
      { label: 'Oldest', value: 'release_date.asc' },
      { label: 'Top Rated', value: 'vote_average.desc' },
    ],
  } as const;

  // create reusable dropdown component for filter selections
  function Dropdown({
    label,
    options,
    name,
    value,
    onChange,
  }: {
    label: string;
    options: ReadonlyArray<{ label: string; value: string | number }>;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }) {
    return (
      <div>
        <label className='block mb-2 ml-1 text-sm'>{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className='bg-[#252525] rounded-md px-3 py-2 text-white w-full'
        >
          <option value=''>All</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // render filter UI with search input and dropdowns
  return (
    <section className='bg-black text-white py-6 mt-20'>
      <div className='px-4 md:px-10 xl:px-36'>
        <div className='mb-6'>
          <label className='block mb-2 ml-1 text-sm font-semibold'>
            Search
          </label>
          <input
            type='text'
            name='query'
            placeholder={placeholder}
            autoComplete='off'
            value={filters.query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className='w-full px-4 py-2 bg-[#252525] text-sm text-white placeholder-white rounded-xl focus:outline-none'
          />
        </div>

        <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
          {/* genre dropdown */}
          <Dropdown
            label='Genre'
            name='genre'
            value={filters.genre}
            onChange={handleSelectChange}
            options={genres.map((g) => ({
              label: g.name,
              value: g.id,
            }))}
          />

          {/* year dropdown */}
          <Dropdown
            label='Year'
            name='year'
            value={filters.year}
            onChange={handleSelectChange}
            options={filterOptions.years.map((y) => ({
              label: y,
              value: y,
            }))}
          />

          {/* rating dropdown */}
          <Dropdown
            label='Rating'
            name='rating'
            value={filters.rating}
            onChange={handleSelectChange}
            options={filterOptions.ratings.map((r) => ({
              label: `${r}+`,
              value: r,
            }))}
          />

          {/* language dropdown */}
          <Dropdown
            label='Language'
            name='language'
            value={filters.language}
            onChange={handleSelectChange}
            options={languages.map((l) => ({
              label: l.english_name,
              value: l.iso_639_1,
            }))}
          />

          {/* sortBy dropdown */}
          <Dropdown
            label='Sort By'
            name='sortBy'
            value={filters.sortBy}
            onChange={handleSelectChange}
            options={filterOptions.sortBy}
          />

          {/* search button */}
          <div className='flex items-end'>
            <button
              onClick={handleSearch}
              className='bg-yellow-400 text-black font-semibold w-full px-5 py-2 rounded-md hover:bg-yellow-500 transition'
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
