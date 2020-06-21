
const koa = require('koa');
const router = require('koa-router')();
const wsServer = require('ws').Server;
const serve = require('koa-static');
const compress = require('koa-compress');
const webConfig = require('./conf/web').config;
const https = require("https");
const fs = require("fs");
const app = new koa();

console.log('config: \n'+ JSON.stringify(webConfig));

const wss = new wsServer({port: webConfig.server.socket.listen});

app.use(serve(webConfig.server.www, {
	index: webConfig.server.index, 
	maxage: (1000 * 60 * 30),
	hidden: true,
	gzip: webConfig.server.gzip	
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

app.listen(webConfig.server.listen);

const options = {
	key: fs.readFileSync("./server.key", "utf8"),
	cert: fs.readFileSync("./server.cert", "utf8")
};
https.createServer(options, app.callback()).listen(443);

console.log('socket.listen:' + webConfig.server.socket.listen + '\n' + 
			'listen: ' 		 + webConfig.server.listen + '\n' + 
            'app started... ');
