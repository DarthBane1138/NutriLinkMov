import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanNutricionalPageRoutingModule } from './plan-nutricional-routing.module';

import { PlanNutricionalPage } from './plan-nutricional.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanNutricionalPageRoutingModule,
    SharedModule
  ],
  declarations: [PlanNutricionalPage]
})
export class PlanNutricionalPageModule {}
