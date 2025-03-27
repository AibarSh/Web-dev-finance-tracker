import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './components/pages/pages.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PagesComponent],
  template: `<app-pages></app-pages>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
