import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO, LoginDTO } from './create-users-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Post('/sign-up')
  async create(@Body() createUserDTO: CreateUserDTO) {
    return await this.userService.signup(createUserDTO);
  }
  @Post('/login')
  async login(
    @Body()
    loginDTO: LoginDTO,
  ) {
    return await this.userService.login(loginDTO);
  }
}
