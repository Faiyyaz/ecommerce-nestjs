import { IsNotEmpty } from 'class-validator';

export class SubCategoryDto {
  @IsNotEmpty()
  name: string;
  description: string;
  @IsNotEmpty()
  code: string;
  @IsNotEmpty()
  parentCategoryCode: string;
}
