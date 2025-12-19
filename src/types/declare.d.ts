import { FastifyReply as FastifyReplyType, FastifyRequest as FastifyRequestType } from "fastify";

declare global {
  interface AuthedUser {
    id: string;
    session: string;
  }
  type FastifyRequest = FastifyRequestType & {
    user?: AuthedUser;
    replyRef: FastifyReplyType;
  };
  type FastifyReply = FastifyReplyType;
}
