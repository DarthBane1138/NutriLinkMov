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
  }

  mostrarAlerta(arg0: string, mensaje: any) {
    throw new Error('Method not implemented.');
  }

}
