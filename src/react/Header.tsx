import { useState, useEffect } from "react";
import Logo from "./Logo";
import { HomeIcon, AboutIcon, ContactIcon, BookMeIcon } from "./NavIcons";

const Header = ({links, pathname}: {links: {description: string, link: string}[], pathname: string}) => {
  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [galleriesDropdownOpen, setGalleriesDropdownOpen] = useState(false);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.classList.add('mobile-nav-open');
    } else {
      document.body.classList.remove('mobile-nav-open');
    }

    return () => {
      document.body.classList.remove('mobile-nav-open');
    };
  }, [mobileNavOpen]);

  // Close galleries dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (galleriesDropdownOpen && !target.closest('.galleries-dropdown')) {
        setGalleriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [galleriesDropdownOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking on the overlay background, not the panel
    if (e.target === e.currentTarget) {
      setMobileNavOpen(false);
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "About", path: "/about", icon: AboutIcon },
    { name: "Book me", path: "/book-me", icon: BookMeIcon },
    { name: "Contact", path: "/contact", icon: ContactIcon },
  ];

  // Add gallery links to navigation
  const galleryNavItems = links.map(link => ({
    name: link.description,
    path: link.link,
    icon: null
  }));

  const allNavItems = [...navItems, ...galleryNavItems];

  return (
    <header>
      <Logo fixed={true} />
      <div className="flex justify-end fixed z-9999 top-5 right-8">
        <button
          className={`flex md:hidden hamburger ${mobileNavOpen && "active"}`}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <span className="sr-only">Menu</span>
          <svg
            className="w-6 h-6 fill-black"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y="4" width="24" height="2" />
            <rect y="11" width="24" height="2" />
            <rect y="18" width="24" height="2" />
          </svg>
        </button>
        <nav className=" gap-4 hidden md:flex">
          {/* Home */}
          <a
            href="/"
            className={`text-gray-500 text-md relative before:content-[''] before:absolute before:block before:w-full before:h-[2px] before:bottom-0 before:left-0 before:bg-gray-500 before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100
                ${
                  pathname === "/" ? "font-semibold" : ""
                } flex items-center gap-1`}
            title="Home"
          >
            <span className="hidden md:block">Home</span>
          </a>
          
          {/* Galleries Dropdown */}
          <div className="relative galleries-dropdown">
            <button
              onClick={() => setGalleriesDropdownOpen(!galleriesDropdownOpen)}
              className={`text-gray-500 text-md relative before:content-[''] before:absolute before:block before:w-full before:h-[2px] before:bottom-0 before:left-0 before:bg-gray-500 before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100 flex items-center gap-1 ${
                galleryNavItems.some(item => pathname === item.path) ? "font-semibold" : ""
              }`}
            >
              <span className="hidden md:block">Galleries</span>
              {/* <svg
                className={`w-4 h-4 transition-transform ${galleriesDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg> */}
            </button>
            
            {/* Dropdown Menu */}
            {galleriesDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                {galleryNavItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setGalleriesDropdownOpen(false)}
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                      pathname === item.path ? "bg-gray-100 font-semibold" : ""
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* About, Book me, Contact */}
          {navItems.slice(1).map((item) => {
            
            return (
              <a
                key={item.path}
                href={item.path}
                className={`text-gray-500 text-md relative before:content-[''] before:absolute before:block before:w-full before:h-[2px] before:bottom-0 before:left-0 before:bg-gray-500 before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100
                    ${
                      pathname === item.path ? "font-semibold" : ""
                    } flex items-center gap-1`}
                title={item.name}
              >
                
                <span className="hidden md:block">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10000 md:hidden mobile-nav-overlay"
          onClick={handleOverlayClick}
        >
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg mobile-nav-panel">
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex justify-end items-center py-6 px-8 border-b">
                
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none" 
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round" 
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Navigation items */}
              <nav className="flex-1 p-6 overflow-y-auto">
                <ul className="space-y-6">
                  {/* Quick Links Section */}
                  <li>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Links</h3>
                    <ul className="space-y-4">
                      {navItems.map((item) => {
                        
                        return (
                          <li key={item.path}>
                            <a
                              href={item.path}
                              onClick={() => setMobileNavOpen(false)}
                              className={`flex items-center gap-3 text-lg font-medium transition-colors duration-200 ${
                                pathname === item.path 
                                  ? "text-gray-900 border-l-4 border-gray-900 pl-4" 
                                  : "text-gray-600 hover:text-gray-900 hover:border-l-4 hover:border-gray-300 pl-4"
                              }`}
                            >
                              
                              <span>{item.name}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                  
                  {/* Galleries Section */}
                  <li>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Galleries</h3>
                    <ul className="space-y-4">
                      {galleryNavItems.map((item) => {
                        
                        return (
                          <li key={item.path}>
                            <a
                              href={item.path}
                              onClick={() => setMobileNavOpen(false)}
                              className={`flex items-center gap-3 text-lg font-medium transition-colors duration-200 ${
                                pathname === item.path 
                                  ? "text-gray-900 border-l-4 border-gray-900 pl-4" 
                                  : "text-gray-600 hover:text-gray-900 hover:border-l-4 hover:border-gray-300 pl-4"
                              }`}
                            >
                              
                              <span>{item.name}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
