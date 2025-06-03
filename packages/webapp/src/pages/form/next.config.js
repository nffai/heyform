module.exports = {
  basePath: '/f',
  transpilePackages: ['@heyform-inc/form-renderer'],
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    domains: ['*.b-cdn.net', '*.unsplash.com']
  },
  poweredByHeader: false,
  optimizeFonts: false
}
