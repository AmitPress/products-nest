import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private supabaseService: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    try {
      // Verify the token with jsonwebtoken first
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify token signature
      jwt.verify(token, process.env.JWT_SECRET!);

      // Then verify with Supabase
      const { data: { user }, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: payload.aud,
        exp: payload.exp,
        iat: payload.iat,
        iss: payload.iss,
        sub: payload.sub,
      };
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
