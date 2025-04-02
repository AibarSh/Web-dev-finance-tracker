import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/services/auth.interceptor'; // Путь к интерцептору

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
