import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NutricionistasPage } from './nutricionistas.page';

const routes: Routes = [
  {
    path: '',
    component: NutricionistasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NutricionistasPageRoutingModule {}
