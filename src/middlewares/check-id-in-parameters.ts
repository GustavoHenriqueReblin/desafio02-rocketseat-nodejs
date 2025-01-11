import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkIdInParameters(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const checkParams = paramsSchema.safeParse(request.params)
  if (!checkParams.success) {
    return reply
      .status(400)
      .send(
        'Id não informado: ' +
          JSON.stringify(checkParams.error.format(), null, 2),
      )
  }
}
