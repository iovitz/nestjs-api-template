import {
  IsDateString,
  IsInt,
  IsISBN,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import { PaginationDto } from "src/shared/dto/pagination.dto";

export class CreateBookDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsString()
  @Length(1, 100)
  author: string;

  @IsString()
  @Length(1, 100)
  publisher: string;

  @IsISBN()
  isbn: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsDateString()
  @IsOptional()
  publishDate?: Date;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(9999)
  pages?: number;
}

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  @Length(1, 200)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  author?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  publisher?: string;

  @IsISBN()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsDateString()
  @IsOptional()
  publishDate?: Date;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(9999)
  pages?: number;
}

export class BookQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @Length(0, 200)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  author?: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  publisher?: string;
}
