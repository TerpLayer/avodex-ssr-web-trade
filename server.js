// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const httpProxy = require("http-proxy");
const HttpsProxyAgent = require('https-proxy-agent');
const proxyApi = require("./proxyApi.json");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 8084;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const proxy = httpProxy.createProxyServer({});
const agent = new HttpsProxyAgent('http://127.0.0.1:9999');

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      const reg = new RegExp("^/(" + proxyApi.join("|") + ")/.*");

      if (reg.test(pathname)) {
        console.log("proxy.web pathname =", pathname);
        proxy.web(req, res, {
          agent,
          target: 'https://www.cexdemo.com',
          changeOrigin: true,
          ws: true,
          cookieDomainRewrite: 'localhost',
        });
      } else if (pathname === "/b") {
        await app.render(req, res, "/b", query);
      } else {
        await handle(req, res, parsedUrl);
      }


    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
