import { IsString, Length } from 'class-validator'
import { PaginationDto } from 'src/shared/dto/pagination.dto'

export class GetBookDto extends PaginationDto {}

export class AddBookDto {
  @IsString()
  @Length(1, 50)
  name: string
}
