import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutricionistasPage } from './nutricionistas.page';

describe('NutricionistasPage', () => {
  let component: NutricionistasPage;
  let fixture: ComponentFixture<NutricionistasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NutricionistasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
