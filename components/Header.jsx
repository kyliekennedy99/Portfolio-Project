import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">AllTrails</h1>

      <ProfileMenu />
    </header>
  );
}

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 text-sm focus:outline-none">
        <UserCircleIcon className="w-8 h-8 text-gray-600" />
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
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/profile"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  View Profile
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="/favorites"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  Favorites
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="/settings"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  Settings
                </a>
              )}
            </Menu.Item>

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
