import { User } from 'src/user/user.entity';

export class LoginDto {
  user: User;
  token: string;
  refreshToken: string;

  constructor(user: User, token: string, refreshToken: string) {
    this.user = user;
    this.token = token;
    this.refreshToken = refreshToken;
  }
}
