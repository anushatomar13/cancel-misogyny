import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black text-gray-300 py-10 px-4 border-t border-gray-800 ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Left Section */}
        <div className="flex flex-col gap-3 max-w-md -ml-10">
          <div className="flex items-center gap-2 text-xl font-semibold ">
          <Image
          src="/images/logo.png"
          width={50}
          height={50}
          alt='logo'
          className='-ml-[12px]'
          />
            <span className='uppercase'>Cancel Misogyny</span>
          </div>
          <p className="text-sm text-gray-400">
            A mission to increase awareness about online sexism
          </p>
          <p className="text-sm text-gray-500">
            Made with <span className="text-red-500">❤️</span> by Anusha.
          </p>
        </div>

        {/* Right Section */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <ul className="space-y-1 text-sm text-gray-400 mt-7">
              <li><Link href="/pages/analyze" className="hover:text-purple-400 uppercase">Analyze Comments</Link></li>
              <li><Link href="/pages/analyze" className="hover:text-purple-400 uppercase">Get reply suggestions</Link></li>
              <li><Link href="/pages/learn" className="hover:text-purple-400 uppercase">Understand misogynistic intents</Link></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1 text-sm text-gray-400 mt-7">
              <li><Link href="/pages/learn" className="hover:text-purple-400">KNOWLEDGE CORNER</Link></li>
              <li><Link href="/pages/log-comment" className="hover:text-purple-400">LOG COMMENTS</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400">CONTACT US</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-xs text-gray-500 mt-10 border-t border-gray-800 pt-4">
        © 2025 CancelMisogyny - Anusha Tomar. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
