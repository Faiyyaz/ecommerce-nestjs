import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  static async generatePassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  static async verifyPassword(
    password: string,
    dbPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, dbPassword);
    return isMatch;
  }
}
