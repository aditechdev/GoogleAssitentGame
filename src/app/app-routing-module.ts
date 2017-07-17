import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TestsComponent } from "./tests/tests.component";

const routes: Routes = [
  {
    path: 'test',
    component: TestsComponent,
    children: []
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }