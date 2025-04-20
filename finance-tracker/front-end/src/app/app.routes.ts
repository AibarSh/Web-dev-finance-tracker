import { Routes } from '@angular/router';
import { MainPageComponent } from './components/pages/main-page/main-page.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { canActivateAuth } from './auth/auth.guard';
import { RegistrationPageComponent } from './components/pages/registration-page/registration-page.component';
import { WelcomePageComponent } from './components/pages/welcome-page/welcome-page.component';

export const routes: Routes = [
    {
        path: '',
        component: WelcomePageComponent,
        children: [
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

    {
        path: 'main',
        component: MainPageComponent,
        canActivate: [canActivateAuth]
    }
];
