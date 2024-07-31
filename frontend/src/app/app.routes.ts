import { Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { SearchComponent } from './search/search.component';
import { LabelComponent } from './label/label.component';
import { FlowControlComponent } from './flow-control/flow-control.component';
import { FlowsettingComponent } from './flowsetting/flowsetting.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { userGuard, userChildGuard } from './user.guard';

export const routes: Routes = [
  
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'analysis', component: AnalysisComponent, canActivate: [authGuard] },
  { path: 'label', component: LabelComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'flow', component: FlowControlComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'flowsetting', component: FlowsettingComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'search', component: SearchComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];