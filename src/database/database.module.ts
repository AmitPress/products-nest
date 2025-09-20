import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [SupabaseService, PrismaService],
  exports: [SupabaseService, PrismaService],
})
export class DatabaseModule {}
