import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyCodeDto {
  @ApiProperty({ description: "验证码", example: "1234" })
  @IsString()
  @Length(4, 4)
  code: string;
}
