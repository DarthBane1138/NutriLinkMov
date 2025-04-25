import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DblocalService {

  constructor(private sqlite: SQLite) {
    this.crearTablas();
   }

  crearTablas() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      db.executeSql('create table if not exists sesion (correo varchar(50), contrasena varchar(50))', [])
        .then(() => console.log('PLF: TABLA SESIÓN CREADA CORRECTAMENTE'))
        .catch(e => console.log('PLF: ERROR AL CREAR TABLA SESIÓN: ' + JSON.stringify(e)));
    })
    .catch(e => console.log('PLF: ERROR AL CREAR O ABRIR BASE DE DATOS' + e));
  }

  // Almacenar Sesión
  async almacenarSesion(correo: string, contrasena: string) {
    try {
      const db = await this.sqlite.create ({
        name: 'data.db',
        location: 'default'
      });

      await db.executeSql('delete from sesion', []);
      console.log("PLF: Sesión anterior sobrescrita")
      await db.executeSql('insert into sesion values (?,?)', [correo, contrasena]);
      console.log("PLF: SESIÓN ALMACENADA OK")
    } catch (e) {
      console.log('PLF: ERROR AL ALMACENAR SESIÓN: ' + JSON.stringify(e));
    }
  }

  // Validar sesión
  validarSesion() {
    return this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      return db.executeSql('SELECT COUNT(correo) as cantidad from sesion', [])
        .then((data) => {
          return data.rows.item(0).cantidad;
        })
        .catch(e => console.log('PLF: ERROR AL VALIDAR SESIÓN: ' + JSON.stringify(e)));
    })
    .catch(e => console.log('PLF: ERROR AL CREAR O ABRIR BASE DE DATOS' + JSON.stringify(e)));
  }

  obtenerSesion() {
    return this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      return db.executeSql('SELECT correo, contrasena from sesion', [])
        .then((data) => {
          let objeto: any = {};
          objeto.correo = data.rows.item(0).correo;
          objeto.contrasena = data.rows.item(0).contrasena;
          return objeto;
        })
        .catch(e => console.log('PLF: ERROR AL OBTENER SESIÓN: ' + JSON.stringify(e)));
    })
    .catch(e => console.log('PLF: ERROR AL CREAR O ABRIR BASE DE DATOS' + JSON.stringify(e)));
  }
}
