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
  mdl_contrasena_antigua = '';
  mdl_contrasena_nueva = '';
  mdl_contrasena_nueva_conf = '';
  mdl_eliminar_correo: string = '';
  mdl_eliminar_contrasena: string = '';
  mdl_eliminar_contrasena_conf: string = '';
  
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
            notas: cita.notas,
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

    async confirmContrasena() {
      // Validaciones básicas
      if (!this.mdl_contrasena_antigua) {
        return this.mostrarAlerta('Debe ingresar su contraseña actual.');
      }
    
      if (!this.mdl_contrasena_nueva) {
        return this.mostrarAlerta('Debe ingresar una nueva contraseña.');
      }
    
      if (this.mdl_contrasena_nueva !== this.mdl_contrasena_nueva_conf) {
        return this.mostrarAlerta('La confirmación de contraseña no coincide.');
      }
    
      try {
        const respuesta: any = await lastValueFrom(
          this.api.cambiarContrasenaPaciente(
            this.datosUsuarios.id_paciente,
            this.mdl_contrasena_antigua,
            this.mdl_contrasena_nueva
          )
        );
    
        if (respuesta.status === 'ok') {
          this.mostrarAlerta('Contraseña actualizada con éxito.', true);
          this.modal.dismiss('confirm');
        } else {
          this.mostrarAlerta(respuesta.mensaje || 'No se pudo actualizar la contraseña.');
        }
      } catch (error: any) {
        console.error('Error al cambiar contraseña:', error);
      
        // Intentamos leer el mensaje del error si existe
        let errorMensaje = 'Hubo un error inesperado.';
        
        if (error?.error?.mensaje) {
          errorMensaje = error.error.mensaje;
        }
      
        this.mostrarAlerta(errorMensaje);
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

    onWillDismissContrasena(event: CustomEvent<OverlayEventDetail>) {
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

    async mostrarAlerta(mensaje: string, exito: boolean = false) {
      const alert = document.createElement('ion-alert');
      alert.header = exito ? 'Éxito' : 'Advertencia';
      alert.message = mensaje;
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }

    async cargarEspecialidades(idNutricionista: number) {
      try {
      const especialidades = await lastValueFrom(this.api.obtenerEspecialidadesNutricionista(idNutricionista));
      console.log('Especialidades del nutricionista:', especialidades);
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
    }
  }

  async confirmarEliminacionCuenta() {
    const alert = document.createElement('ion-alert');
    alert.header = '¿Estás seguro?';
    alert.message = 'Esta acción eliminará permanentemente tu cuenta.';
    alert.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            const respuesta: any = await lastValueFrom(
              this.api.eliminarCuentaPaciente(
                this.datosUsuarios.correo,
                this.datosUsuarios.contrasena
              )
            );

            if (respuesta.status === 'ok') {
              // Limpiar sesión y redirigir
              await this.db.eliminarSesion();
              window.location.href = '/login';
            } else {
              this.mostrarAlerta(respuesta.error || 'No se pudo eliminar la cuenta.');
            }
          } catch (error: any) {
            console.error('Error al eliminar cuenta:', error);
            const mensaje = error?.error?.error || 'Error interno al eliminar cuenta.';
            this.mostrarAlerta(mensaje);
          }
        }
      }
    ];

    document.body.appendChild(alert);
    await alert.present();
  }

async confirmEliminarCuenta() {
  // Validación
  if (!this.mdl_eliminar_correo || !this.mdl_eliminar_contrasena || !this.mdl_eliminar_contrasena_conf) {
    return this.mostrarAlerta('Todos los campos son obligatorios.');
  }

  if (this.mdl_eliminar_contrasena !== this.mdl_eliminar_contrasena_conf) {
    return this.mostrarAlerta('Las contraseñas no coinciden.');
  }

  console.log('PLF eliminación Intentando eliminar cuenta con los siguientes datos:');
  console.log('PLF eliminación Correo:', this.mdl_eliminar_correo);
  console.log('PLF eliminación Contraseña:', this.mdl_eliminar_contrasena);
  console.log('PLF eliminación Confirmación Contraseña:', this.mdl_eliminar_contrasena_conf);

  try {
    const respuesta: any = await lastValueFrom(
      this.api.eliminarCuentaPaciente(this.mdl_eliminar_correo, this.mdl_eliminar_contrasena)
    );

    console.log('Respuesta desde API:', respuesta);

    if (respuesta.status === 'ok') {
      // Mostrar aviso antes de cerrar sesión
      await this.mostrarAlerta('Cuenta eliminada con éxito. Cerrando sesión en 5 segundos...');

      // Esperar 5 segundos
      await new Promise(resolve => setTimeout(resolve, 5000));

      await this.db.eliminarSesion();
      window.location.href = '/login';
    } else {
      this.mostrarAlerta(respuesta.error || 'No se pudo eliminar la cuenta.');
    }
  } catch (error: any) {
    console.error('Error al eliminar cuenta:', error);
    const mensaje = error?.error?.error || 'Error inesperado al intentar eliminar la cuenta.';
    this.mostrarAlerta(mensaje);
  }
}

}
