import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosAntropometricosPage } from './datos-antropometricos.page';

const routes: Routes = [
  {
    path: '',
    component: DatosAntropometricosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosAntropometricosPageRoutingModule {}
