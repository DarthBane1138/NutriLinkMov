import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DblocalService } from 'src/app/services/dblocal.service';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  standalone: false
})
export class BienvenidaPage implements OnInit {

  constructor(private router: Router, private db: DblocalService) { }

  ngOnInit() {
    setTimeout (() => {
      this.db.validarSesion().then(data => {
        if(data == 0) {
          this.router.navigate(['login'], { replaceUrl: true });
        } else {
          this.router.navigate(['home'], { replaceUrl: true });
        }
      })
    }, 4000);
  }
}
