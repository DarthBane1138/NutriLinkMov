import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';

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
  mdl_hecho: string = '';
  datosUsuarios: any = {};

  constructor(private api: ApiService, private db: DblocalService) { }

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
        this.citasDelPaciente = (citasPaciente.citas || []).filter((c: any) => c.estado === 'Reservada');

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
    for (const disp of this.disponibilidades) {
      const fechaISO = new Date(disp.fecha).toISOString().split('T')[0];
      if (!agrupado[fechaISO]) agrupado[fechaISO] = [];
      agrupado[fechaISO].push(disp);
    }

    this.fechasAgrupadas = Object.entries(agrupado).map(([fecha, bloques]) => {
      const bloquesCasteados = bloques as any[];
      const pacienteTieneCitaEseDia = this.citasDelPaciente.some((cita: any) => cita.fecha_hora?.split('T')[0] === fecha);

      const bloquesProcesados = bloquesCasteados.map(b => {
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
          esTuReserva: citaPaciente !== undefined
        };
      });

      return { fecha, bloques: bloquesProcesados };
    });
  }

  mostrarFormularioCita(bloque: any) {
    this.bloqueSeleccionado = bloque;
    this.mdl_motivo = '';
    this.mdl_hecho = '';
    this.mostrarModalFormulario = true;
  }

  cancelarFormulario() {
    this.mostrarModalFormulario = false;
    this.bloqueSeleccionado = null;
  }

  confirmarAgendarCita() {
    const id_paciente = this.datosUsuarios?.id_paciente;
    if (!id_paciente || !this.bloqueSeleccionado) return;

    this.api.solicitarCita(
      id_paciente,
      this.bloqueSeleccionado.id_disponibilidad,
      this.mdl_motivo,
      this.mdl_hecho
    ).subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          this.disponibilidades = this.disponibilidades.filter(
            (d: any) => d.id_disponibilidad !== this.bloqueSeleccionado.id_disponibilidad
          );
          this.agruparPorFecha();
          this.cerrarModal();
        }
        this.cancelarFormulario();
      },
      error: () => this.cancelarFormulario()
    });
  }

}
