import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: config.get<string>('FACEBOOK_APP_ID') || 'not-configured',
      clientSecret: config.get<string>('FACEBOOK_APP_SECRET') || 'not-configured',
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:8000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'photos'],
      scope: ['email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: unknown) => void,
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value;
      const user = await this.authService.findOrCreateFromOAuth('facebook', {
        id: profile.id,
        email,
        displayName: profile.displayName || [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' '),
        picture: profile.photos?.[0]?.value,
      });
      done(null, user);
    } catch (err) {
      done(err, undefined);
    }
  }
}
