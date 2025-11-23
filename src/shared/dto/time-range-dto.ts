import { Transform } from 'class-transformer'
import { IsDate, IsOptional } from 'class-validator'

export class TimeRangeDto {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (!value)
      return undefined
    if (value instanceof Date)
      return value
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  })
  startTime?: Date

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (!value)
      return undefined
    if (value instanceof Date)
      return value
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  })
  endTime?: Date
}
