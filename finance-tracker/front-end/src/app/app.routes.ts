import { Routes } from '@angular/router';
import { MainPageComponent } from './components/pages/main-page/main-page.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
//import { canActivateAuth } from './auth/access.guard';
import { RegistrationPageComponent } from './components/pages/registration-page/registration-page.component';
import { WelcomePageComponent } from './components/pages/welcome-page/welcome-page.component';
//import { DetailsPageComponent } from './pages/details-page/details-page.component';

export const routes: Routes = [
    {
        path: '',
        component: MainPageComponent,
        children: [
            {
                path: '',
                component: MainPageComponent
            },
            {
                path: 'login',
                component: LoginPageComponent
            },
            {
                path: 'register',
                component: RegistrationPageComponent 
            },
        ]
    },
];