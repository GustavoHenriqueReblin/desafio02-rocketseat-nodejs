import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { checkIdInParameters } from '../middlewares/check-id-in-parameters'
import { checkCreateMealBody, checkUpdateMealBody } from '../middlewares/meals'

export interface Meal {
  id: string
  userId: string
  name: string
  description: string
  date: Date
  isInTheDiet: boolean
}

export async function mealsRoutes(app: FastifyInstance) {
  // Get a meal list
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const user = await knex('users').where({ sessionId }).first()

      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const meals = await knex('meals').where('userId', user.id).select('*')
      return { meals }
    },
  )

  // Get a meal
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists, checkIdInParameters],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const { id } = request.params as { id: string }
      const meal = await knex('meals')
        .where({
          userId: user.id,
          id,
        })
        .first()

      return {
        meal,
      }
    },
  )

  // Create meal
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists, checkCreateMealBody],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const { name, description, isInTheDiet } = request.body as {
        name: string
        description: string
        isInTheDiet: boolean
      }
      await knex('meals')
        .insert({
          id: randomUUID(),
          userId: user.id,
          name,
          description,
          date: new Date(),
          isInTheDiet,
        })
        .catch((error) => {
          reply.status(500).send('Falha ao criar a refeição: ' + error)
        })

      return reply.status(201).send('Refeição criada com sucesso')
    },
  )

  // Update a meal
  app.put(
    '/:id',
    {
      preHandler: [
        checkSessionIdExists,
        checkIdInParameters,
        checkUpdateMealBody,
      ],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const { id } = request.params as { id: string }
      const { name, description, date, isInTheDiet } = request.body as {
        name?: string
        description?: string
        date?: Date
        isInTheDiet?: boolean
      }
      await knex('meals')
        .where({
          userId: user.id,
          id,
        })
        .update({
          name,
          description,
          date,
          isInTheDiet,
        })
        .catch((error) => {
          reply.status(500).send('Falha ao atualizar a refeição: ' + error)
        })

      return reply.status(201).send('Refeição atualizada com sucesso')
    },
  )

  // Delete a meal
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists, checkIdInParameters],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const { id } = request.params as { id: string }
      await knex('meals')
        .where({
          userId: user.id,
          id,
        })
        .delete()
        .catch((error) => {
          reply.status(500).send('Falha ao deletar a refeição: ' + error)
        })

      return reply.status(201).send('Refeição deletada com sucesso')
    },
  )
}
