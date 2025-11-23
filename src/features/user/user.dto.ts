import { IsString, Length } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @Length(2, 10)
  name: string

  @IsString()
  @Length(4, 32)
  email: string

  @IsString()
  @Length(6, 20)
  password: string

  @IsString()
  @Length(4, 4)
  code: string
}
