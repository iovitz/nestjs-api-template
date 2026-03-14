import {
	FastifyReply as FastifyReplyType,
	FastifyRequest as FastifyRequestType,
} from "fastify";

declare global {
	interface AuthedAccount {
		id: string;
		session: string;
	}
	type FastifyRequest = FastifyRequestType & {
		account?: AuthedAccount;
		replyRef: FastifyReplyType;
	};
	type FastifyReply = FastifyReplyType;
}
