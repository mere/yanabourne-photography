import { useState, useEffect } from "react";
import Logo from "./Logo";
import { HomeIcon, AboutIcon, ContactIcon, BookMeIcon } from "./NavIcons";

const Header = () => {
  const pathname = "TODO";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          {navItems.map((item) => {
            
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
              <nav className="flex-1 p-6 ">
                <ul className="space-y-6">
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
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
