const Koa = require('koa')
const Router = require('koa-router')
const bindRouter = require('./routes')

const app = new Koa()
const router = new Router()

bindRouter(router)
app.use(router.routes())
app.use(router.allowedMethods())


app.listen(9090)