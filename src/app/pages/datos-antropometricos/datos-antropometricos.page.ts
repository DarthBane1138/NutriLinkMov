import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';

@Component({
  selector: 'app-datos-antropometricos',
  templateUrl: './datos-antropometricos.page.html',
  styleUrls: ['./datos-antropometricos.page.scss'],
  standalone: false
})
export class DatosAntropometricosPage implements OnInit {

  peso: number = 0;
  talla: number = 0;
  cintura: number = 0;
  brazo: number = 0;
  tricipital: number = 0;
  bicipital: number = 0;
  suprailiaco: number = 0;
  subescapular: number = 0;
  mensajeError:string = '';
  id_paciente: number = 0;
  fecha: string = '';
  registrosAntropometria: any[] = [];
  calculosAntropometricos: any = null;
  mensajeErrorCalculos: string = '';
  diagnosticosAntropometricos: string[] = [];
  mensajeErrorDiagnosticos: string = '';

  constructor(private api: ApiService, private db: DblocalService) { }

  async ngOnInit() {
    let data = await this.db.obtenerSesion();
    this.id_paciente = data.id_paciente;
    console.log("PLF id_paciente: " + this.id_paciente);
    this.verAntropometria(this.id_paciente);
  }

  async verAntropometria(id_paciente: number) {
    try {
      const datos = this.api.obtenerAntropometria(id_paciente);
      const respuesta: any = await lastValueFrom(datos);
  
      if (respuesta.status === 'ok') {
        const registros = respuesta.datos;
  
        this.registrosAntropometria = [];
  
        for (const dato of registros) {
          let fechaFormateada = '';
          if (dato.fecha) {
            const partes = dato.fecha.slice(0, 10).split('-');
            fechaFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;
          }

          this.registrosAntropometria.push({
            fecha: fechaFormateada,
            fechaNatural: this.formatearFechaNatural(fechaFormateada),
            peso: dato.peso_kg,
            talla: dato.talla_cm,
            cintura: dato.circunferencia_cintura_cm,
            brazo: dato.perimetro_braquial_mm,
            tricipital: dato.pliegue_tricipital_mm,
            bicipital: dato.pliegue_bicipital_mm,
            suprailiaco: dato.pliegue_suprailiaco_mm,
            subescapular: dato.pliegue_subescapular_mm
          });
        }

        // Opcional: mostrar el primero por defecto
        if (this.registrosAntropometria.length > 0) {
          this.mostrarRegistro(this.registrosAntropometria[0]);
        }
  
      } else {
        this.mostrarAlerta('Error', respuesta.mensaje);
      }
  
    } catch (error: any) {
      console.error("PLF: Error inesperado:", JSON.stringify(error, null, 2));
      if (error?.error?.mensaje) {
        this.mostrarAlerta('Error', error.error.mensaje);
      } else {
        this.mostrarAlerta('Error', 'No se pudo conectar con el servidor.');
      }
    }
  }
  
  // Nueva función
  mostrarRegistro(registro: any) {
    this.fecha = registro.fecha;
    this.peso = registro.peso;
    this.talla = registro.talla;
    this.cintura = registro.cintura;
    this.brazo = registro.brazo;
    this.tricipital = registro.tricipital;
    this.bicipital = registro.bicipital;
    this.suprailiaco = registro.suprailiaco;
    this.subescapular = registro.subescapular;
  
    // Limpiar resultados anteriores
    this.calculosAntropometricos = null;
    this.mensajeErrorCalculos = '';
  
    // Formatea la fecha a YYYY-MM-DD
    const partes = registro.fecha.split('-');
    const fechaFormatoApi = `${partes[2]}-${partes[1]}-${partes[0]}`;
  
    console.log("PLF con estos datos vamos a obtener los calculos: " + this.id_paciente + fechaFormatoApi)
    // Llamar a los cálculos antropométricos
    this.api.obtenerCalculosAntropometricos(this.id_paciente, fechaFormatoApi)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'success') {
            this.calculosAntropometricos = resp.data;
          } else {
            this.mensajeErrorCalculos = resp.mensaje || 'No se pudieron obtener los cálculos.';
          }
        },
        error: (err) => {
          console.error('Error al obtener cálculos antropométricos:', err);
          this.mensajeErrorCalculos = 'Error al conectar con el servidor de cálculos.';
        }
      });

    console.log("PLF con estos datos vamos a obtener los diagnósticos: " + this.id_paciente + fechaFormatoApi)
    // Llamar a los diagnósticos antropométricos
    this.api.obtenerDiagnosticosAntropometricos(this.id_paciente, fechaFormatoApi)
    .subscribe({
      next: (resp) => {
        if (resp.status === 'success') {
          const diagnosticosArray = resp.data?.diagnosticos || [];
  
          this.diagnosticosAntropometricos = diagnosticosArray.map((item: any) => item.descripcion);
  
          // Si deseas mostrarlos por consola para prueba
          console.log('Diagnósticos antropométricos:', this.diagnosticosAntropometricos);
        } else {
          this.mensajeErrorDiagnosticos = resp.mensaje || 'No se pudieron obtener los diagnósticos.';
        }
      },
      error: (err) => {
        console.error('PLF: Error al obtener diagnósticos antropométricos:', JSON.stringify(err, null, 2));
        this.mensajeErrorDiagnosticos = 'Error al conectar con el servidor de diagnósticos.';
      }
    });
  }

  mostrarAlerta(arg0: string, mensaje: any) {
    throw new Error('Method not implemented.');
  }

  formatearFechaNatural(fechaStr: string): string {
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;

  const fecha = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

}
