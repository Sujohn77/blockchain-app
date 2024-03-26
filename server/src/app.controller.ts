import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get()
  getHello(): string {
    return 'Server is running on 3001';
  }
}
