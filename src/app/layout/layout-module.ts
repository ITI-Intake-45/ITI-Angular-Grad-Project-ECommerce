import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';
import { AdminLayout } from './admin-layout/admin-layout';



@NgModule({
  declarations: [
    Header,
    Footer,
    Sidebar,
    AdminLayout
  ],
  imports: [
    CommonModule
  ]
})
export class LayoutModule { }
