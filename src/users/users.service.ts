import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (err) {
      throw new InternalServerErrorException(
        'Database error occurred while fetching user.',
      );
    }
  }

  async create(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User; token: string }> {
    try {
      const userExist = await this.findOne(email);

      if (userExist?.email)
        throw new ConflictException('User with this email already exists.');

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await new this.userModel({
        email,
        password: hashedPassword,
        name,
      }).save();

      const payload = { email, sub: user._id };

      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '60m',
      });

      return { user: user, token };
    } catch (err) {
      // If any error occurs, handle it appropriately
      if (err instanceof ConflictException) throw err; // Re-throw the ConflictException
      throw new InternalServerErrorException('Failed to create user!');
    }
  }
}
