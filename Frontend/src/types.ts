export interface User {
  id: string;
  userName: string;
  email: string;
  photoUrl: string;
  channel?: Channel;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  channelName: string;
  handle: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  subscribersCount: number;
  videosCount: number;
  userId: string;
  user: User;
  videos: Video[];
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likesCount: number;
  isPublished: boolean;
  isShort: boolean;
  aspectRatio: string;
  transcodingStatus: string;
  hlsUrl?: string;
  spriteUrl?: string;
  channelId: string;
  channel: Channel;
  comments: Comment[];
  likes: Like[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  videoId: string;
  user: User;
  video: Video;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  userId: string;
  videoId: string;
  user: User;
  video: Video;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  userId: string;
  user: User;
  videos: PlaylistVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistVideo {
  id: string;
  playlistId: string;
  videoId: string;
  playlist: Playlist;
  video: Video;
  createdAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  channelId: string;
  subscriber: User;
  channel: Channel;
  createdAt: string;
}

export interface WatchHistory {
  id: string;
  userId: string;
  videoId: string;
  user: User;
  video: Video;
  watchedAt: string;
}

export interface WatchLater {
  id: string;
  userId: string;
  videoId: string;
  user: User;
  video: Video;
  createdAt: string;
}
