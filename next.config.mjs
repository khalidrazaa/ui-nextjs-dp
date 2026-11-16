const codespaceHost = process.env.CODESPACE_NAME
  ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev'}`
  : undefined;

const fastApiUrl = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the existing client-rendered workspace's behavior during migration.
  reactStrictMode: false,
  devIndicators: false,
  allowedDevOrigins: codespaceHost ? [codespaceHost] : [],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${fastApiUrl}/api/:path*`,
      },
    ];
  },
  webpack(config, { dev }) {
    // Preserve the existing opt-out from file watching during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = { ...config.watchOptions, ignored: ['**/*'] };
    }
    return config;
  },
};

export default nextConfig;
