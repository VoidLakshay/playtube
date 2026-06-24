import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchVideoById, clearCurrentVideo } from '../features/videos/videoSlice';
import { videoService } from '../services/video';
import { commentService } from '../services/comment';
import { channelService } from '../services/channel';
import { historyService } from '../services/history';
import { watchLaterService } from '../services/watchLater';
import VideoCard from '../components/video/VideoCard';
import QualitySelector from '../components/video/QualitySelector';
import TimelinePreview from '../components/video/TimelinePreview';
import { ThumbsUp, Share2, MessageSquare, Loader2, List, Clock } from 'lucide-react';
import { WatchPageSkeleton } from '../components/common/Skeletons';
import Hls from 'hls.js';
import { toast } from 'sonner';
import type { Comment } from '../types';
import { getImageUrl, getFallbackAvatar } from '../utils/image';

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [addingToWatchLater, setAddingToWatchLater] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [debugData, setDebugData] = useState<any>(null);

  const { currentVideo: video, recommendedVideos, loading } = useAppSelector(
    (state) => state.videos
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchVideoById(id));
    }
    return () => {
      dispatch(clearCurrentVideo());
      // Clean up HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (video) {
      setLikesCount(video.likesCount);
      setSubscribersCount(video.channel.subscribersCount);
      
      // Load initial states if authenticated
      if (isAuthenticated) {
        // Load like status
        const loadLikeStatus = async () => {
          try {
            const likedList = await videoService.getLikedVideos();
            const liked = likedList.some((item: any) => {
              return item.videoId === video.id || item.video?.id === video.id;
            });
            setIsLiked(liked);
          } catch (err) {
            console.error('Failed to load like status:', err);
          }
        };

        // Load watch later status
        const loadWatchLaterStatus = async () => {
          try {
            const watchLaterList = await watchLaterService.getWatchLater();
            const inWatchLater = watchLaterList.some((item: any) => {
              return item.videoId === video.id || item.video?.id === video.id;
            });
            setIsInWatchLater(inWatchLater);
          } catch (err) {
            console.error('Failed to load watch later status:', err);
          }
        };

        // Load subscription status
        const loadSubStatus = async () => {
          try {
            const subStatus = await channelService.checkSubscriptionStatus(video.channel.id);
            setIsSubscribed(subStatus.subscribed);
          } catch (err) {
            console.error('Failed to load subscription status:', err);
          }
        };
        
        // Add to watch history
        const addToHistory = async () => {
          try {
            await historyService.addToWatchHistory(video.id);
          } catch (err) {
            console.error('Failed to add to watch history:', err);
          }
        };

        loadLikeStatus();
        loadWatchLaterStatus();
        loadSubStatus();
        addToHistory();
      }

      // Load comments
      const loadComments = async () => {
        setLoadingComments(true);
        try {
          const commentsData = await commentService.getCommentsByVideoId(video.id);
          setComments(commentsData);
        } catch (err) {
          console.error('Failed to load comments:', err);
        } finally {
          setLoadingComments(false);
        }
      };
      loadComments();
    }
  }, [video, isAuthenticated]);

  useEffect(() => {
    if (videoRef.current && video) {
      const videoElement = videoRef.current;
      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hlsUrl = getImageUrl(video.hlsUrl);
      const directVideoUrl = getImageUrl(video.videoUrl);

      console.log('===== VIDEO DATA =====', video);
      console.log('Original hlsUrl:', video.hlsUrl);
      console.log('Processed hlsUrl:', hlsUrl);
      console.log('Original videoUrl:', video.videoUrl);
      console.log('Processed videoUrl:', directVideoUrl);
      console.log('transcodingStatus:', video.transcodingStatus);

      if (video.transcodingStatus === 'processing') {
        toast.info('Video is still processing, please wait...');
      } else if (video.transcodingStatus === 'failed') {
        toast.error('Video processing failed');
      } else if (hlsUrl && video.hlsUrl) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: true
          });
          hlsRef.current = hls;
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed');
            videoElement.play().catch(err => {
              console.error('Play error:', err);
            });
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            console.error('HLS ERROR:', data);
            if (data.fatal) {
              console.error('HLS fatal error:', data);
              toast.error('Failed to load video');
            }
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.src = hlsUrl;
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(err => console.error('Play error:', err));
          });
        }
      } else if (directVideoUrl && video.videoUrl) {
        videoElement.src = directVideoUrl;
        videoElement.addEventListener('loadedmetadata', () => {
          videoElement.play().catch(err => console.error('Play error:', err));
        });
      }
    }
  }, [video]);

  const handleLike = async () => {
  if (!isAuthenticated) {
    toast.error('Please sign in to like videos');
    return;
  }

  if (!video || liking) return;

  setLiking(true);

  try {
    const result = await videoService.toggleLike(video.id);

    setIsLiked(result.liked);
    setLikesCount(result.likesCount);

    toast.success(
      result.liked ? 'Liked!' : 'Unliked!'
    );
  } catch (err) {
    toast.error('Failed to like video');
  } finally {
    setLiking(false);
  }
};

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      return;
    }
    if (!video || subscribing) return;
    setSubscribing(true);
    try {
      const result = await channelService.toggleSubscribe(video.channel.id);
      setIsSubscribed(result.subscribed);
      setSubscribersCount((prev) => result.subscribed ? prev + 1 : Math.max(0, prev - 1));
      toast.success(result.subscribed ? 'Subscribed!' : 'Unsubscribed!');
    } catch (err) {
      toast.error('Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleWatchLater = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to watch later');
      return;
    }
    if (!video || addingToWatchLater) return;
    setAddingToWatchLater(true);
    try {
      const result = await watchLaterService.toggleWatchLater(video.id);
      setIsInWatchLater(result.saved);
      toast.success(result.saved ? 'Added to Watch Later!' : 'Removed from Watch Later!');
    } catch (err) {
      toast.error('Failed to update watch later');
    } finally {
      setAddingToWatchLater(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to playlist');
      return;
    }
    if (!video) return;
    // For now, show a simple toast
    toast.info('Add to Playlist feature coming soon!');
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    setHoverPosition(Math.max(0, Math.min(1, position)));
    setIsHoveringProgress(true);
  };

  const handleProgressMouseLeave = () => {
    setIsHoveringProgress(false);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const seekTime = position * video.duration;
    videoRef.current.currentTime = seekTime;
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    const handleTimeUpdate = () => {
      if (videoElement) {
        setCurrentTime(videoElement.currentTime);
      }
    };
    videoElement?.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoElement?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  // Log full video data for debugging
  useEffect(() => {
    if (video) {
      console.log("=== FULL VIDEO DATA ===");
      console.log(video);
    }
  }, [video]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim() || !video) return;

    setAddingComment(true);

    try {
      const comment = await commentService.addComment(
        video.id,
        newComment.trim()
      );

      setComments((prev) => [comment, ...prev]);

      setNewComment('');

      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (!video) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Video not found</h2>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
            />
            {/* Custom hover area for timeline preview - positioned over the bottom where native seek bar is */}
            {video.spriteUrl && (
              <div
                ref={progressBarRef}
                className="absolute bottom-0 left-0 right-0 h-20 cursor-pointer z-10"
                onMouseMove={handleProgressMouseMove}
                onMouseLeave={handleProgressMouseLeave}
                onClick={handleProgressClick}
              >
                {isHoveringProgress && (
                  <TimelinePreview
                    spriteUrl={video.spriteUrl}
                    duration={video.duration}
                    hoverPosition={hoverPosition}
                    previewContainerRef={previewContainerRef}
                    onDebug={setDebugData}
                  />
                )}
              </div>
            )}
            {/* Custom controls overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <QualitySelector hls={hlsRef.current} />
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold text-white">{video.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
              <div className="flex items-center gap-4">
                <Link to={`/channel/${video.channel.handle}`}>
                  <img
                    src={getImageUrl(video.channel.logoUrl)}
                    alt={video.channel.channelName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackAvatar();
                    }}
                  />
                </Link>
                <div>
                  <Link
                    to={`/channel/${video.channel.handle}`}
                    className="text-white font-medium hover:text-blue-400"
                  >
                    {video.channel.channelName}
                  </Link>
                  <p className="text-gray-400 text-sm">
                    {subscribersCount.toLocaleString()} subscribers
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    isSubscribed
                      ? 'bg-dark-card text-white hover:bg-[#2a2a2a]'
                      : 'bg-white text-black hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {subscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isSubscribed ? 'Subscribed' : 'Subscribe'
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isLiked
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-card text-white hover:bg-[#2a2a2a]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {liking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ThumbsUp className="w-5 h-5" />
                      {likesCount.toLocaleString()}
                    </>
                  )}
                </button>
                <button
                  onClick={handleWatchLater}
                  disabled={addingToWatchLater}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isInWatchLater
                      ? 'bg-purple-600 text-white'
                      : 'bg-dark-card text-white hover:bg-[#2a2a2a]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addingToWatchLater ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      Watch Later
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddToPlaylist}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-card text-white rounded-full hover:bg-[#2a2a2a] transition-colors"
                >
                  <List className="w-5 h-5" />
                  Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-card text-white rounded-full hover:bg-[#2a2a2a] transition-colors">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-dark-card rounded-xl">
              <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <span>{formatViews(video.views)}</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
              <p className="text-white whitespace-pre-wrap">{video.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {comments.length} Comments
              </h3>

              {isAuthenticated && (
                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                  <img
                    src={getImageUrl(user?.photoUrl)}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackAvatar();
                    }}
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-dark-border text-white py-2 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setNewComment('')}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingComment || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full"
                      >
                        {addingComment ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Comment'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={getImageUrl(comment.user.photoUrl)}
                        alt={comment.user.userName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackAvatar();
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {comment.user.userName}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-white mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {recommendedVideos.map((recVideo) => (
            <VideoCard key={recVideo.id} video={recVideo} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watch;
