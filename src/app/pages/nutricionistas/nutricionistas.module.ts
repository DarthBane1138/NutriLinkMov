import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NutricionistasPageRoutingModule } from './nutricionistas-routing.module';

import { NutricionistasPage } from './nutricionistas.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NutricionistasPageRoutingModule,
    SharedModule
  ],
  declarations: [NutricionistasPage]
})
export class NutricionistasPageModule {}
