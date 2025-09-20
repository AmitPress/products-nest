import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class AppService {
  constructor(private supabase: SupabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getUsers() {
    return this.supabase.getUsers();
  }

  async createUser(data: { email: string; name?: string }) {
    return this.supabase.createUser(data);
  }
}