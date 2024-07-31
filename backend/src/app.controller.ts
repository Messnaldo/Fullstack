import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

import { AuthGuard } from '@nestjs/passport';
import { join } from 'path';

@Controller()
export class AppController {
    @Get('/login')
    async test(@Res() res){
        res.sendFile(join(__dirname, '..', 'client/browser', 'index.csr.html'))
    }
  
}