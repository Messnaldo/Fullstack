import { Injectable, NestMiddleware } from '@nestjs/common';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('...........................................................')
    console.log(req)
    if (req.originalUrl.startsWith('/api')) {
      next();
    } else {
      console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
      console.log(`${join(__dirname, '..', 'client/browser', 'index.csr.html')}`)
      next();


      // res.sendFile(join(__dirname, '..', 'client/browser', 'index.csr.html'));
    }
  }
}