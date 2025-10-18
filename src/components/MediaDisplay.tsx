import Card from './Card';
import type { TMDBItem } from '@/types/tmdb';

export default function MediaDisplay({ items }: { items: TMDBItem[] }) {
  return (
    <div className='bg-black text-white min-h-screen w-full flex justify-center'>
      <section className='py-8 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 max-w-[1400px] w-full'>
        {items.length > 0 ? (
          <div className='flex justify-center'>
            <div
              className='inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8'
              style={{ minWidth: 'min-content' }}
            >
              {items.slice(0, 15).map((item) => (
                <div className='w-[220px]' key={item.id}>
                  <Card media={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className='text-gray-400 text-center'>No Items Found</p>
        )}
      </section>
    </div>
  );
}
