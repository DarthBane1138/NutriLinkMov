import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
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
  id_paciente: number = 0;

  datosUsuarios: any = {};
  datosNutris: any[] = [];

  confirmButtons = [
    {
      text:'No',
      role: 'cancel',
      handler: () => {
        console.log("PLF alerta: Cierre de sesión cancelado");
      },
    },
    {
      text: 'Sí',
      role:'confirm',
      handler: () => {
        console.log("PLF alerta: Cierre de sesión confirmado");
        this.cerrarSesion();
      }
    }
  ]

  constructor(private router:Router, private api: ApiService, private db:DblocalService) {}

  async ngOnInit() {
    let data = await this.db.obtenerSesion();
    this.correo = data.correo;
    this.contrasena = data.contrasena;
    this.id_paciente = data.id_paciente;
  
    console.log("PLF correo:", this.correo);
    console.log("PLF contrasena:", this.contrasena);
    console.log("PLF id_paciente:", this.id_paciente);
  
    await this.infoUsuario();
  }
  
  async infoUsuario() {
    this.datosUsuarios = {};
  
    try {
      let paciente: any = await lastValueFrom(this.api.obtenerPaciente(this.id_paciente));
  
      this.datosUsuarios = {
        id_paciente: paciente.id_paciente,
        rut_paciente: paciente.rut_paciente,
        dv: paciente.dv,
        primer_nombre: paciente.primer_nombre,
        segundo_nombre: paciente.segundo_nombre,
        apellido_paterno: paciente.apellido_paterno,
        apellido_materno: paciente.apellido_materno,
        correo: paciente.correo,
        contrasena: paciente.contrasena,
        fecha_nacimiento: paciente.fecha_nacimiento,
        telefono: paciente.telefono,
        sexo: paciente.sexo,
        notas_varias: paciente.notas_varias,
        ocupacion: paciente.ocupacion,
        horario_laboral: paciente.horario_laboral,
        conviviente: paciente.conviviente,
        etapa_cambio_psicologico: paciente.etapa_cambio_psicologico,
        antecedentes_morbidos: paciente.antecedentes_morbidos,
        antecedentes_familiares: paciente.antecedentes_familiares,
        semana_gestacion: paciente.semana_gestacion,
        condicion_embarazo: paciente.condicion_embarazo,
        medicamentos_actuales: paciente.medicamentos_actuales,
        id_actividad_fisica: paciente.id_actividad_fisica,
        id_factor_patologico: paciente.id_factor_patologico,
        citas: paciente.citas.map((cita: any) => ({
          fecha_hora: cita.fecha_hora,
          estado: cita.estado,
          motivo_consulta: cita.motivo_consulta,
          compromiso_acordado: cita.compromiso_acordado,
          adherencia_medicamentos: cita.adherencia_medicamentos,
          hecho_relevante: cita.hecho_relevante,
          paciente_id_paciente: cita.paciente_id_paciente,
          nutricionista_id_nutricionista: cita.nutricionista_id_nutricionista
        }))
      };
    } catch (error) {
      console.error('PLF Error al obtener la información del usuario:', error);
    }
    await this.infoNutris();
  }

  obtenerEmojiGenero(): string {
    if (this.datosUsuarios.sexo === 'M') {
      return '👨‍💻'; // Hombre
    } else if (this.datosUsuarios.sexo === 'F') {
      return '👩‍💻'; // Mujer
    } else {
      return '👤'; // Otro / No definido
    }
  }

  async infoNutris() {
    this.datosNutris = [];
  
    try {
      const datos = this.api.obtenerNutrisId(this.datosUsuarios.id_paciente);
      const respuesta: any[] = await lastValueFrom(datos);
  
      for (const nutri of respuesta) {
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
        this.datosNutris.push(nutricionista);
      }
    } catch (error) {
      console.error('PLF Error al obtener nutricionistas:', error);
    }
  }

  async obtenerEspecialidadesNutricionista(id_nutricionista: number): Promise<any[]> {
    try {
      //console.log("PLF: El id del nutri es: " + id_nutricionista)
      const respuesta = await lastValueFrom(this.api.obtenerEspecialidadesNutricionista(id_nutricionista));
  
      // Si la respuesta es un array, contiene especialidades válidas
      if (Array.isArray(respuesta)) {
        //console.log('PLF: Especialidades obtenidas para nutricionista', id_nutricionista, respuesta);
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

  cerrarSesion() {
    this.db.eliminarSesion()
    this.router.navigate(['login'], { replaceUrl: true })
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
