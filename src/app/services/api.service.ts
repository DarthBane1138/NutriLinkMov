import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  ruta: string = 'https://nutrilinkapi-production.up.railway.app';

  constructor(private http: HttpClient) { }

  loginUsuario (correo: string, contrasena: string) {
    let objeto: any = {};
    objeto.correo = correo;
    objeto.contrasena = contrasena;

    return this.http.post(this.ruta + "/api_nutrilink/paciente/login", objeto).pipe()
  }

  obtencionNutricionistas() {
    return this.http.get(this.ruta + "/api_nutrilink/nutricionista/obtener_todos").pipe()
  }

  obtenerPaciente(id_paciente: number) {
    return this.http.get(this.ruta + `/api_nutrilink/paciente/obtener_paciente_citas/${id_paciente}`, {
      responseType: 'json' as 'json'
    }).pipe();
  }

  obtenerNutrisId(id_paciente: number) {
return this.http.get<any[]>(this.ruta + `/api_nutrilink/paciente/obtener_vinculo_paciente_nutri/${id_paciente}`);
  }

}
