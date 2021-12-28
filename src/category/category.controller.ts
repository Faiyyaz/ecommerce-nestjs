import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Public } from 'src/auth/public.route';
import { CategoryDto } from './category.dto';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { SubCategoryDto } from './sub.category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async createCategory(@Body() categoryDto: CategoryDto): Promise<Category> {
    return this.categoryService.createCategory(categoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-sub-category')
  async createSubCategory(
    @Body() subCategoryDto: SubCategoryDto,
  ): Promise<Category> {
    return this.categoryService.createSubCategory(subCategoryDto);
  }

  @Public()
  @Get('categories')
  async getCategories(): Promise<Category[]> {
    return this.categoryService.getCategories();
  }
}
