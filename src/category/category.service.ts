import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getConnection, getManager } from 'typeorm';
import { CategoryDto } from './category.dto';
import { Category } from './category.entity';
import { MarketingAttribute } from './marketing.attribute.entity';
import { SubCategoryDto } from './sub.category.dto';

@Injectable()
export class CategoryService {
  async createCategory(categoryDto: CategoryDto): Promise<Category> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Creating marketingAttribute
      let marketingAttribute: MarketingAttribute = MarketingAttribute.create();
      marketingAttribute.name = categoryDto.name;
      marketingAttribute.description = categoryDto.description;
      marketingAttribute = await queryRunner.manager.save(marketingAttribute);
      // Creating category
      let category: Category = Category.create();
      category.code = categoryDto.code;
      category.marketingAttribute = marketingAttribute;
      category = await queryRunner.manager.save(category);
      await queryRunner.commitTransaction();
      return category;
    } catch (err) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Category already exists');
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  async createSubCategory(subCategoryDto: SubCategoryDto): Promise<Category> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Checking if category already exists
      const existingCategory = await Category.findOne({
        code: subCategoryDto.parentCategoryCode,
      });
      if (existingCategory != undefined && existingCategory != null) {
        // Creating marketingAttribute
        let marketingAttribute: MarketingAttribute =
          MarketingAttribute.create();
        marketingAttribute.name = subCategoryDto.name;
        marketingAttribute.description = subCategoryDto.description;
        marketingAttribute = await queryRunner.manager.save(marketingAttribute);
        // Creating sub category
        let category: Category = Category.create();
        category.code = subCategoryDto.code;
        category.marketingAttribute = marketingAttribute;
        category.parent = existingCategory;
        category = await queryRunner.manager.save(category);
        await queryRunner.commitTransaction();
        return category;
      } else {
        await queryRunner.release();
        throw new BadRequestException('Category already exists');
      }
    } catch (err) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Category already exists');
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  async getCategories(): Promise<Category[]> {
    const connection = getManager();
    const categories = await connection
      .getTreeRepository(Category)
      .findTrees({ relations: ['marketingAttribute'] });
    return categories;
  }
}
