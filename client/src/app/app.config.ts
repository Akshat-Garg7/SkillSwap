import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // <-- Import this
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
// For ngx-socket-io
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';

// Define the configuration for your Socket.IO connection
const socketIoConfig: SocketIoConfig = {
  url: environment.socketUrl,
  options: { transports: ['websocket', 'polling'] } 
};


export const appConfig: ApplicationConfig = {
  providers: [
    // Your existing providers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // == Added Providers ==
    
    // 1. Enables the HttpClient service for your entire application.
    provideHttpClient(withInterceptors([AuthInterceptor])),

    // 2. Integrates the ngx-socket-io library for real-time communication.
    importProvidersFrom(SocketIoModule.forRoot(socketIoConfig))
  ]
};