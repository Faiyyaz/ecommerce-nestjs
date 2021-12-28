import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PasswordUtil } from 'src/utilities/password.util';
import { getConnection, getManager } from 'typeorm';
import { UserDto } from '../auth/user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  async findByEmail(email: string): Promise<User> {
    const connection = getManager();
    const user = await connection.findOne(User, { email: email });
    return user;
  }

  async createUser(userDto: UserDto): Promise<User> {
    const existingUser = await this.findByEmail(userDto.email);
    if (existingUser != null) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    } else {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        let user: User = User.create();
        user.firstName = userDto.firstName;
        user.lastName = userDto.lastName;
        user.email = userDto.email;
        user.password = await PasswordUtil.generatePassword(userDto.password);
        user = await queryRunner.manager.save(user);
        await queryRunner.commitTransaction();
        return user;
      } catch (err) {
        // since we have errors let's rollback changes we made
        await queryRunner.rollbackTransaction();
        if (err && err.code === 'ER_DUP_ENTRY') {
          throw new BadRequestException('User already exists');
        } else {
          throw new InternalServerErrorException('Something went wrong');
        }
      } finally {
        // you need to release query runner which is manually created:
        await queryRunner.release();
      }
    }
  }

  async getProfile(email: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser == null) {
      throw new NotFoundException();
    } else {
      return existingUser;
    }
  }
}
