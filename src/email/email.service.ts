import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST') || this.config.get<string>('MAIL_HOST');
    const user = this.config.get<string>('SMTP_USER') || this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('SMTP_PASS') || this.config.get<string>('MAIL_PASSWORD');
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT') || this.config.get<number>('MAIL_PORT') || 587,
        secure: (this.config.get<string>('SMTP_SECURE') || this.config.get<string>('MAIL_SECURE')) === 'true',
        auth: { user, pass },
      });
    }
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      console.warn('[Email] SMTP not configured. Logging email instead:', { to, subject });
      return;
    }
    const from = this.config.get<string>('SMTP_FROM') || this.config.get<string>('MAIL_FROM') || 'Photobooth <noreply@photobooth.local>';
    await this.transporter.sendMail({ from, to, subject, html });
  }

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    const appName = this.config.get<string>('APP_NAME') || 'Photobooth';
    const subject = `[${appName}] Mã xác thực của bạn`;
    const html = `
      <p>Xin chào,</p>
      <p>Mã xác thực email của bạn là: <strong>${otp}</strong></p>
      <p>Mã có hiệu lực trong 15 phút. Không chia sẻ mã này với bất kỳ ai.</p>
      <p>Trân trọng,<br/>${appName}</p>
    `;
    await this.sendMail(email, subject, html);
  }

  async sendVerificationLink(email: string, link: string): Promise<void> {
    const appName = this.config.get<string>('APP_NAME') || 'Photobooth';
    const subject = `[${appName}] Xác thực email của bạn`;
    const html = `
      <p>Xin chào,</p>
      <p>Bấm vào link sau để xác thực email:</p>
      <p><a href="${link}" style="color:#2563eb;">${link}</a></p>
      <p>Link có hiệu lực trong 24 giờ.</p>
      <p>Trân trọng,<br/>${appName}</p>
    `;
    await this.sendMail(email, subject, html);
  }
}
