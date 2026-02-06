import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUserForLocal(email, password);
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (!user.emailVerified && user.provider === null)
      throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
    return user;
  }
}
