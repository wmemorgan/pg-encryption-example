import Koa from 'koa'
import Router from 'koa-router'
import jsonBody from 'koa-json-body'
import { postgresMiddleware, postgres } from './postgres'
import { schema, insert, retrieve, retrieveAll, update, deleteId } from './models'

//import swaggerUi from 'koa2-swagger-ui'
import { ui, validate, router as swaggerRouter, Router as SwaggerRouter } from 'swagger2-koa'
import * as swagger from 'swagger2'

const app = new Koa()
  .use(jsonBody())
  // .use(
  //   swaggerUi({
  //     routePrefix: '/',
  //     swaggerOptions: {
  //       url: '/swagger.json',
  //     },
  //   })
  // )
  .use(postgresMiddleware(schema))
const port = 9001
const router = new Router() 

const spec = swagger.loadDocumentSync('./swagger.yaml')
if (!swagger.validateDocument(spec)) {
  throw Error(`Invalid Swagger File`)
}
console.log(`swagger spec: ${JSON.stringify(spec)}`)
//app.use(ui(spec))

router 
  .post('/cards', async ctx => {
    const data = ctx.request.body 
    const id = await insert(postgres(ctx), data.name)
    ctx.status = 200
    ctx.body = id[0].id
  })
  .get('/cards', async ctx => {
    console.log(`CTX info for retrieveall: ${JSON.stringify(ctx)}`)
    const data = await retrieveAll(postgres(ctx))
    ctx.status = 200
    ctx.body = data
  })
  .get('/cards/:id', async ctx => {
    console.log(`CTX info: ${JSON.stringify(ctx.params)}`)
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
    console.log(`Get swagger.json`)
    ctx.body = spec
  })
  .get('/hello', ctx => {
    console.log(`get request received ${JSON.stringify(ctx)}`)
    ctx.body = `Hello World!!!`
  })
 
app.use(router.routes())
app.use(router.allowedMethods())
app.use(ui(spec))

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
  