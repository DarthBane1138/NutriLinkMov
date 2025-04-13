import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosAntropometricosPage } from './datos-antropometricos.page';

describe('DatosAntropometricosPage', () => {
  let component: DatosAntropometricosPage;
  let fixture: ComponentFixture<DatosAntropometricosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosAntropometricosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
