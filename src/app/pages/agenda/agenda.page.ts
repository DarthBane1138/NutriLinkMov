import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: false
})
export class AgendaPage implements OnInit {
  id_paciente: number = 0;
  citas: any[] = [];
  citasProximas: any[] = [];
  citasPasadas: any[] = [];

  constructor(private api: ApiService, private db: DblocalService) {}

  async ngOnInit() {
    const datos = await this.db.obtenerSesion();
    this.id_paciente = datos.id_paciente;
    console.log('PLF: ID paciente actual:', this.id_paciente);

    this.obtenerCitas();
  }

async obtenerCitas() {
  try {
    const respuesta = await lastValueFrom(this.api.obtenerCitasPaciente(this.id_paciente));
    const todas = (respuesta.citas || []).filter((cita: any) => cita.estado !== 'Cancelada');

    this.citasProximas = [];
    this.citasPasadas = [];

    const hoyISO = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    for (const cita of todas) {
      const fechaISO = cita.fecha_hora.split('T')[0];

      if (fechaISO >= hoyISO) {
        this.citasProximas.push(cita);
      } else {
        this.citasPasadas.push(cita);
      }
    }

  } catch (error) {
    console.error('PLF Error al obtener citas:', error);
    this.citasProximas = [];
    this.citasPasadas = [];
  }
}

  obtenerFecha(fechaHora: string): string {
    const fechaISO = fechaHora.split('T')[0]; // '2025-05-22'
    const [year, month, day] = fechaISO.split('-');
    const fechaFormateada = new Date(+year, +month - 1, +day);
    return fechaFormateada.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  obtenerHora(fechaHora: string): string {
    const hora = fechaHora.split('T')[1]?.substring(0, 5); // 'HH:mm'
    return hora ?? '--:--';
  }
}
