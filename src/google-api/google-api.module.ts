import { Module } from '@nestjs/common';
import { GoogleApiService } from './google-api.service';
import { ConfigModule } from '@nestjs/config';

@Module({ imports: [ConfigModule], providers: [GoogleApiService], exports: [GoogleApiService] })
export class GoogleApiModule {}
