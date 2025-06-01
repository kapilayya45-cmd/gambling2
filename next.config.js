/** @type {import('next').NextConfig} */
const nextConfig = {
  // Config for dynamic rendering (SSR/ISR)
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization config
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/home',
        permanent: true,
      },
    ];
  },
  
  // Configure webpack to handle SVG files
  webpack(config) {
    // Improved SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    // preserve viewBox and other attributes
                    removeViewBox: false,
                    cleanupIDs: false
                  }
                }
              }
            ]
          },
          titleProp: true,
          ref: true
        }
      }]
    });

    return config;
  },
};

module.exports = nextConfig;
