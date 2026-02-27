import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Set the root directory to the current project directory
    root: 'C:\\Users\\mustapha\\Desktop\\STations\\stations',
  },
  // Optimize for development to prevent resource issues
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Disable React duplicate instance issue
  webpack: (config, { dev }) => {
    // Resolve React duplicate instance issue
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'react',
      'react-dom': 'react-dom',
    };
    
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
            },
          },
        },
      };
    }
    return config;
  },
  // Disable DevTools to fix React compatibility
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
