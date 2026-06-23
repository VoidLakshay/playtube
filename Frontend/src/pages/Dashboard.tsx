import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { studioService } from '../services/studio';
import { channelService } from '../services/channel';
import { videoService } from '../services/video';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchCurrentUser } from '../features/auth/authSlice';
import { VideoCardSkeleton } from '../components/common/Skeletons';
import {
  Video as VideoIcon,
  Eye,
  ThumbsUp,
  Users,
  Upload,
  Settings,
  Trash2,
  Edit3,
  ExternalLink,
  UserCircle,
  Save,
  Play,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Video } from '../types';
import { getImageUrl } from '../utils/image';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  // Edit Channel State
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [editChannelName, setEditChannelName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLogo, setEditLogo] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editBanner, setEditBanner] = useState<File | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [savingChannel, setSavingChannel] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && !user.channel) {
    return <Navigate to="/create-channel" />;
  }

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await studioService.getDashboard();
      setDashboard(data.dashboard);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditLogo(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditBanner(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEditChannel = () => {
    setIsEditingChannel(false);
    setEditLogo(null);
    setEditBanner(null);
  };

  const saveChannel = async () => {
    try {
      setSavingChannel(true);
      const data: any = {};
      if (editChannelName) data.channelName = editChannelName;
      if (editHandle) data.handle = editHandle;
      if (editDescription) data.description = editDescription;
      if (editLogo) data.logo = editLogo;
      if (editBanner) data.banner = editBanner;

      await channelService.updateChannel(data);
      await dispatch(fetchCurrentUser());
      await loadDashboard();
      setIsEditingChannel(false);
      toast.success('Channel updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update channel');
    } finally {
      setSavingChannel(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await videoService.deleteVideo(videoId);
      toast.success('Video deleted successfully!');
      await loadDashboard();
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-card p-6 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-700 mb-4" />
              <div className="h-6 bg-gray-700 rounded w-24 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Uploads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(4)].map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your channel and grow your audience</p>
        </div>
      </div>

      {/* Section 1: Channel Overview (Stats) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Analytics Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Videos</h3>
            </div>
            <p className="text-3xl font-bold text-white">{dashboard?.totalVideos || 0}</p>
          </div>
          <div className="bg-dark-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
            </div>
            <p className="text-3xl font-bold text-white">{(dashboard?.totalViews || 0).toLocaleString()}</p>
          </div>
          <div className="bg-dark-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Likes</h3>
            </div>
            <p className="text-3xl font-bold text-white">{(dashboard?.totalLikes || 0).toLocaleString()}</p>
          </div>
          <div className="bg-dark-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Subscribers</h3>
            </div>
            <p className="text-3xl font-bold text-white">{(dashboard?.subscribers || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Section 2: Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/upload" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            <Upload className="w-5 h-5" />
            Upload Video
          </Link>
          <Link to={`/channel/${dashboard?.channel?.handle}`} className="flex items-center gap-2 px-6 py-3 bg-dark-card border border-dark-border hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-colors">
            <ExternalLink className="w-5 h-5" />
            View Channel
          </Link>
          <button onClick={() => setIsEditingChannel(true)} className="flex items-center gap-2 px-6 py-3 bg-dark-card border border-dark-border hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Edit Channel
          </button>
        </div>
      </div>

      {/* Section 3: Channel Overview (Profile) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Channel Overview</h2>
        {isEditingChannel ? (
          <div className="bg-dark-card p-6 rounded-xl">
            {/* Banner Preview */}
            <div className="mb-6">
              <div className="relative h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
                {(editBannerPreview || dashboard?.channel?.bannerUrl) && (
                  <img
                    src={editBannerPreview || getImageUrl(dashboard?.channel?.bannerUrl)}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                )}
                <label className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 text-xs text-white rounded cursor-pointer">
                  Change Banner
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditBannerChange} />
                </label>
              </div>
            </div>
            {/* Logo & Form */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-dark-border border-4 border-dark-bg overflow-hidden flex items-center justify-center">
                  {(editLogoPreview || dashboard?.channel?.logoUrl) ? (
                    <img
                      src={editLogoPreview || getImageUrl(dashboard?.channel?.logoUrl)}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                <label className="cursor-pointer px-3 py-1 bg-dark-border hover:bg-[#2a2a2a] text-white rounded text-sm">
                  Change Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditLogoChange} />
                </label>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Channel Name</label>
                  <input
                    type="text"
                    value={editChannelName}
                    onChange={(e) => setEditChannelName(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={saveChannel} disabled={savingChannel} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
                    {savingChannel ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button onClick={cancelEditChannel} className="px-6 py-2 bg-dark-card border border-dark-border hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-dark-card p-6 rounded-xl">
            <div className="relative h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden mb-6">
              {dashboard?.channel?.bannerUrl && (
                <img src={getImageUrl(dashboard.channel.bannerUrl)} alt="Banner" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={getImageUrl(dashboard?.channel?.logoUrl)}
                alt="Channel"
                className="w-24 h-24 rounded-full border-4 border-dark-bg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">{dashboard?.channel?.channelName}</h3>
                <p className="text-gray-400">@{dashboard?.channel?.handle}</p>
                {dashboard?.channel?.description && (
                  <p className="text-gray-300 mt-2 max-w-2xl">{dashboard.channel.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Recent Uploads */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Uploads</h2>
        </div>
        {dashboard?.videos?.length === 0 ? (
          <div className="text-center py-12 bg-dark-card rounded-xl">
            <VideoIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
            <p className="text-gray-400 mb-4">Upload your first video to get started</p>
            <Link to="/upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-block">
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {dashboard?.videos?.map((video: Video) => (
              <div key={video.id} className="bg-dark-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center md:items-stretch">
                <div className="w-full md:w-48 aspect-video bg-dark-border rounded-lg overflow-hidden">
                  <img src={getImageUrl(video.thumbnailUrl)} alt={video.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">{video.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {video.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {video.likesCount.toLocaleString()}
                      </span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/watch/${video.id}`}
                      className="flex items-center gap-1 px-4 py-2 bg-dark-border hover:bg-[#2a2a2a] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Watch
                    </Link>
                    <button className="flex items-center gap-1 px-4 py-2 bg-dark-border hover:bg-[#2a2a2a] text-white rounded-lg text-sm font-medium transition-colors">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
