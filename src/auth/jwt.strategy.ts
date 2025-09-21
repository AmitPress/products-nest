import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { SupabaseService } from '../database/supabase.service';

// passport-custom type declaration`
declare module 'passport-custom' {
  interface Strategy {
    authenticate(req: any, options?: any): void;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private supabaseService: SupabaseService) {
    super();
  }

  async validate(req: any): Promise<any> {
    try {
      console.log('🔍 JWT Strategy - Starting validation');
      
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      

      // Verify with Supabase using the token
      const { data: { user }, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud,
      };

      return userData;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
