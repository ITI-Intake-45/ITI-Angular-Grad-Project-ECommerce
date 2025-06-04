import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';
import { Slider } from './slider/slider';
import { AdminLayout } from './admin-layout/admin-layout';
import {RouterLink} from '@angular/router';



@NgModule({
  declarations: [
    Header,
    Footer,
    Sidebar,
    Slider,
    AdminLayout
  ],
  exports: [
    Sidebar,
    Header,
    Slider,
    Footer
  ],
  imports: [
    CommonModule,
    RouterLink
  ]
})
export class LayoutModule { }
