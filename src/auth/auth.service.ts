import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../database/supabase.service';

export interface AuthResponse {
  user: any;
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
  ) {}

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
        });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
        message: 'User created successfully. Please check your email for verification.',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      if (!data.session) {
        throw new UnauthorizedException('Authentication failed');
      }

      return {
        user: data.user,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabaseService.getClient().auth.signOut();
      if (error) throw error;
      return { message: 'Signed out successfully' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (error) throw error;

      if (!data.session) {
        throw new UnauthorizedException('Token refresh failed');
      }

      return {
        user: data.user,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async getCurrentUser(token: string) {
    try {
      const { data: { user }, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error) throw error;
      return user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async verifyToken(token: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error) throw error;
      return { valid: true, user: data.user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });

      if (error) throw error;
      return { message: 'Password reset email sent' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async verifyJwtToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return { valid: true, payload: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
