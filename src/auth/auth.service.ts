import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/auth/user.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { PasswordUtil } from 'src/utilities/password.util';
import { jwtConstants } from './jwt.constants';
import { LoginDto } from './login.dto';
import { LoginUserDto } from './login.user.dto';
import { TokenDto } from './token.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userService.findByEmail(loginUserDto.email);
    if (user != null && user != undefined) {
      const isMatch: boolean = await PasswordUtil.verifyPassword(
        loginUserDto.password,
        user.password,
      );
      if (isMatch) {
        return user;
      } else {
        throw new NotFoundException('User not found');
      }
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginDto> {
    const user = await this.validateUser(loginUserDto);
    if (user != null) {
      const payload = { email: user.email, sub: user.id };

      const refreshToken = await this.generateRefreshToken(user.email, user.id);

      return new LoginDto(user, this.jwtService.sign(payload), refreshToken);
    }
  }

  async createUser(userDto: UserDto): Promise<User> {
    const hashedPassword = await PasswordUtil.generatePassword(
      userDto.password,
    );
    userDto.password = hashedPassword;
    const user = await this.userService.createUser(userDto);
    if (user != null) {
      return user;
    } else {
      throw new BadRequestException('User already registered');
    }
  }

  async refreshToken(token: string): Promise<TokenDto> {
    if (token != null && token != undefined) {
      token = token['refreshToken'];
      const user = await this.jwtService.verify(token);
      if (user != null) {
        const payload = { email: user['email'], sub: user['id'] };
        const newToken = this.jwtService.sign(payload);
        const refreshToken = await this.generateRefreshToken(
          user['email'],
          user['id'],
        );
        return new TokenDto(newToken, refreshToken);
      } else {
        throw new UnauthorizedException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  private async generateRefreshToken(
    email: string,
    id: number,
  ): Promise<string> {
    const payload = { email: email, sub: id };
    return this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
      expiresIn: '365d',
    });
  }
}
