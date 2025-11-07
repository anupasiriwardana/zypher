/** @type {import('next').NextConfig} */
const nextConfig = {
    images : {
        domains : ["cdn.pixabay.com", "images.pexels.com", 'lh3.googleusercontent.com', 'avatars.githubusercontent.com']
    },
    experimental: {
      staleTimes: {
        dynamic: 30,
        static: 180,
      },
    },
};

export default nextConfig;
