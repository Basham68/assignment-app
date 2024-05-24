import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() createUserDto: { email: string; password: string; name: string },
  ) {
    return this.usersService.create(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
    );
  }
}
