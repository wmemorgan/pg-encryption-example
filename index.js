import Koa from 'koa'
import Router from 'koa-router'
import jsonBody from 'koa-json-body'
import { postgresMiddleware, postgres } from './postgres'
import { schema, insert, retrieve, retrieveAll, update } from './models'

// const Koa = require('koa')
// const Router = require('koa-router')
// const jsonBody = require('koa-json-body')
// const { postgresMiddleware, postgres } = require('./postgres')
// const { schema, insert, retrieve, retrieveAll, update } = require('./models')

const app = new Koa()
  .use(jsonBody())
  .use(postgresMiddleware(schema))
const port = 8080 
const router = new Router() 

router 
  .post('/cards', async ctx => {
    const data = ctx.request.body 
    const id = await insert(postgres(ctx), data.name)
    ctx.status = 200
    ctx.body = id[0].id
  })
  .get('/cards', async ctx => {
    const data = retrieveAll(postgres(ctx))
    ctx.status = 200
    ctx.body = data
  })
  .get('/cards:id', async ctx => {
    const data = retrieve(postgres(ctx), ctx.params.id)
    ctx.status = 200
    ctx.body = data
  })
  .put('/cards', async ctx => {
    const data = ctx.request.body 
    await update(postgres(ctx), data.name, ctx.params.id)
    ctx.status = 204
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
  app.listen(port, () => {
    console.log(`Server started at ${port}`)
  })
  