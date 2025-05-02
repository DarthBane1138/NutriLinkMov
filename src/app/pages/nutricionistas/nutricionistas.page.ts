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
    for (const nutri of json) {
      // console.log("PLF: Nutri completo:", JSON.stringify(nutri, null, 2));
      const id_nutricionista = nutri.id_nutricionista;
      
      const nutricionista: any = {
        id_nutricionista: id_nutricionista,
        primer_nombre: nutri.primer_nombre,
        apellido_p: nutri.apellido_materno,
        correo: nutri.correo,
        especialidades: []
      };
      // console.log('PLF - Nombre:', nutri.primer_nombre);
      // console.log('PLF - ID:', id_nutricionista);
      
      // Obtener especialidades con manejo de respuestas según la API
      const especialidades = await this.obtenerEspecialidadesNutricionista(id_nutricionista);
      nutricionista.especialidades = especialidades;

      //console.log("PLF: Nutri", nutricionista.primer_nombre, "Especialidades:", nutricionista.especialidades);
      this.listaNutricionistas.push(nutricionista);
    }
  }

  async obtenerEspecialidadesNutricionista(id_nutricionista: number): Promise<any[]> {
    try {
      const respuesta = await lastValueFrom(this.api.obtenerEspecialidadesNutricionista(id_nutricionista));
  
      // Si la respuesta es un array, contiene especialidades válidas
      if (Array.isArray(respuesta)) {
        console.log('PLF: Especialidades obtenidas para nutricionista', id_nutricionista, respuesta);
        return respuesta;
      }
  
      // Si no es un array, probablemente vino un mensaje informativo desde el servidor
      if (respuesta && typeof respuesta === 'object' && 'mensaje' in respuesta) {
        console.warn(`PLF: Nutricionista ${id_nutricionista} sin especialidades:`, respuesta.mensaje);
      } else {
        console.warn(`PLF: Respuesta inesperada para nutricionista ${id_nutricionista}:`, respuesta);
      }
  
      return []; // Devolvemos array vacío si no hay especialidades o hay error controlado
    } catch (error) {
      console.error('PLF Error al obtener especialidades del nutricionista:', error);
      return [];
    }
  }

}
