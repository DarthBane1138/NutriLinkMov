import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {

  id_paciente: number = 0;
  datosUsuarios: any = {};
  edadPaciente: number = 0;
  datosNutris: any = [] = [];
  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name!: string;
  sexoSeleccionado: string = '';
  mdl_primer_nombre: string = '';
  mdl_segundo_nombre: string = '';
  mdl_apellido_paterno: string = '';
  mdl_apellido_materno: string = '';
  mdl_telefono: string = '';
  
  constructor(private db: DblocalService, private api: ApiService, private modal: ModalController) { }

  async ngOnInit() {
    let data = await this.db.obtenerSesion();
    this.id_paciente = data.id_paciente;
    console.log("PLF Perfil id_paciente: " + this.id_paciente)
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
        this.edadPaciente = this.calcularEdad();
      } catch (error) {
        console.error('PLF Error al obtener la información del usuario:', error);
      }
    }

    calcularEdad(): number {
      const hoy = new Date();
      const nacimiento = new Date(this.datosUsuarios.fecha_nacimiento); // ← lee directamente
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
    
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    }

    cancel() {
      this.modal.dismiss(null, 'cancel');
    }
  
    confirm() {
      this.modal.dismiss(this.name, 'confirm');
    }

    async confirmNombre() {
      try {
        await lastValueFrom(
          this.api.modificarNombrePaciente(
            this.datosUsuarios.id_paciente,
            this.mdl_primer_nombre || this.datosUsuarios.primer_nombre,
            this.mdl_segundo_nombre || this.datosUsuarios.segundo_nombre,
            this.mdl_apellido_paterno || this.datosUsuarios.apellido_paterno,
            this.mdl_apellido_materno || this.datosUsuarios.apellido_materno
          )
        );
    
        // Actualizamos datos locales (opcional)
        this.datosUsuarios.primer_nombre = this.mdl_primer_nombre || this.datosUsuarios.primer_nombre;
        this.datosUsuarios.segundo_nombre = this.mdl_segundo_nombre || this.datosUsuarios.segundo_nombre;
        this.datosUsuarios.apellido_paterno = this.mdl_apellido_paterno || this.datosUsuarios.apellido_paterno;
        this.datosUsuarios.apellido_materno = this.mdl_apellido_materno || this.datosUsuarios.apellido_materno;
    
        this.modal.dismiss('confirm');
      } catch (error) {
        console.error('Error al modificar nombre:', error);
      }
    }

    async confirmSexo() {
      try {
        let sexoFormatoBD = '';
    
        // Convertimos la selección ("Masculino" / "Femenino") a lo que la base de datos espera ("M" o "F")
        if (this.sexoSeleccionado === 'Masculino') {
          sexoFormatoBD = 'M';
        } else if (this.sexoSeleccionado === 'Femenino') {
          sexoFormatoBD = 'F';
        } else {
          console.error('Sexo no válido seleccionado');
          return;
        }
    
        await lastValueFrom(
          this.api.modificarSexoPaciente(
            this.datosUsuarios.id_paciente,
            sexoFormatoBD
          )
        );
    
        // Actualizamos datos locales
        this.datosUsuarios.sexo = sexoFormatoBD;
    
        this.modal.dismiss('confirm');
      } catch (error) {
        console.error('Error al modificar sexo:', error);
      }
    }

    async confirmTelefono() {
      try {
        await lastValueFrom(
          this.api.modificarTelefonoPaciente(
            this.datosUsuarios.id_paciente,
            this.mdl_telefono || this.datosUsuarios.telefono
          )
        );
    
        // Actualiza el dato local
        this.datosUsuarios.telefono = this.mdl_telefono || this.datosUsuarios.telefono;
    
        this.modal.dismiss('confirm');
      } catch (error) {
        console.error('Error al modificar teléfono:', error);
      }
    }
  
    onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
      if (event.detail.role === 'confirm') {
        this.message = `Hello, ${event.detail.data}!`;
      }
    }

    onWillDismissSexo(event: CustomEvent<OverlayEventDetail>) {
      if (event.detail.role === 'confirm') {
        console.log('Sexo actualizado correctamente.');
      }
    }

    onWillDismissTelefono(event: CustomEvent<OverlayEventDetail>) {
      if (event.detail.role === 'confirm') {
        console.log('Teléfono actualizado correctamente.');
      }
    }

    preSeleccionarSexo() {
      if (this.datosUsuarios.sexo === 'M') {
        this.sexoSeleccionado = 'Masculino';
      } else if (this.datosUsuarios.sexo === 'F') {
        this.sexoSeleccionado = 'Femenino';
      } else {
        this.sexoSeleccionado = '';
      }
    }


}
