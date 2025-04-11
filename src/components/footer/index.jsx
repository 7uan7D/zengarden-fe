import { SiGmail } from 'react-icons/si';
import { FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#609994] text-white py-6">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1 - Contact */}
        <div>
          <h3 className="text-xl font-bold mb-3 border-b-2 border-[#f9af44] pb-1">
            Contact
          </h3>
          <div className="text-sm space-y-2">
            <a
              href="mailto:trungtuanduong007@gmail.com"
              className="flex items-center gap-2 hover:text-[#f9af44] transition-colors duration-200"
            >
              <SiGmail className="text-[#f9af44]" /> trungtuanduong007@gmail.com
            </a>
            <a
              href="tel:0123456789"
              className="flex items-center gap-2 hover:text-[#f9af44] transition-colors duration-200"
            >
              <span className="text-[#f9af44]">📞</span> 0123456789
            </a>
            <a
              href="https://www.facebook.com/trungtuannek"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#f9af44] transition-colors duration-200"
            >
              <FaFacebook className="text-[#f9af44]" /> Dương Trung Tuấn
            </a>
          </div>
        </div>

        {/* Cột 2 - About */}
        <div>
          <h3 className="text-xl font-bold mb-3 border-b-2 border-[#f9af44] pb-1">
            About
          </h3>
          <nav className="text-sm space-y-2">
            <a
              href="/about"
              className="block hover:text-[#f9af44] transition-colors duration-200"
            >
              Learn More
            </a>
          </nav>
        </div>

        {/* Cột 3 - Marketplace */}
        <div>
          <h3 className="text-xl font-bold mb-3 border-b-2 border-[#f9af44] pb-1">
            Marketplace
          </h3>
          <nav className="text-sm space-y-2">
            <a
              href="/marketplace"
              className="block hover:text-[#f9af44] transition-colors duration-200"
            >
              Explore
            </a>
          </nav>
        </div>

        {/* Cột 4 - Support */}
        <div>
          <h3 className="text-xl font-bold mb-3 border-b-2 border-[#f9af44] pb-1">
            Support
          </h3>
          <nav className="text-sm space-y-2">
            <a
              href="/faq"
              className="block hover:text-[#f9af44] transition-colors duration-200"
            >
              FAQ
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nhatnlse161671@fpt.edu.vn&su=Bug Report"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-[#f9af44] transition-colors duration-200"
            >
              Report a Bug
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc1CSGBD7g4reaf99yeT85JNw2W8ylNqtCYfBJQ3xoeSN_NvA/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-[#f9af44] transition-colors duration-200"
            >
              Request a Feature
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 flex justify-between items-center text-xs border-t border-[#ffffff33] pt-4">
        <div className="text-center flex-1 opacity-70">
          © {new Date().getFullYear()} ZenGarden. All rights reserved.
        </div>
        <a
          href="/policy"
          className="text-right hover:text-[#f9af44] transition-colors duration-200"
        >
          Policy
        </a>
      </div>
    </footer>
  );
}