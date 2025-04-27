import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  mdl_correo: string = '';
  mdl_contrasena: string = '';
  ocultarTextos: boolean = false;
  v_visible = false;
  v_mensaje = '';
  isToastOpen = false;
  spinnervisible: boolean = false;
  duration: number = 3000;


  constructor(private router:Router, private api: ApiService, private db: DblocalService, private renderer: Renderer2) { }

  ngOnInit() {
    console.log("PLF: Login");
    Keyboard.addListener('keyboardWillShow', () => {
      const lowerPanel = document.querySelector('.lower-panel') as HTMLElement;
      if (lowerPanel) {
        this.renderer.addClass(lowerPanel, 'move-up');
        this.renderer.setStyle(lowerPanel, 'height', '80%');
      }
      this.ocultarTextos = true; // Se ocultan textos para dejar sólo logo NutriLink
    });
    Keyboard.addListener('keyboardWillHide', () => {
      const lowerPanel = document.querySelector('.lower-panel') as HTMLElement;
      if (lowerPanel) {
        this.renderer.removeClass(lowerPanel, 'move-up');
        this.renderer.setStyle(lowerPanel, 'height', '50%'); // Vuelve al tamaño normal
      }
      this.ocultarTextos = false; // Se vualven a mostrar textos superiores
    });
  }

  irHome() {
    this.router.navigate(['home'], { replaceUrl: true })
  }

  async login() {
    try {
      this.v_visible = false;
      let datos = this.api.loginUsuario(this.mdl_correo, this.mdl_contrasena);
      let respuesta = await lastValueFrom(datos);
      let json_texto = JSON.stringify(respuesta);
      let json = JSON.parse(json_texto);
      if (json.status === "ok") {
        this.spinnervisible = true;
        this.v_mensaje = "Iniciando Sesión, espere un momento";
        this.isToastOpen = true;
        console.log("PLF valores almacenados:", this.mdl_correo, this.mdl_contrasena, json.id_paciente);
        await this.db.almacenarSesion(
          this.mdl_correo,
          this.mdl_contrasena,
          json.id_paciente
        );
        setTimeout(() => {
          this.spinnervisible = false;
          this.isToastOpen = false;
          this.router.navigate(['home'], { replaceUrl: true });
        }, 3000);
      }
    } catch (error: any) {  // <-- Capturamos error
      console.error("PLF: Error al consumir API", error);
      // Aquí manejamos el error que envió tu API
      this.v_visible = true;
      if (error?.error?.mensaje) {
        this.v_mensaje = error.error.mensaje;  // Mensaje que enviaste desde el backend
      } else {
        this.v_mensaje = "Error inesperado. Intente nuevamente.";
      }
    }
  }

  // Función para abrir Toast
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen
  }

}
