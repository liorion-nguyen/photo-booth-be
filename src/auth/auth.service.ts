import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { EmailVerification } from '../users/entities/email-verification.entity';
import { User } from '../users/entities/user.entity';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 15;
const LINK_EXPIRY_HOURS = 24;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
    @InjectRepository(EmailVerification)
    private verificationRepo: Repository<EmailVerification>,
  ) {}

  async register(email: string, password: string, name?: string) {
    const user = await this.usersService.createWithPassword(email, password, name);
    const otp = this.generateOtp();
    const token = randomBytes(32).toString('hex');
    await this.verificationRepo.save(
      this.verificationRepo.create({
        email: user.email,
        token,
        otpCode: otp,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      }),
    );
    await this.emailService.sendVerificationOtp(user.email, otp);
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || this.config.get<string>('URL_CLIENT') || 'http://localhost:3000';
    await this.emailService.sendVerificationLink(user.email, `${frontendUrl}/verify-email?token=${token}`);
    return {
      message: 'Đăng ký thành công. Vui lòng xác thực email (kiểm tra OTP hoặc link trong hộp thư).',
      userId: user.id,
    };
  }

  async verifyEmailByOtp(email: string, otp: string) {
    const record = await this.verificationRepo.findOne({
      where: {
        email: email.toLowerCase(),
        otpCode: otp,
        usedAt: null as unknown as undefined,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!record) throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    record.usedAt = new Date();
    await this.verificationRepo.save(record);
    await this.usersService.setEmailVerifiedByEmail(record.email);
    const user = await this.usersService.findByEmail(record.email);
    if (!user) throw new BadRequestException('User not found');
    return this.loginResponse(user);
  }

  async verifyEmailByToken(token: string) {
    const record = await this.verificationRepo.findOne({
      where: {
        token,
        usedAt: null as unknown as undefined,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!record) throw new BadRequestException('Link xác thực không hợp lệ hoặc đã hết hạn');
    record.usedAt = new Date();
    await this.verificationRepo.save(record);
    await this.usersService.setEmailVerifiedByEmail(record.email);
    const user = await this.usersService.findByEmail(record.email);
    if (!user) throw new BadRequestException('User not found');
    return this.loginResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (!user.emailVerified && user.provider === null)
      throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    return this.loginResponse(user);
  }

  async validateUserForLocal(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await this.usersService.validatePassword(user, password)))
      return null;
    return user;
  }

  async findOrCreateFromOAuth(
    provider: 'google' | 'facebook',
    profile: { id: string; email?: string; displayName?: string; picture?: string },
  ) {
    const email = profile.email;
    if (!email) throw new BadRequestException('Không thể lấy email từ tài khoản mạng xã hội');
    const user = await this.usersService.createOrUpdateFromOAuth(
      provider,
      profile.id,
      email,
      profile.displayName || undefined,
      profile.picture || undefined,
    );
    return this.loginResponse(user);
  }

  loginResponse(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role || 'user',
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      role: user.role || 'user',
    };
  }

  private generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Email chưa đăng ký');
    if (user.emailVerified) throw new BadRequestException('Email đã được xác thực');
    const otp = this.generateOtp();
    const token = randomBytes(32).toString('hex');
    await this.verificationRepo.save(
      this.verificationRepo.create({
        email: user.email,
        token,
        otpCode: otp,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      }),
    );
    await this.emailService.sendVerificationOtp(user.email, otp);
    return { message: 'Đã gửi lại mã OTP vào email.' };
  }
}
