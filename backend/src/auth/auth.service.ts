
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.userID, isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
      isAdmin: user.isAdmin,
    };
  }

  async signup(user: any) {
    const newUser = await this.userService.createUser(user);
    const payload = { username: newUser.email, sub: newUser.userID, isAdmin: newUser.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
      isAdmin: newUser.isAdmin,
    };
  }
}
