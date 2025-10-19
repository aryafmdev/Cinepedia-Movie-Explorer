import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-black text-white border-t border-gray-700'>
      <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
        {/* Logo section */}
        <Link href='/' className='flex flex-col items-center'>
          <span className='text-sm md:text-base font-bold text-yellow-400'>
            CinemaPedia
          </span>
        </Link>

        {/* Right: Copyright text with icon */}
        <div className='flex items-center space-x-1 text-xs md:text-sm'>
          <span>2025 CinemaPedia by AryaFMDev</span>
        </div>
      </div>
    </footer>
  );
}
