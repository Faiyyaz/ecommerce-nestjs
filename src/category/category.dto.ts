import { IsNotEmpty } from 'class-validator';

export class CategoryDto {
  @IsNotEmpty()
  name: string;
  description: string;
  @IsNotEmpty()
  code: string;
}
