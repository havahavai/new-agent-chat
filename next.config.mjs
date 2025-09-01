/** @type {import('next').NextConfig} */
import nrExternals from 'newrelic/load-externals.js';

const nextConfig = {
  serverExternalPackages: ['newrelic'],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  webpack: (config) => {
    nrExternals(config)
    return config
  }
};

export default nextConfig;
