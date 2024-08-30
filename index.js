const yargs = require('yargs');
const CachingProxyServer = require('./server');

yargs.command('start', 'Start the caching proxy server',
    {
        port: {
            describe: 'Port to run server on',
            demandOption: true,
            type: 'number',
        },
        origin: {
            describe: 'Origin server URL',
            demandOption: true,
            type: 'string',
        },
    },
    (argv) => {
        const {port, origin} = argv;
        const server = new CachingProxyServer(port, origin);
        server.start();
    }
)
.command('clear', 'Clear the cache',
    {},
    () => {
        const server = new CachingProxyServer();
        server.clearCache();
        console.log(`Cache're cleared`);
    }
)
.help()
.argv;