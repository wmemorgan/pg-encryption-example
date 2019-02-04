import Koa from 'koa'
import Router from 'koa-router'
import jsonBody from 'koa-json-body'
import { postgresMiddleware, postgres } from './postgres'
import { schema, insert, retrieve, retrieveAll, update, deleteId } from './models'

import * as swagger from 'swagger2'
import { ui } from 'swagger2-koa'

const app = new Koa()
  .use(jsonBody())
  .use(postgresMiddleware(schema))
const port = 9001
const router = new Router() 

const spec = swagger.loadDocumentSync('./swagger.yaml')
if (!swagger.validateDocument(spec)) {
  throw Error(`Invalid Swagger File`)
}

router 
  .post('/cards', async ctx => {
    const data = ctx.request.body 
    const id = await insert(postgres(ctx), data.name)
    ctx.status = 200
    ctx.body = id[0].id
  })
  .get('/cards', async ctx => {
    const data = await retrieveAll(postgres(ctx))
    ctx.status = 200
    ctx.body = data
  })
  .get('/cards/:id', async ctx => {
    const data = await retrieve(postgres(ctx), ctx.params.id)
    ctx.status = 200
    ctx.body = data
  })
  .put('/cards/:id', async ctx => {
    const data = ctx.request.body 
    await update(postgres(ctx), data.name, ctx.params.id)
    ctx.status = 204
  })
  .delete(`/cards/:id`, async ctx => {
    const card = await deleteId(postgres(ctx), ctx.params.id)
    if (card.length === 0) {
      ctx.body = 'Delete successful!'
    }
  })
  .get('/swagger.json', ctx => {
    ctx.body = spec
  })
 
app.use(router.routes())
app.use(router.allowedMethods())
app.use(ui(spec))

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
  