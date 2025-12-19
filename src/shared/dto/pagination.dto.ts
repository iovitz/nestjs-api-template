import { Transform } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class PaginationDto {
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number;

  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset: number;
}
