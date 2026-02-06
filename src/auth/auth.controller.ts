import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: { user: { id: string } }, @Body() _dto: LoginDto) {
    return this.authService.loginResponse(req.user as any);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmailByOtp(dto.email, dto.otp);
  }

  @Get('verify-email')
  async verifyEmailByToken(@Query('token') token: string) {
    return this.authService.verifyEmailByToken(token);
  }

  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: { user: { accessToken: string } }, @Res() res: Response) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || this.config.get<string>('URL_CLIENT') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${req.user.accessToken}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: { user: { accessToken: string } }, @Res() res: Response) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || this.config.get<string>('URL_CLIENT') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${req.user.accessToken}`);
  }
}
