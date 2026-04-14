import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UserReturnBookRequestDto {
  @ApiProperty({ example: 8, description: 'Score of the book' })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  @Min(1)
  @Max(10)
  score: number;
}
