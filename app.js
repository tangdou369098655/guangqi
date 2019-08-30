const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const httpProxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
// error handler
onerror(app)
app.use(async (ctx, next) => {
  if (ctx.url.startsWith('/SOC')) { //匹配有api字段的请求url
    ctx.respond = false // 绕过koa内置对象response ，写入原始res对象，而不是koa处理过的response
    await k2c(httpProxy({
      target: 'https://uestclab307.kmdns.net:18200/',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/': ''
      }
    }
    ))(ctx, next);
  }
  await next()
})
 
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
