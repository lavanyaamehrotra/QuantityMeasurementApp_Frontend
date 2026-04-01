// lite-server configuration
// Proxies /api/* calls to the .NET backend on port 5000

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  port: 3000,
  server: {
    baseDir: './src',
  },
  middleware: [
    createProxyMiddleware('/api', {
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
    }),
  ],
};