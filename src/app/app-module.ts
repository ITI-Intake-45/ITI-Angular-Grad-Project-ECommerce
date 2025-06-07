import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Core modules
import { CoreModule } from './core/core-module';
import { SharedModule } from './shared/shared-module';
import { LayoutModule } from './layout/layout-module';
import { FormsModule } from '@angular/forms';

// Pages
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { ProductFilterPipe } from './pipes/product-filter-pipe';
import { Login } from './auth/login/login';
import { AuthModule } from './auth/auth-module';

@NgModule({
  declarations: [
    App,
    Home,
    NotFound,
    ProductFilterPipe

  ],
  imports: [
    NoopAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    FormsModule,
    LayoutModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
