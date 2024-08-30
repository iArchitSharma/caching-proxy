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
        const url = `${this.origin}${this.url}`;
        const cachedResponse = this.cache.get(url);

        if(cachedResponse){
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).send(cachedResponse.data);
        }

        try {
            const response = await axios.get(url);
            this.cache.set(url, response);
            res.setHeader('X-Cache', 'MISS');
            res.status(response.status).send(response.data);
        }catch(error){
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