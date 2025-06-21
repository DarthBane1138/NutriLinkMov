import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';
import { AlertController} from '@ionic/angular';

@Component({
  selector: 'app-nutricionistas',
  templateUrl: './nutricionistas.page.html',
  styleUrls: ['./nutricionistas.page.scss'],
  standalone: false
})
export class NutricionistasPage implements OnInit {

  listaNutricionistas: any [] = []

  // Props para modal y agendamiento
  mostrarModal = false;
  mostrarModalFormulario = false;
  nutricionistaSeleccionado: any = null;
  disponibilidades: any[] = [];
  fechasAgrupadas: any[] = [];
  citasDelPaciente: any[] = [];
  bloqueSeleccionado: any = null;
  mdl_motivo: string = '';
  datosUsuarios: any = {};
  centrosDisponibles: any[] = [];
  centroSeleccionadoId: number | null = null;

  constructor(private api: ApiService, private db: DblocalService, private alertController: AlertController) { }

  async ngOnInit() {
    const sesion = await this.db.obtenerSesion();
    this.datosUsuarios = sesion;
    this.verNutricionistas();
  }

  async verNutricionistas() {
    this.listaNutricionistas = []
    let datos = this.api.obtencionNutricionistas();
    let respuesta = await lastValueFrom(datos);
    let json_texto = JSON.stringify(respuesta);
    let json = JSON.parse(json_texto);
    for (const nutri of json) {
      const id_nutricionista = nutri.id_nutricionista;
      const nutricionista: any = {
        id_nutricionista: id_nutricionista,
        primer_nombre: nutri.primer_nombre,
        apellido_p: nutri.apellido_materno,
        correo: nutri.correo,
        especialidades: []
      };
      const especialidades = await this.obtenerEspecialidadesNutricionista(id_nutricionista);
      nutricionista.especialidades = especialidades;
      this.listaNutricionistas.push(nutricionista);
    }
  }

  async obtenerEspecialidadesNutricionista(id_nutricionista: number): Promise<any[]> {
    try {
      const respuesta = await lastValueFrom(this.api.obtenerEspecialidadesNutricionista(id_nutricionista));
      if (Array.isArray(respuesta)) return respuesta;
      return [];
    } catch (error) {
      console.error('PLF Error al obtener especialidades del nutricionista:', error);
      return [];
    }
  }

  abrirModal(nutricionista: any) {
    this.nutricionistaSeleccionado = nutricionista;
    this.citasDelPaciente = [];
    this.disponibilidades = [];
    this.fechasAgrupadas = [];

    this.api.obtenerCitasPaciente(this.datosUsuarios.id_paciente).subscribe({
      next: (citasPaciente) => {
        this.citasDelPaciente = (citasPaciente.citas || []).filter((c: any) =>
          c.estado === 'Reservada' || c.estado === 'Solicitada'
        );

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
          error: () => this.mostrarModal = true
        });
      },
      error: () => this.mostrarModal = true
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nutricionistaSeleccionado = null;
    this.disponibilidades = [];
    this.fechasAgrupadas = [];
  }

agruparPorFecha() {
  const agrupado: { [fecha: string]: any[] } = {};

  // ✅ Filtrar por centro seleccionado
  const disponiblesFiltrados = this.disponibilidades.filter(
    (d) => d.id_centro === this.centroSeleccionadoId
  );

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

    const bloquesProcesados = bloquesCasteados.map((b) => {
      const bloqueFecha = b.fecha.split('T')[0];
      const bloqueHora = b.hora;

      const citaPaciente = this.citasDelPaciente.find((cita: any) => {
        const fechaCita = cita.fecha_hora?.split('T')[0];
        const horaCita = cita.fecha_hora?.split('T')[1]?.substring(0, 5);
        return fechaCita === bloqueFecha && horaCita === bloqueHora.substring(0, 5);
      });

      return {
        ...b,
        habilitada: b.estado === 'Disponible' && !pacienteTieneCitaEseDia,
        esTuReserva:
          citaPaciente !== undefined &&
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

  if (this.centrosDisponibles.length === 1) {
    this.centroSeleccionadoId = this.centrosDisponibles[0].id;
  }
}

}
