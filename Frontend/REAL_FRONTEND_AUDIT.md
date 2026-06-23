# REAL_FRONTEND_AUDIT.md - PlayTube Frontend Audit

This document provides a comprehensive audit of the PlayTube frontend codebase, validating everything against the actual running backend APIs and identifying broken, missing, and fake features.

## 📊 Summary of Current State

* **Completion Percentage**: **35%**
  * The project has a solid folder structure, routing, redux store setup, and visually complete pages.
  * However, **almost all API integrations are completely broken** due to singular vs plural route mismatches and wrong path assumptions.
  * Essential UX flows (loading states, persistent like/subscription statuses, channel creation) are missing or fake.

---

## 🔍 Page-by-Page Audit

### 🏠 Home Page (`Home.tsx`)
* **Does it work?** Partially. It attempts to load videos but fails due to API mismatches.
* **API Calls**: **Broken**. Calls `GET /videos` (plural) but backend expects `GET /api/video` (singular).
* **Loading/Error States**: Simple spinner/text alert. Skeletons are missing.
* **Fake/Placeholder code**: None, but it fails silently or displays the error screen immediately when calling the backend.

### 🔑 Login Page (`Login.tsx`)
* **Does it work?** Yes, the form and validation work.
* **API Calls**: **Working**. Calls `POST /auth/signin` which aligns with backend.
* **Token handling**: **Partially Working**. Saves tokens in `localStorage` but doesn't handle access token expiration/refresh automatically.
* **Error handling**: Displays raw Axios error message (e.g., "Request failed with status code 400") instead of the backend's validation message.

### 📝 Signup Page (`Signup.tsx`)
* **Does it work?** Form works. Profile picture preview works.
* **API Calls**: **Working**. Calls `POST /auth/signup` with `multipart/form-data`.
* **Error handling**: Displays raw Axios error instead of specific backend warnings.

### 📺 Watch Page (`Watch.tsx`)
* **Does it work?** UI loads and HLS player is configured correctly. However, interaction features are broken.
* **API Calls**: **Broken**. 
  * Fetch video details: Calls `GET /videos/:id` instead of `GET /api/video/:id`.
  * Toggle Like: Calls `POST /videos/like/:videoId` instead of `POST /api/video/like/:videoId`.
  * Comments: Calls `/comments/:videoId` instead of `/api/comment/video/:videoId` (GET) and `/api/comment/create/:videoId` (POST).
  * Subscribe: Calls `POST /channels/subscribe/:channelId` instead of `POST /api/subscription/toggle/:channelId`.
* **State Issues**: 
  * Likes count and subscribe buttons are hardcoded to "unliked" and "unsubscribed" on page load. The frontend never checks if the current user has already liked the video or subscribed to the channel.
  * No like status endpoint exists, meaning we must check if the video ID exists in the list of liked videos (`GET /api/video/liked/all`).
  * Subscribed status needs to call `GET /api/subscription/status/:channelId` on load.

### 📤 Upload Page (`Upload.tsx`)
* **Does it work?** UI works, but uploading will fail for users who haven't created a channel first.
* **API Calls**: **Broken**. Calls `POST /videos/upload` instead of `POST /api/video/upload`.
* **Progress Handling**: **Fake**. Simulates progress with a simple setInterval instead of actual Axios upload progress tracking.
* **Blocker**: Users without a channel cannot upload. The frontend does not provide any channel creation flow.

### 👤 Profile Page (`Profile.tsx`)
* **Does it work?** No, fails with a blank screen/error.
* **API Calls**: **Broken**. Calls `GET /channels/:handle` instead of `GET /api/channel/:handle`.
* **Data Parsing Bug**: `Profile.tsx` sets videos using `setVideos(data.videos)` but the backend returns videos inside the channel object as `data.channel.videos` and `data.channel.shorts`.
* **State Issues**: Like the watch page, initial subscription status is never loaded.

### 🔍 Search Page (`SearchResults.tsx`)
* **Does it work?** No.
* **API Calls**: **Broken**. Calls `GET /videos/search?q=query` instead of `GET /api/video/search?query=query`.

---

## 🛠️ Broken Features & Critical Discrepancies

1. **API Pluralization Mismatches**:
   * Frontend: `/videos/...`, `/channels/...`, `/comments/...`
   * Backend: `/api/video/...`, `/api/channel/...`, `/api/comment/...`, `/api/subscription/...`
2. **Search Query Parameter**:
   * Frontend expects `q` parameter, backend expects `query` parameter.
3. **Comment CRUD Paths**:
   * Frontend expects `/comments/:videoId` but backend routes comments under `/api/comment/video/:videoId` and `/api/comment/create/:videoId`.
4. **Subscription CRUD Paths**:
   * Frontend expects `/channels/subscribe/:channelId` but backend uses `/api/subscription/toggle/:channelId` and `/api/subscription/status/:channelId`.

---

## 🧩 Missing Features

1. **Channel Creation Flow**:
   * The backend requires users to have a channel to upload videos (`prisma.channel.findUnique`).
   * No page or modal exists in the frontend to call `POST /api/channel/create`.
2. **Persistent Like & Subscribe States**:
   * On watch/profile page load, buttons reset to unliked/unsubscribed because states are never fetched.
3. **Axios Interceptor Token Refresh**:
   * Backend has `POST /api/auth/refresh-token` but frontend does not attempt to refresh expired tokens in its interceptors.
4. **Actual Upload Progress**:
   * Uses a fake progress bar.
5. **Loading Skeletons**:
   * Needs video grids and watch page skeleton loaders.

---

## 📈 Technical Debt & Priority Fixes

### Priority 1: API Route & Service Alignment
* Update `api.ts` base configuration if needed.
* Rewrite `services/video.ts`, `services/channel.ts`, `services/comment.ts`, and `services/search.ts` to exactly match backend paths.

### Priority 2: Authentication & Refresh Token Logic
* Implement token refresh interceptor in `api.ts`.
* Extract and display proper backend error messages in Redux thunks.

### Priority 3: Channel Creation & Upload Integration
* Implement `/create-channel` page for users to initialize their channel.
* Link the channel state to the user profile and route to upload/channel page correctly.
* Use `onUploadProgress` in Axios to show actual file upload progress.

### Priority 4: Like/Subscribe State Initialization
* Retrieve liked videos list on watchers' page load to initialize like status.
* Query channel subscription status on load.

### Priority 5: UI Polish & Skeletons
* Design and implement rich skeleton screens for Home feed, Search results, and Watch page.
