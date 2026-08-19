/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  webpack(config, { isServer, webpack }) {
    // MuPDF.js contains guarded Node-only imports for its optional filesystem
    // helpers. The web editor never calls those helpers, so omit them from the
    // browser bundle while retaining the WebAssembly implementation.
    if (!isServer) {
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^node:fs$/ }));
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^module$/ }));
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, module: false };
      config.output.environment = { ...config.output.environment, asyncFunction: true };
    }
    return config;
  },
};

module.exports = nextConfig;
