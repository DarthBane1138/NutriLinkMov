import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { AlertController} from '@ionic/angular';

registerLocaleData(localeEs);

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

// Para mostrar fechas
mostrarModal = false;
nutricionistaSeleccionado: any = null;
disponibilidades: any[] = [];
fechasAgrupadas: any[] = [];

mostrarModalFormulario = false;
bloqueSeleccionado: any = null;

mdl_motivo: string = '';

citasDelPaciente: any[] = [];

centrosDisponibles: any[] = [];
centroSeleccionadoId: number | null = null;

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

  constructor(
    private router:Router,
    private api: ApiService,
    private db:DblocalService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    let data = await this.db.obtenerSesion();
    this.correo = data.correo;
    this.contrasena = data.contrasena;
    this.id_paciente = data.id_paciente;
  
    console.log("PLF correo:", this.correo);
    console.log("PLF contrasena:", this.contrasena);
    console.log("PLF id_paciente:", this.id_paciente);

    await this.infoUsuario();
    await this.verificarCancelacionesPendientes();
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
          notas: cita.notas,
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

abrirModal(nutricionista: any) {
  this.nutricionistaSeleccionado = nutricionista;

  // Inicializar para evitar residuos anteriores
  this.citasDelPaciente = [];
  this.disponibilidades = [];
  this.fechasAgrupadas = [];
  console.log('PLF modal citas abierto con id_paciente: ' + this.datosUsuarios.id_paciente)

  // Primero obtener las citas del paciente
  this.api.obtenerCitasPaciente(this.datosUsuarios.id_paciente).subscribe({
    next: (citasPaciente) => {
      this.citasDelPaciente = (citasPaciente.citas || []).filter((cita: any) => ['Reservada', 'Solicitada'].includes(cita.estado));
      console.log('PLF Citas del paciente:', this.citasDelPaciente);

      // Luego obtener disponibilidades
      this.api.obtenerDisponibilidadNutricionista(nutricionista.id_nutricionista).subscribe({
        next: (response) => {
          if (response.status === 'ok' && response.disponibilidades) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            this.disponibilidades = response.disponibilidades.filter((d: any) => {
              const fechaDisp = new Date(d.fecha);
              fechaDisp.setHours(0, 0, 0, 0);
              return fechaDisp >= hoy;
            });

            this.obtenerCentrosDeDisponibilidad();
            this.agruparPorFecha();
          }

          this.mostrarModal = true;
        },
        error: (err) => {
          console.error('PLF Error al obtener disponibilidad:', err);
          this.mostrarModal = true; // Aun así mostrar modal
        }
      });
    },
    error: (err) => {
      console.error('PLF Error al obtener citas del paciente:', err);
      console.error('PLF Detalles:', JSON.stringify(err));

      // Obtener disponibilidad de todas formas
      this.api.obtenerDisponibilidadNutricionista(nutricionista.id_nutricionista).subscribe({
        next: (response) => {
          if (response.status === 'ok' && response.disponibilidades) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            this.disponibilidades = response.disponibilidades.filter((d: any) => {
              const fechaDisp = new Date(d.fecha);
              fechaDisp.setHours(0, 0, 0, 0);
              return fechaDisp >= hoy;
            });

            this.agruparPorFecha();
          }

          this.mostrarModal = true;
        },
        error: (err) => {
          console.error('PLF Error al obtener disponibilidad tras fallo de citas:', err);
          this.mostrarModal = true;
        }
      });
    }
  });
}

agruparPorFecha() {
  const agrupado: { [fecha: string]: any[] } = {};

  // ✅ Filtrar primero por centro seleccionado
  const disponiblesFiltrados = this.disponibilidades.filter(d => d.id_centro === this.centroSeleccionadoId);

  for (const disp of disponiblesFiltrados) {
    const fechaISO = new Date(disp.fecha).toISOString().split('T')[0];
    if (!agrupado[fechaISO]) agrupado[fechaISO] = [];
    agrupado[fechaISO].push(disp);
  }

  this.fechasAgrupadas = Object.entries(agrupado).map(([fecha, bloques]) => {
    const bloquesCasteados = bloques as any[];

    const pacienteTieneCitaEseDia = this.citasDelPaciente.some((cita: any) => {
      const fechaCita = cita.fecha_hora?.split('T')[0];
      return fechaCita === fecha && (cita.estado === 'Reservada' || cita.estado === 'Solicitada');
    });

    const bloquesProcesados = bloquesCasteados.map(b => {
      const bloqueFecha = b.fecha.split('T')[0];
      const bloqueHora = b.hora;

      const citaPaciente = this.citasDelPaciente.find((cita: any) => {
        const fechaCita = cita.fecha_hora?.split('T')[0];
        const horaCita = cita.fecha_hora?.split('T')[1]?.substring(0, 5); // 'HH:mm'
        return fechaCita === bloqueFecha && horaCita === bloqueHora.substring(0, 5);
      });

      return {
        ...b,
        habilitada: b.estado === 'Disponible' && !pacienteTieneCitaEseDia,
        esTuReserva: citaPaciente !== undefined &&
          (citaPaciente.estado === 'Reservada' || citaPaciente.estado === 'Solicitada'),
        estado: citaPaciente?.estado || b.estado
      };
    });

    return {
      fecha,
      bloques: bloquesProcesados
    };
  });
}

