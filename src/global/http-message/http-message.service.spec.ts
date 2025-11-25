import { Test, TestingModule } from '@nestjs/testing'
import { HttpMessageService } from './http-message.service'

describe('httpMessageService', () => {
  let service: HttpMessageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpMessageService],
    }).compile()

    service = module.get<HttpMessageService>(HttpMessageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
