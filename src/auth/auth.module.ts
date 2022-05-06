import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Global()
@Module({
  imports: [JwtModule.register({
    secret: 'jwtsecret'
  })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
