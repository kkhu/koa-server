
const koa = require('koa');
const router = require('koa-router')();
const wsServer = require('ws').Server;
const proxy = require('koa-proxy');
const serve = require('koa-static');
const compress = require('koa-compress');
const config = require('./conf/web');
const https = require("https");
const fs = require("fs");
const app = new koa();

const proxyConfig = config.server.proxy;

console.log('config: \n'+ JSON.stringify(config.server));

const wss = new wsServer({port: config.server.socket.listen});

app.use(serve(config.server.www, {
	index: config.server.index, 
	maxage: (1000 * 60 * 30),
	hidden: true,
	gzip: config.server.gzip	
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.use(compress({
	filter: function (content_type) {
        return /javascript/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));

if (proxyConfig.use) {
    app.use(proxy({
        host: proxyConfig.pass, 
        match: proxyConfig.match      
    }));
}

// Broadcast to all.
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};
  
// websocket 
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('msg:' + message);
        ws.send(message);
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    })
    ws.send(' inited... ');
});

app.use(async (ctx, next) => {
    await next;
});

router.post('/register', async (ctx, next) => {
    ctx.body = '{"result": {"succ": true}}';
});

router.get('/login',  async (ctx, next) => {
    ctx.body = '{"result": {"succ": true, isLogin: true}}';
});

app.listen(config.server.listen);

const options = {
	key: fs.readFileSync("./server.key", "utf8"),
	cert: fs.readFileSync("./server.cert", "utf8")
};
https.createServer(options, app.callback()).listen(443);

console.log('socket.listen:' + config.server.socket.listen + '\n' + 
			'listen: ' 		 + config.server.listen + '\n' + 
            'app started... ');
