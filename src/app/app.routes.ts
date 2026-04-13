import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HistoryComponent } from './components/history/history.component';
import { AuthFormComponent } from './auth-form/auth-form';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthFormComponent },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] }
];