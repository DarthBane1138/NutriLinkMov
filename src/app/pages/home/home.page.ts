import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  correo: string = '';
  contrasena: string = '';

  datosUsuarios: any [] = []

  constructor(private router:Router, private api: ApiService, private db:DblocalService) {}

  /*ngOnInit() {
    this.db.obtenerSesion().then(async (data) => {
      this.correo = data.correo;
      this.contrasena = data.contrasena;
      await this.infoUsuario()
    })
  }*/
  
  /*async infoUsuario() {
    this.datosUsuarios = []
    let datos = this.api.obtenerPaciente(
      this.correo
    );
    let respuesta = await
  }*/

  async verMisNutricionistas() {
  }


  irDatosAntropometricos() {
    this.router.navigate(['datos-antropometricos'], { replaceUrl: true });
  }
  irPlanNutricional() {
    this.router.navigate(['plan-nutricional'], { replaceUrl: true });
  }
  irAgendarCita() {
    this.router.navigate(['agenda'], { replaceUrl: true });
  }
  irNutricionistas() {
    this.router.navigate(['nutricionistas'], { replaceUrl: true })
  }

}
