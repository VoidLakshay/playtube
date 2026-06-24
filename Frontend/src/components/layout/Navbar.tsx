import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { Menu, Search, Video, Bell, User, LayoutDashboard } from 'lucide-react';
import { getImageUrl, getFallbackAvatar } from '../../utils/image';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-dark-bg border-b border-dark-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-dark-card rounded-full transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-white font-bold text-xl hidden sm:block">PlayTube</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos"
              className="flex-1 bg-dark-bg border border-dark-border rounded-l-full px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 bg-dark-card border border-l-0 border-dark-border rounded-r-full hover:bg-[#2a2a2a] transition-colors"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {user?.channel && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            )}
            <Link
              to="/upload"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              <Video className="w-5 h-5" />
              <span className="hidden sm:block">Create</span>
            </Link>
            <button className="p-2 hover:bg-dark-card rounded-full transition-colors">
              <Bell className="w-6 h-6 text-white" />
            </button>
            <div className="relative group">
              <button className="p-1">
                <img
                  src={getImageUrl(user?.photoUrl)}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackAvatar();
                  }}
                />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4 border-b border-dark-border">
                  <p className="text-white font-medium">{user?.userName}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
                {user?.channel && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] text-white"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                )}
                <Link
                  to={user?.channel ? `/channel/${user.channel.handle}` : '/create-channel'}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] text-white"
                >
                  <User className="w-5 h-5" />
                  {user?.channel ? 'Your channel' : 'Create channel'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] text-white"
                >
                  <User className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 border border-dark-border text-white rounded-full hover:bg-dark-card transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
