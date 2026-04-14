import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BookCreateDto {
  @ApiProperty({ example: 'Neuromancer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
