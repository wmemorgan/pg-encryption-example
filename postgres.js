import PgAsync from 'pg-async'
import one from 'once'

// const PgAsync = require('pg-async')
// const one = require('once')

async function setup(pg, schema) {
  await pg.transaction(async tx => {
    const { drop, create } = schema
    if (drop) {
      for (const q of drop) {
        await tx.query
      }
    }
    if (create) {
      for (const q of create) {
        await tx.query(q)
      }
    }
  })
}

export function postgresMiddleware (schema) {
  const pg = new PgAsync({ connectionString: "postgres://postgres@localhost:5432/securedb"})
  const setupSchema = one(setup)
  return async (ctx, next) => {
    await setupSchema(pg, schema)
    ctx._postgres = pg
  }
}

export function postgres (ctx) {
  return ctx._postgres
}