import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';

@Global()
@Module({
  imports: [UserModule, PrismaModule,  
     ConfigModule.forRoot({
    isGlobal: true,
  }), AuthModule],
  controllers: [AppController,],
  providers: [AppService, UserService],
})
export class AppModule {}
