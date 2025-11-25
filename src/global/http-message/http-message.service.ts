import { Inject, Injectable, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REQUEST } from '@nestjs/core'

@Injectable({ scope: Scope.REQUEST })
export class HttpMessageService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: FastifyRequest,
  ) {}

  get reply() {
    return this.request.replyRef
  }

  setCookie(
    key: CookieKeys,
    value: string,
    options: CookieOptions = {},
  ): void {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'prod',
      sameSite: 'strict',
      path: '/',
    }

    const finalOptions = { ...defaultOptions, ...options }

    this.reply.setCookie(key, value, finalOptions)
  }

  getCookie(name: string): string | undefined {
    return this.request.cookies?.[name]
  }

  clearCookie(
    key: CookieKeys,
    options: CookieOptions = {},
  ): void {
    const defaultOptions: CookieOptions = {
      path: '/',
    }

    const finalOptions = { ...defaultOptions, ...options }

    this.reply.clearCookie(key, finalOptions)
  }
}

type CookieKeys = 'session'

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  maxAge?: number
  path?: string
  domain?: string
  expires?: Date
}
