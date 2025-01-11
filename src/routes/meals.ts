import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

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
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const checkMealParams = getMealParamsSchema.safeParse(request.params)
      if (!checkMealParams.success) {
        reply
          .status(400)
          .send(
            'Id não informado: ' +
              JSON.stringify(checkMealParams.error.format(), null, 2),
          )
        return
      }

      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const meal = await knex('meals')
        .where({
          userId: user.id,
          id: checkMealParams.data.id,
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
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isInTheDiet: z.boolean(),
      })

      const checkMealsBody = createMealBodySchema.safeParse(request.body)
      if (!checkMealsBody.success) {
        reply
          .status(400)
          .send(
            'Informações obrigatórias não foram preenchidas: ' +
              JSON.stringify(checkMealsBody.error.format(), null, 2),
          )
        return
      }

      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const { name, description, isInTheDiet } = checkMealsBody.data
      await knex('meals')
        .insert({
          id: randomUUID(),
          userId: user.id,
          name,
          description,
          date: new Date(),
          isInTheDiet,
        })
        .catch(() => {
          reply.status(500).send('Falha ao criar a refeição')
        })

      return reply.status(201).send('Refeição criada com sucesso')
    },
  )

  // Update a meal
  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        isInTheDiet: z.boolean().optional(),
      })

      const checkUpdateMealParams = updateMealParamsSchema.safeParse(
        request.params,
      )
      if (!checkUpdateMealParams.success) {
        reply
          .status(400)
          .send(
            'Id não informado: ' +
              JSON.stringify(checkUpdateMealParams.error.format(), null, 2),
          )
        return
      }

      const checkUpdateMealBody = updateMealBodySchema.safeParse(request.body)
      if (!checkUpdateMealBody.success) {
        reply
          .status(400)
          .send(
            'Informações obrigatórias não foram preenchidas: ' +
              JSON.stringify(checkUpdateMealBody.error.format(), null, 2),
          )
        return
      }

      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      const { name, description, date, isInTheDiet } = checkUpdateMealBody.data
      await knex('meals')
        .where({
          userId: user.id,
          id: checkUpdateMealParams.data.id,
        })
        .update({
          name,
          description,
          date,
          isInTheDiet,
        })

      return reply.status(201).send('Refeição atualizada com sucesso')
    },
  )

  // Delete a meal
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const checkDeleteMealParams = deleteMealParamsSchema.safeParse(
        request.params,
      )
      if (!checkDeleteMealParams.success) {
        reply
          .status(400)
          .send(
            'Id não informado: ' +
              JSON.stringify(checkDeleteMealParams.error.format(), null, 2),
          )
        return
      }

      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({ sessionId }).first()
      if (!user) {
        reply.status(400).send('Usuário não encontrado')
        return
      }

      await knex('meals')
        .where({
          userId: user.id,
          id: checkDeleteMealParams.data.id,
        })
        .delete()

      return reply.status(201).send('Refeição deletada com sucesso')
    },
  )
}
