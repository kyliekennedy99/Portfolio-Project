import { useState, useEffect, Fragment } from 'react';
import { Menu, Transition, Disclosure } from '@headlessui/react';
import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Header() {
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    const url = localStorage.getItem("profilePhotoURL");
    if (url) setPhotoURL(url);
  }, []);

  return (
    <Disclosure as="header" className="bg-white shadow-sm sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-800 hover:text-green-600 transition">
              <MapIcon className="w-6 h-6 text-green-600" />
              <span>MiniTrails</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6">
              <NavLink to="/explore">Explore</NavLink>
              <NavLink to="/trails">Trails</NavLink>
              <NavLink to="/about">About</NavLink>
              <ProfileMenu photoURL={photoURL} />
            </div>

            {/* Mobile menu toggle */}
            <Disclosure.Button className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
              {open ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </Disclosure.Button>
          </div>

          {/* Mobile nav */}
          <Disclosure.Panel className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <MobileNavLink to="/explore">Explore</MobileNavLink>
              <MobileNavLink to="/trails">Trails</MobileNavLink>
              <MobileNavLink to="/about">About</MobileNavLink>
              <MobileNavLink to="/profile">View Profile</MobileNavLink>
              <MobileNavLink to="/favorites">Favorites</MobileNavLink>
              <MobileNavLink to="/settings">Settings</MobileNavLink>
              <MobileNavLink to="/auth">Login / Create Account</MobileNavLink>
              <button
                onClick={() => alert('Logging out…')}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Log out
              </button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-gray-700 hover:text-green-600 transition"
    >
      {children}
    </Link>
  );
}

function ProfileMenu({ photoURL }) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center focus:outline-none">
        {photoURL ? (
          <img
            src={photoURL}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <UserCircleIcon className="w-8 h-8 text-gray-600 hover:text-green-600 transition" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <DropdownLink to="/profile">View Profile</DropdownLink>
            <DropdownLink to="/favorites">Favorites</DropdownLink>
            <DropdownLink to="/settings">Settings</DropdownLink>
            <DropdownLink to="/auth">Login / Create Account</DropdownLink>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => alert('Logging out…')}
                  className={`w-full text-left px-4 py-2 text-sm text-red-600 ${
                    active ? 'bg-gray-100' : ''
                  }`}
                >
                  Log out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function DropdownLink({ to, children }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <Link
          to={to}
          className={`block px-4 py-2 text-sm ${
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
          }`}
        >
          {children}
        </Link>
      )}
    </Menu.Item>
  );
}

function MobileNavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
    >
      {children}
    </Link>
  );
}
