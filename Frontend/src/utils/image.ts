const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const BASE_UPLOADS_URL =
  BASE_URL.replace("/api", "");

export const getImageUrl = (
  url: string | null | undefined
): string => {
  if (!url) {
    return "/default-user.png";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BASE_UPLOADS_URL}${url}`;
  }

  return `${BASE_UPLOADS_URL}/${url}`;
};

export const getFallbackAvatar = (): string => {
  return "/default-user.png";
};