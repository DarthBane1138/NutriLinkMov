import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setStyle({ style: Style.Dark }); // General
      StatusBar.setBackgroundColor({ color: 'transparent' }); // Fondo normal
      StatusBar.setOverlaysWebView({ overlay: false });  // Que no invada la StatusBar
    });
  }
}
