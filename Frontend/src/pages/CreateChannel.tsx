import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCurrentUser } from '../features/auth/authSlice';
import { channelService } from '../services/channel';
import { Loader2, Upload, ArrowLeft, Image } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const createChannelSchema = z.object({
  channelName: z.string().min(3, 'Channel name must be at least 3 characters'),
  handle: z.string().min(3, 'Handle must be at least 3 characters').regex(/^[a-zA-Z0-9_.-]+$/, 'Handle can only contain letters, numbers, dots, hyphens, and underscores'),
  description: z.string().optional(),
  logo: z.instanceof(File).optional(),
  banner: z.instanceof(File).optional(),
});

type CreateChannelFormData = z.infer<typeof createChannelSchema>;

const CreateChannel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If user already has a channel, redirect to dashboard
  if (isAuthenticated && user?.channel) {
    return <Navigate to="/dashboard" />;
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateChannelFormData>({
    resolver: zodResolver(createChannelSchema),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('logo', file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('banner', file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateChannelFormData) => {
    setSubmitting(true);
    try {
      await channelService.createChannel(data);
      toast.success('Channel created successfully!');
      
      // Update the user profile in Redux context
      await dispatch(fetchCurrentUser());
      
      navigate('/dashboard');
    } catch (err: unknown) {
      const errMsg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : 'Failed to create channel';
      toast.error(errMsg);
      console.error('Create channel error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-2xl mx-auto text-white">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Create Your Channel</h1>
      <p className="text-gray-400 mb-6">
        You need to create a channel before you can upload videos or customize your public profile.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Channel Banner (Horizontal image)
          </label>
          {bannerPreview ? (
            <div className="relative h-32 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
              <label className="absolute bottom-2 right-2 px-3 py-1 bg-black bg-opacity-70 text-xs text-white rounded cursor-pointer hover:bg-opacity-95">
                Change Banner
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 bg-dark-card border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
              <Image className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-gray-400 text-sm">Upload channel banner</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
            </label>
          )}
        </div>

        {/* Logo and Name Row */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo (Square)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-dark-card border border-dark-border rounded-full flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white hover:bg-[#2a2a2a] transition-colors">
                  Upload Logo
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            {/* Channel Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                {...register('channelName')}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. My Coding Channel"
              />
              {errors.channelName && (
                <p className="text-red-400 text-sm mt-1">{errors.channelName.message}</p>
              )}
            </div>

            {/* Handle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Handle (Username)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  {...register('handle')}
                  className="w-full pl-8 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="myhandle"
                />
              </div>
              {errors.handle && (
                <p className="text-red-400 text-sm mt-1">{errors.handle.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={5}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Tell viewers about your channel..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Channel'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChannel;
