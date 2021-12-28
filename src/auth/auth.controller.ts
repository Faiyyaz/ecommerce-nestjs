import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.route';
import { UserDto } from 'src/auth/user.dto';
import { LoginUserDto } from './login.user.dto';
import { LoginDto } from './login.dto';
import { TokenDto } from './token.dto';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginDto> {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post('register')
  async register(@Body() userDto: UserDto): Promise<User> {
    return this.authService.createUser(userDto);
  }

  @Public()
  @Post('refreshToken')
  async refreshToken(@Body() refreshToken: string): Promise<TokenDto> {
    return this.authService.refreshToken(refreshToken);
  }
}
