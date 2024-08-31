const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

class CachingProxyServer {
    constructor(port, origin){
        this.port = port;
        this.origin = origin;
        this.cache = new NodeCache({stdTTL:3600});
        this.app = express();
    }

    async handleRequest(req, res){
        const url = `${this.origin.replace(/\/+$/, '')}/${req.originalUrl.replace(/^\/+/, '')}`;
        console.log(`Forwarding request to: ${url}`);  // Log the forwarded URL
        const cachedResponse = this.cache.get(url);

        if(cachedResponse){
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).send(cachedResponse.data);
        }

        try {
            const response = await axios.get(url);
            const responseData = response.data; // Simplified data
            this.cache.set(url, responseData);
            res.setHeader('X-Cache', 'MISS');
            res.status(response.status).send(responseData);
          } catch (error) {
            console.error(`Request failed with status code: ${error.response ? error.response.status : 500}`);
            res.status(error.response ? error.response.status : 500).send(error.message);
          }
        }

    start(){
        this.app.get('*', this.handleRequest.bind(this));
        this.app.listen(this.port, () => {
            console.log(`Caching Proxy Server running on port ${this.port}`);
          });
    }

    clearCache() {
        this.cache.flushAll();
      }
}

module.exports = CachingProxyServer;