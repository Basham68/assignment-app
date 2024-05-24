import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async validateUserByJwt(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new console.error('user not exits');
    }
    return user;
  }

  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);
      if (!user) throw new ConflictException('Invalid username or password!');
      const payload = { email, sub: user._id };
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '60m',
      });

      return {
        user,
        token,
      };
    } catch (err) {
      // If any error occurs, handle it appropriately
      if (err instanceof ConflictException) throw err; // Re-throw the ConflictException
      throw new InternalServerErrorException('Failed to login!');
    }
  }
}
