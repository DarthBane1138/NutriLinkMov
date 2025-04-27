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

  constructor(private router:Router, private api: ApiService, private db: DblocalService, private renderer: Renderer2) { }

  ngOnInit() {
    console.log("PLF: Login")
    Keyboard.addListener('keyboardWillShow', () => {
      const lowerPanel = document.querySelector('.lower-panel');
      if (lowerPanel) {
        this.renderer.addClass(lowerPanel, 'move-up');
      }
    });

    Keyboard.addListener('keyboardWillHide', () => {
      const lowerPanel = document.querySelector('.lower-panel');
      if (lowerPanel) {
        this.renderer.removeClass(lowerPanel, 'move-up');
      }
    });
  }

  irHome() {
    this.router.navigate(['home'], { replaceUrl: true })
  }

  async login() {
    try {
      let datos = this.api.loginUsuario(
        this.mdl_correo, this.mdl_contrasena
      );
      let respuesta = await lastValueFrom(datos);
      let json_texto = JSON.stringify(respuesta);
      
      if (JSON.parse(json_texto).status == "ok") {
        let json = JSON.parse(json_texto);
        console.log("PLF valores almacenados:", this.mdl_correo, this.mdl_contrasena, json.id_paciente);
        await this.db.almacenarSesion(
          this.mdl_correo,
          this.mdl_contrasena,
          json.id_paciente
        );
        this.router.navigate(['home'], { replaceUrl: true });
      } else {
        console.log("PLF consumo API: Error al iniciar sesión: " + JSON.parse(json_texto).message);
      }
    }
    catch (error) {
      console.error("PLF: Error al consumir API", error)
    }
  }

}
