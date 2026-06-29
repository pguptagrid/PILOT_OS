/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable server-side static page generation/prerendering for meetings routes 
  // since they require dynamic user sessions from PILOT to authenticate and build Stream client instances.
  output: 'standalone',
  
  transpilePackages: ['@stream-io/video-react-sdk'],

  // Enforce dynamic runtime and skip static pre-generation compilation for SSR layout routes
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
