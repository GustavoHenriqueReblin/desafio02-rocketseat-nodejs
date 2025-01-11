import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export interface User {
  id: string
  email: string
  password: string
  name: string
}

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/',
    // {
    //   preHandler: [checkSessionIdExists],
    // },
    async (_request) => {
      const users = await knex('users')
        .select('*') as User[]

      return { users }
    },
  )

  // app.get(
  //   '/:id',
    // {
    //   preHandler: [checkSessionIdExists],
    // },
  //   async (request) => {
  //     const getTransactionsParamsSchema = z.object({
  //       id: z.string().uuid(),
  //     })

  //     const { id } = getTransactionsParamsSchema.parse(request.params)

  //     const { sessionId } = request.cookies

  //     const transaction = await knex('transactions')
  //       .where({
  //         session_id: sessionId,
  //         id,
  //       })
  //       .first()

  //     return {
  //       transaction,
  //     }
  //   },
  // )

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    })

    const { email, password, name } = createUserBodySchema.parse(
      request.body,
    )

    // let sessionId = request.cookies.sessionId

    // if (!sessionId) {
    //   sessionId = randomUUID()

    //   reply.setCookie('sessionId', sessionId, {
    //     path: '/',
    //     maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    //   })
    // }

    await knex('users').insert({
      id: randomUUID(),
      email,
      password,
      name,
      // session_id: sessionId,
    }).catch(() => {
      reply.status(500).send()
    })

    return reply.status(201).send()
  })
}
