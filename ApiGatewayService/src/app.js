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

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

// Routes to other services
app.use('/userProfile', (req, res) => proxy.web(req, res, { target: 'http://localhost:5001/api' }));
app.use('/inventory', (req, res) => proxy.web(req, res, { target: 'http://localhost:3001' }));
app.use('/cart', (req, res) => proxy.web(req, res, { target: 'http://localhost:8080/cart' }));

module.exports = app;