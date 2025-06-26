import Logo from "./Logo";
import { HomeIcon, AboutIcon, ContactIcon, BookMeIcon } from "./NavIcons";

const Header = () => {
  const pathname = 'TODO'

  const navItems = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "About", path: "/about", icon: AboutIcon },
    { name: "Book me", path: "/book-me", icon: BookMeIcon },
    { name: "Contact", path: "/contact", icon: ContactIcon },
  ];

  return (
    <header>
        <Logo fixed={true} />
        <div className="flex justify-end fixed z-9999 top-5 right-8 mix-blend-difference">
          <nav className="flex gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`text-gray-500 text-md relative before:content-[''] before:absolute before:block before:w-full before:h-[2px] before:bottom-0 before:left-0 before:bg-gray-500 before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100
                    ${pathname === item.path ? "font-semibold" : ""} flex items-center gap-1`}
                  title={item.name}
                >
                  <Icon className="w-5 h-5 block md:hidden" />
                  <span className="hidden md:block">{item.name}</span>
                </a>
              );
            })}
          </nav>
        </div>
    </header>
  );
};

export default Header;
