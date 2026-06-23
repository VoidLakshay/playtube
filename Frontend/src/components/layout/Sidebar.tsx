import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Home, Compass, ThumbsUp, User, Clock, LayoutDashboard, Upload, List, Users, Bookmark } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
  ];

  const authNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', requireAuth: true, requireChannel: true },
    { icon: Upload, label: 'Create', path: '/upload', requireAuth: true },
    { icon: User, label: user?.channel ? 'Your channel' : 'Create channel', path: user?.channel ? `/channel/${user.channel.handle}` : '/create-channel', requireAuth: true },
    { icon: Clock, label: 'History', path: '/history', requireAuth: true },
    { icon: ThumbsUp, label: 'Liked videos', path: '/liked', requireAuth: true },
    { icon: Bookmark, label: 'Watch Later', path: '/watch-later', requireAuth: true },
    { icon: List, label: 'Playlists', path: '/playlists', requireAuth: true },
    { icon: Users, label: 'Subscriptions', path: '/subscriptions', requireAuth: true },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-14 left-0 bottom-0 w-64 bg-dark-bg border-r border-dark-border overflow-y-auto z-40 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        <nav className="p-3">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-4 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive(item.path)
                  ? 'bg-dark-card text-white'
                  : 'text-white hover:bg-dark-card'
              }`}
            >
              <item.icon className="w-6 h-6" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
          
          {isAuthenticated && (
            <>
              <div className="border-t border-dark-border my-3" />
              {authNavItems
                .filter((item) => {
                  if (item.requireChannel && !user?.channel) return false;
                  return true;
                })
                .map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-3 py-2 rounded-lg mb-1 transition-colors ${
                      isActive(item.path)
                        ? 'bg-dark-card text-white'
                        : 'text-white hover:bg-dark-card'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
