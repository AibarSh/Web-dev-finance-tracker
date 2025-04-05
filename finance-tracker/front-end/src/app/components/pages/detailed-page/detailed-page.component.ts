import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-pages',
  templateUrl: './detailed-page.component.html',
  styleUrls: ['./detailed-page.component.css'],
  imports: [NgFor]
})
export class PagesComponent implements OnInit {
  pages: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getPages().subscribe(data => {
      this.pages = data;
    });
  }
}
