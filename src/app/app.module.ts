import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TestsComponent } from './tests/tests.component';
import { AppRoutingModule } from "./app-routing-module";
import { environment } from "../environments/environment";
import { AngularFireModule } from "angularfire2/angularfire2";
import { AngularFireDatabase } from "angularfire2/database";


@NgModule({
  declarations: [
    AppComponent,
    TestsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [AngularFireDatabase],
  bootstrap: [AppComponent]
})
export class AppModule { }
