// api-gateway/index.js
const express = require("express");
const httpProxy = require('http-proxy');
const app = express();
const proxy = httpProxy.createProxyServer();

proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  });

// Use JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

// Routes to other services
app.use('/userProfile', (req, res) => proxy.web(req, res, { target: 'http://localhost:3001/api' }));
app.use('/inventoryService', (req, res) => proxy.web(req, res, { target: 'http://localhost:3002' }));
app.use('/cartService', (req, res) => proxy.web(req, res, { target: 'http://localhost:3003/api/cart' }));

// Handle 404 errors
app.use((req, res) => {
    console.error(`404 error: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found' });
});

module.exports = app;





// const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");

// const app = express();

// // Middleware
// app.use(express.json());

// // Proxy configuration
// const userProfileServiceProxy = createProxyMiddleware({
//   target: "http://localhost:3001",
//   changeOrigin: true,
//   pathRewrite: {
//     "^/api/user": "/api", // rewrite path
//   },
// });

// const inventoryServiceProxy = createProxyMiddleware({
//   target: "http://localhost:3002",
//   changeOrigin: true,
//   pathRewrite: {
//     "^/api/books": "/api/books", // rewrite path
//   },
// });

// const cartServiceProxy = createProxyMiddleware({
//   target: "http://localhost:3003",
//   changeOrigin: true,
//   pathRewrite: {
//     "^/api/cart": "/api/cart", // rewrite path
//   },
// });

// // Routes
// app.use("/api/user", userProfileServiceProxy);
// app.use("/api/books", inventoryServiceProxy);
// app.use("/api/cart", cartServiceProxy);

// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));