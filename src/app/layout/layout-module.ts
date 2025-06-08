import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';
import { Slider } from './slider/slider';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    Header,
    Footer,
    Sidebar,
    Slider,
  ],
  exports: [
    Sidebar,
    Header,
    Slider,
    Footer,
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
  ]
})
export class LayoutModule { }
