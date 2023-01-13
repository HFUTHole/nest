import { Body, Controller, Inject, Post } from '@nestjs/common'
import { LoginDto, RegisterDto } from '@/modules/auth/dto/auth.dto'
import { AuthService } from '@/modules/auth/auth.service'
import { Public } from '@/common/decorator/public.decorator'

@Public()
@Controller('auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('/register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }
}
