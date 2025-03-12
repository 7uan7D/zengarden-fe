export default function Footer() {
  return (
    <footer className="bg-[#609994] text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="text-lg font-bold">ZENGARDEN</div>

        <nav className="flex gap-6 text-sm">
          <a href="/about" className="hover:text-[#f9af44]">
            About
          </a>
          <a href="/marketplace" className="hover:text-[#f9af44]">
            Marketplace
          </a>
          <a href="/task" className="hover:text-[#f9af44]">
            Tasks
          </a>
          <a href="/contact" className="hover:text-[#f9af44]">
            Contact
          </a>
        </nav>

        <div className="text-xs opacity-80">
          © {new Date().getFullYear()} ZenGarden. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
