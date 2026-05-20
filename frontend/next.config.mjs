/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@met4citizen/talkinghead', 'three'],
  webpack: (config) => {
    // Allow TalkingHead ESM modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
};

export default nextConfig;
