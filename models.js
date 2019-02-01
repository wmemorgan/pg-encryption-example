import fs from 'fs'

const pubKey = fs.readFileSync('./public.key', toString)
const secretKey = fs.readFileSync('./secret.key', toString)

export const schema = {
  create: [
    `CREATE TABLE IF NOT EXISTS cards(
      id BIGSERIAL PRIMARY KEY,
      name BYTEA
    )`,
    `CREATE EXTENSION IF NOT EXISTS pgcrypto`
    ],
  drop: [
    `DROP TABLE IF EXISTS cards`
  ]
}

export async function insert(pg, data) {
  return pg.rows(
    `INSERT INTO cards(name) VALUES (pgp_pub_encrypt($1, dearmor(${pubKey}))) RETURNING id`, data
  )
}

export async function retrieve(pg, id) {
  return pg.rows(`SELECT pgp_pub_decrypt(name, dearmor(${secretKey})) AS name from cards where id = $1`, id)
}

export async function retrieveAll(pg) {
  return pg.rows(`SELECT id, pgp_pub_decrypt(name, dearmor(${secretKey})) AS name from cards`)
}

export async function update(pg, data, id) {
  return pg.rows(`UPDATE cards SET name = pgp_pub_encrypt(($1, dearmor(${pubKey}))) WHERE id = $2`, data, id)
}