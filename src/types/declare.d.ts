import { FastifyReply as FastifyReplyType, FastifyRequest as FastifyRequestType } from 'fastify'

declare global {
  type FastifyRequest = FastifyRequestType & {
    user?: {
      id: string
    }
    replyRef: FastifyReplyType
  }
  type FastifyReply = FastifyReplyType
}
