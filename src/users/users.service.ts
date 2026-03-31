import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO, LoginDTO } from './create-users-dto';
import { SignUpResponse } from './users';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<{ accessToken: string }> {
    // find user based on email
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDTO.email,
      },
    });
    // if there is no user we can unauthorized
    if (!user) {
      throw new UnauthorizedException();
    }
    // decrypt the user password
    const isMatched = await this.decryptPassword(
      loginDTO.password,
      user.password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid password');
    }
    // match the user provided password with decrypted
    // if password not matched then send the error invalid password
    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
        role: user.role,
      },
      { expiresIn: '1d' },
    );
    // return json web token
    return { accessToken };
  }
  async signup(payload: CreateUserDTO): Promise<SignUpResponse> {
    const hashedPassword = await this.encryptPassword(payload.password, 10);

    const existingRecord = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });

    if (existingRecord) {
      // ❌ throw proper error instead of empty return
      throw new BadRequestException('User with this email already exists');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return (await this.prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    })) as SignUpResponse;
  }

  async encryptPassword(
    plainText: string,
    saltRounds: number,
  ): Promise<string> {
    return await bcrypt.hash(plainText, saltRounds);
  }
  async decryptPassword(plainText: string, hash: string) {
    return await bcrypt.compare(plainText, hash);
  }
}
