import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { tokenInterceptor } from './app/token.interceptor';
import { appConfig } from './app/app.config';


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