cerrarModal() {
  this.mostrarModal = false;
  this.nutricionistaSeleccionado = null;
  this.disponibilidades = [];
  this.fechasAgrupadas = [];
}

mostrarFormularioCita(bloque: any) {
  this.bloqueSeleccionado = bloque;
  this.mdl_motivo = '';
  this.mostrarModalFormulario = true;
}

cancelarFormulario() {
  this.mostrarModalFormulario = false;
  this.bloqueSeleccionado = null;
}

async confirmarAgendarCita() {
  const id_paciente = this.datosUsuarios?.id_paciente;

  if (!id_paciente || !this.bloqueSeleccionado || !this.bloqueSeleccionado.id_centro) {
    console.error('Datos incompletos');
    return;
  }

  console.log('📤 PLF Enviando solicitud de cita con:\n' + JSON.stringify({
    id_paciente,
    id_disponibilidad: this.bloqueSeleccionado.id_disponibilidad,
    motivo_consulta: this.mdl_motivo,
    id_centro: this.bloqueSeleccionado.id_centro
  }, null, 2));

  this.api.solicitarCita(
    id_paciente,
    this.bloqueSeleccionado.id_disponibilidad,
    this.bloqueSeleccionado.id_centro,
    this.mdl_motivo
  ).subscribe({
    next: async (response) => {
      if (response.status === 'ok') {
        this.disponibilidades = this.disponibilidades.filter(
          (d: any) => d.id_disponibilidad !== this.bloqueSeleccionado.id_disponibilidad
        );
        this.agruparPorFecha();

        // 🗓️ Preparar mensaje plano para la alerta
        const fechaISO = this.bloqueSeleccionado.fecha?.split('T')[0] ?? '';
        const partes = fechaISO.split('-'); // [YYYY, MM, DD]

        const fechaFormateada = new Date(
          Number(partes[0]),
          Number(partes[1]) - 1,
          Number(partes[2])
        ).toLocaleDateString('es-CL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const hora = this.bloqueSeleccionado.hora ?? '--:--';
        const centroNombre = this.centrosDisponibles.find(
          c => c.id === this.bloqueSeleccionado.id_centro
        )?.nombre ?? 'Centro no identificado';

        const mensaje =
          `📅 Fecha: ${fechaFormateada}\n` +
          `⏰ Hora: ${hora}\n` +
          `🏥 Centro: ${centroNombre}`;

        try {
          const alerta = await this.alertController.create({
            header: 'Cita solicitada',
            message: mensaje,
            buttons: ['OK']
          });

          await alerta.present();
          await alerta.onDidDismiss(); // ✅ Esperar antes de cerrar el modal
        } catch (error) {
          console.error('❌ Error al mostrar la alerta:', error);
        }

        this.cerrarModal();
      } else {
        console.error(response.mensaje);
      }

      this.cancelarFormulario();
    },
    error: (err) => {
      console.error(err);
      this.cancelarFormulario();
    }
  });
}

async verificarCancelacionesPendientes() {
  try {
    const respuesta = await lastValueFrom(this.api.obtenerCitasPaciente(this.id_paciente));
    const citas = respuesta.citas || [];

    for (const cita of citas) {
      if (cita.estado === 'Cancelada por Nutricionista') {
        const fechaObj = new Date(cita.fecha_hora);
        const fecha = fechaObj.toLocaleDateString('es-CL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const hora = cita.fecha_hora.split('T')[1]?.substring(0, 5) || '--:--';
        const nombreNutricionista = cita.nutricionista_nombre || 'el nutricionista';

        // Mostrar alerta y capturar respuesta
        const alerta = await this.alertController.create({
          header: 'Cita cancelada',
          message: `${nombreNutricionista} ha cancelado su cita el ${fecha} a las ${hora}.`,
          buttons: [
            {
              text: 'Ver más tarde',
              role: 'cancel',
            },
            {
              text: 'Confirmar',
              role: 'confirm'
            }
          ]
        });

        await alerta.present();
        const result = await alerta.onDidDismiss();

        if (result.role === 'confirm') {
          try {
            await lastValueFrom(this.api.confirmarNotificacionCancelacion(
              this.id_paciente,
              cita.id_nutricionista,
              cita.fecha_hora,
              'paciente'
            ));

            const confirmacion = await this.alertController.create({
              header: 'Notificación confirmada',
              message: 'El estado de la cita ha sido actualizado.',
              buttons: ['OK']
            });

            await confirmacion.present();
            await confirmacion.onDidDismiss(); // ✅ Espera a que se cierre esta también
          } catch (error) {
            console.error('Error al confirmar cancelación:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al verificar cancelaciones pendientes:', error);
  }
}

private obtenerCentrosDeDisponibilidad(): void {
  const centrosMap = new Map<number, string>();
  for (const disp of this.disponibilidades) {
    if (disp.id_centro && disp.nombre_centro) {
      centrosMap.set(disp.id_centro, disp.nombre_centro);
    }
  }

  this.centrosDisponibles = Array.from(centrosMap.entries()).map(([id, nombre]) => ({
    id,
    nombre
  }));

  // Si solo hay un centro, seleccionarlo automáticamente
  if (this.centrosDisponibles.length === 1) {
    this.centroSeleccionadoId = this.centrosDisponibles[0].id;
  }
}

}

