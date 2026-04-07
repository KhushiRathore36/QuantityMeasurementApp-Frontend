import { Routes } from '@angular/router';

import {HomeComponent} from './components/home/home.component';
import {HistoryComponent} from './components/history/history.component';
import { AuthFormComponent } from './auth-form/auth-form';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'login', component: AuthFormComponent }
];