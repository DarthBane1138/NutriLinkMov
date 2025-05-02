import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  ruta: string = 'https://nutrilinkapi-production.up.railway.app';
  //ruta: string = 'http://localhost:3000';
  
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

  modificarNombrePaciente(
    id_paciente: number,
    primer_nombre: string,
    segundo_nombre: string,
    apellido_paterno: string,
    apellido_materno: string
  ) {
    let objeto: any = { 
      id_paciente,
      primer_nombre,
      segundo_nombre,
      apellido_paterno,
      apellido_materno
    };
  
    return this.http.patch(this.ruta + "/api_nutrilink/paciente/modificar", objeto).pipe();
  }

  modificarSexoPaciente(id_paciente: number, sexo: string) {
    let objeto: any = {
      id_paciente,
      sexo
    };
  
    return this.http.patch(this.ruta + "/api_nutrilink/paciente/modificar", objeto).pipe();
  }

  modificarTelefonoPaciente(id_paciente: number, telefono: string) {
    let objeto: any = {
      id_paciente,
      telefono
    };
  
    return this.http.patch(this.ruta + "/api_nutrilink/paciente/modificar", objeto).pipe();
  }

  cambiarContrasenaPaciente(
    id_paciente: number,
    contrasena_actual: string,
    contrasena_nueva: string
  ) {
    const objeto = {
      id_paciente,
      contrasena_actual,
      contrasena_nueva
    };
  
    return this.http.patch(this.ruta + "/api_nutrilink/paciente/modificar_contrasena", objeto).pipe();
  }

  obtenerEspecialidadesNutricionista(id_nutricionista: number) {
    return this.http.get(this.ruta + `/api_nutrilink/nutricionista/obtener_nutricionista_especialidades/${id_nutricionista}`);
  }

  obtenerAntropometria (id_paciente: number) {
    let objeto: any = {};
    objeto.id_paciente = id_paciente;

    return this.http.post(this.ruta + "/api_nutrilink/paciente/obtener_antropometria", objeto).pipe()
  }

  obtenerCalculosAntropometricos(pacienteId: number, fecha: string): Observable<any> {
    const params = new HttpParams()
      .set('pacienteId', pacienteId.toString())
      .set('fecha', fecha); // formato esperado: 'YYYY-MM-DD'

    return this.http.get(`/api_nutrilink/obtener_calculos_antropometricos`, { params });
  }


}
