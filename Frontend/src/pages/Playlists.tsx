import React from 'react';

const Playlists: React.FC = () => {
  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Playlists</h1>
      <div className="text-center py-12 bg-dark-card rounded-xl">
        <h3 className="text-lg font-medium text-white mb-2">No Playlists Yet</h3>
        <p className="text-gray-400">Create your first playlist!</p>
      </div>
    </div>
  );
};

export default Playlists;
