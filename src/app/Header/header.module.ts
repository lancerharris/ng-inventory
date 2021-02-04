import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatRippleModule} from '@angular/material/core';
import { RouterModule } from '@angular/router';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatRippleModule, 
    MatDividerModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule { }
