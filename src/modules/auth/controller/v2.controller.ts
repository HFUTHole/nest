import { Body, Controller, Inject, Post } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { Public } from "@/common/decorator/public.decorator";
import { SMSRegisterDto } from "../dto/auth.dto";

@Public()
@Controller("auth/v2")
export class AuthControllerV2 {
  @Inject()
  private readonly authService: AuthService

  
  @Post('/register')
  register(@Body() dto: SMSRegisterDto) {
    return this.authService.registerBySMS(dto)
  }

  @Post('/sms')
  sendSMS(@Body() dto: SMSRegisterDto) {
    return this.authService.sendSMS(dto)
  }

}