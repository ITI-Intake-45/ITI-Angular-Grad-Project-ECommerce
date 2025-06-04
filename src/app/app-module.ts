import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Core modules
import { CoreModule } from './core/core-module';
import { SharedModule } from './shared/shared-module';
import { LayoutModule } from './layout/layout-module';

// Pages
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { ProductFilterPipe } from './pipes/product-filter-pipe';

@NgModule({
  declarations: [
    App,
    Home,
    NotFound,
    ProductFilterPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    LayoutModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }