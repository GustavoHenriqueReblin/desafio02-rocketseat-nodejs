import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkUpdateMealBody(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateMealBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    isInTheDiet: z.boolean().optional(),
  })

  const checkUpdateMealBody = updateMealBodySchema.safeParse(request.body)
  if (!checkUpdateMealBody.success) {
    return reply
      .status(400)
      .send(
        'Informações obrigatórias não foram preenchidas: ' +
          JSON.stringify(checkUpdateMealBody.error.format(), null, 2),
      )
  }
}

export async function checkCreateMealBody(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    isInTheDiet: z.boolean(),
  })

  const checkCreateMealsBody = createMealBodySchema.safeParse(request.body)
  if (!checkCreateMealsBody.success) {
    return reply
      .status(400)
      .send(
        'Informações obrigatórias não foram preenchidas: ' +
          JSON.stringify(checkCreateMealsBody.error.format(), null, 2),
      )
  }
}
