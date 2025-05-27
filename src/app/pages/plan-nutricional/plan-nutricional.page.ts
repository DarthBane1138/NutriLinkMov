import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';

@Component({
  selector: 'app-plan-nutricional',
  templateUrl: './plan-nutricional.page.html',
  styleUrls: ['./plan-nutricional.page.scss'],
  standalone: false
})
export class PlanNutricionalPage implements OnInit {

  id_paciente: number = 0;
  fechasMinutas: { id_minuta: number, fecha_minuta: string }[] = [];
  minutaSeleccionada: any = null;
  mensaje: string = '';
  fechaSeleccionada: string = '';
  mostrarTodasFechas: boolean = false;

  constructor(private api: ApiService, private db: DblocalService) {}

  async ngOnInit() {
    const sesion = await this.db.obtenerSesion();
    this.id_paciente = sesion.id_paciente;

    this.api.obtenerFechasMinutas(this.id_paciente).subscribe({
      next: (resp: any) => {
        if (resp.status === 'success') {
          this.fechasMinutas = resp.data || [];
          if (this.fechasMinutas.length > 0) {
            // Seleccionamos la última fecha por defecto
            const ultima = this.fechasMinutas[0];
            this.fechaSeleccionada = ultima.fecha_minuta;
            this.cargarMinuta(this.id_paciente, ultima.id_minuta);
          } else {
            this.mensaje = 'No hay minutas registradas.';
          }
        } else {
          this.mensaje = resp.mensaje || 'Error al obtener fechas.';
        }
      },
      error: () => {
        this.mensaje = 'No se pudo conectar al servidor.';
      }
    });
  }

  cargarMinuta(pacienteId: number, idMinuta: number) {
    this.api.obtenerMinutaPorPaciente(pacienteId, idMinuta).subscribe({
      next: (resp: any) => {
        if (resp.status === 'success') {
          this.minutaSeleccionada = resp.data;
          console.log('PLF: Minuta completa recibida:', JSON.stringify(this.minutaSeleccionada, null, 2));
          console.log('PLF: Tiempos de comida:', JSON.stringify(this.minutaSeleccionada.tiempos_de_comida, null, 2));
        } else {
          this.minutaSeleccionada = null;
          this.mensaje = 'No se pudo obtener la minuta.';
        }
      },
      error: () => {
        this.minutaSeleccionada = null;
        this.mensaje = 'Error al cargar la minuta.';
      }
    });
  }

seleccionarFecha(fecha: string, idMinuta: number) {
  this.fechaSeleccionada = fecha;
  this.cargarMinuta(this.id_paciente, idMinuta);
}

formatearFechaLarga(fechaStr: string): string {
  const [anio, mes, dia] = fechaStr.split('-');
  const fechaLocal = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  // Capitaliza la primera letra
  const formateada = fechaLocal.toLocaleDateString('es-CL', opciones);
  return formateada.charAt(0).toUpperCase() + formateada.slice(1);
}
}
