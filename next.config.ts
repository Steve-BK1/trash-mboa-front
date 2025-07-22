const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^\/(_next|favicon\.ico|manifest\.json|logo|vercel|window|file|globe|sw\.js)/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      urlPattern: /^\/$|^\/dashboard.*|^\/login$|^\/register$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
        },
      },
    },
  ],
});

const nextConfig = {
  // ...autres options Next.js si besoin
};

module.exports = withPWA(nextConfig);
