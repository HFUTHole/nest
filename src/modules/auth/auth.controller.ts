import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common'
import { LoginDto, RegisterDto } from '@/modules/auth/dto/auth.dto'
import { AuthService } from '@/modules/auth/auth.service'
import { Public } from '@/common/decorator/public.decorator'
import { LocalAuthGuard } from '@/modules/auth/guards/lcoal-auth.guard'

@Public()
@Controller('auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('/register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }
}
