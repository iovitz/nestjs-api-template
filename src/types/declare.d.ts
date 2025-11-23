import { FastifyReply as FastifyReplyType, FastifyRequest as FastifyRequestType } from 'fastify'

declare global {
  type FastifyRequest = FastifyReplyType
  type FastifyReply = FastifyRequestType
}
