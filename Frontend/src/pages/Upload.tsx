import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload as UploadIcon, X, Video, Image } from 'lucide-react';
import { useAppSelector } from '../app/hooks';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user && !user.channel) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Create a channel first</h2>
          <p className="text-gray-400 mb-4">You need a channel to upload videos</p>
          <Link
            to="/create-channel"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-block"
          >
            Create channel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-dark-card rounded-2xl p-6 border border-dark-border">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UploadIcon className="w-6 h-6 text-blue-500" />
            UPLOAD VIDEO
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Transcoding Warning */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 text-orange-400 font-semibold mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
            </svg>
            VIDEO TRANSCODING OPTIMIZED (OFF)
          </div>
          <p className="text-gray-300 mb-3">
            HLS adaptive stream video transcoding is currently turned off on live cluster hosts because processing multi-layered encoding is highly resource-intensive and expensive.
          </p>
          <p className="text-gray-400 text-sm">
            💡 Feel free to fork the repository, toggle <code className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30">ENABLE_TRANSCODING=true</code> inside your local environment, and test full resolution bitrate streams locally!
          </p>
        </div>

        {/* Disabled Upload UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="flex flex-col items-center justify-center aspect-video bg-dark-card/50 border-2 border-dashed border-dark-border rounded-xl cursor-not-allowed opacity-60">
              <Video className="w-12 h-12 text-gray-500 mb-2" />
              <span className="text-gray-400 font-medium">Select Video File</span>
            </label>
          </div>
          <div>
            <label className="flex flex-col items-center justify-center aspect-video bg-dark-card/50 border-2 border-dashed border-dark-border rounded-xl cursor-not-allowed opacity-60">
              <Image className="w-12 h-12 text-gray-500 mb-2" />
              <span className="text-gray-400 font-medium">Select Thumbnail</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400 font-medium">VIDEO TITLE</label>
              <span className="text-gray-500 text-xs">0/100</span>
            </div>
            <input
              type="text"
              disabled
              placeholder="Add video title..."
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400 font-medium">DESCRIPTION</label>
              <span className="text-gray-500 text-xs">0/5000</span>
            </div>
            <textarea
              rows={4}
              disabled
              placeholder="Description"
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-gray-500 cursor-not-allowed resize-none"
            />
          </div>
        </div>

        <button
          disabled
          className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl cursor-not-allowed opacity-60"
        >
          PUBLISH VIDEO
        </button>
      </div>
    </div>
  );
};

export default Upload;
