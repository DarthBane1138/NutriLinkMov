import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: false
})
export class NavBarComponent  implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {}

  irHome() {
    this.router.navigate(['home'], { replaceUrl: true });
  }
  irEstadisticas() {
    const timestamp = new Date().getTime();
    this.router.navigate(['/estadisticas', { t: timestamp }]);
  }
  irPerfil() {
    this.router.navigate(['perfil'], { replaceUrl: true });
  }

}
