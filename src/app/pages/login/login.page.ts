import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  mdl_correo: string = '';
  mdl_contrasena: string = '';

  constructor(private router:Router, private api: ApiService) { }

  ngOnInit() {
    console.log("PLF: Login")
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
      let json = JSON.parse(json_texto);
      if (json.status == "ok") {
        this.router.navigate(['home'], { replaceUrl: true })
      } else {
        console.log("PLF consumo API: Error al iniciar sesión: " + json.message)
      }
    }
    catch (error) {
      console.error("PLF: Error al consumir API", error)
    }
  }

}
