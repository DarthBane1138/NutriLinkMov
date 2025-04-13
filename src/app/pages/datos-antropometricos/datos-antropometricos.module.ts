import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatosAntropometricosPageRoutingModule } from './datos-antropometricos-routing.module';
import { DatosAntropometricosPage } from './datos-antropometricos.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosAntropometricosPageRoutingModule,
    SharedModule
  ],
  declarations: [DatosAntropometricosPage]
})
export class DatosAntropometricosPageModule {}
