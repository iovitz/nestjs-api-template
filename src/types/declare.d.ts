import { FastifyReply as FastifyReplyType, FastifyRequest as FastifyRequestType } from 'fastify'

declare global {
  type FastifyRequest = FastifyRequestType
  type FastifyReply = FastifyReplyType
}
