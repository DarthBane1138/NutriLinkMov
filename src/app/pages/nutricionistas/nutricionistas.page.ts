import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-nutricionistas',
  templateUrl: './nutricionistas.page.html',
  styleUrls: ['./nutricionistas.page.scss'],
  standalone: false
})
export class NutricionistasPage implements OnInit {

  listaNutricionistas: any [] = []

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.verNutricionistas();
  }

  async verNutricionistas() {
    this.listaNutricionistas = []
    let datos = this.api.obtencionNutricionistas();
    let respuesta = await lastValueFrom(datos);
    let json_texto = JSON.stringify(respuesta);
    let json = JSON.parse(json_texto);
    for(let x = 0; x < json.length; x++) {
      let nutricionista: any = {}
      nutricionista.primer_nombre = json[x].primer_nombre;
      nutricionista.apellido_p = json[x].apellido_paterno;
      nutricionista.correo = json[x].correo;
      this.listaNutricionistas.push(nutricionista);
    }
  }

}
