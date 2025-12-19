import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class SortDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn([SortOrder.ASC, SortOrder.DESC])
  sortOrder?: SortOrder = SortOrder.ASC;
}

export class SortFieldDto {
  @IsString()
  field: string;

  @IsIn([SortOrder.ASC, SortOrder.DESC])
  order: SortOrder;
}

export class MultiSortDto {
  @IsOptional()
  sort?: SortFieldDto[];
}
