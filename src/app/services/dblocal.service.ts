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
      db.executeSql('CREATE TABLE IF NOT EXISTS sesion (correo VARCHAR(50), contrasena VARCHAR(50), id_paciente INTEGER)', [])
        .then(() => console.log('PLF: TABLA SESIÓN CREADA CORRECTAMENTE'))
        .catch(e => console.log('PLF: ERROR AL CREAR TABLA SESIÓN: ' + JSON.stringify(e)));
    })
    .catch(e => console.log('PLF: ERROR AL CREAR O ABRIR BASE DE DATOS: ' + e));
  }

  // Almacenar Sesión
  async almacenarSesion(correo: string, contrasena: string, id_paciente: number) {
    try {
      const db = await this.sqlite.create({
        name: 'data.db',
        location: 'default'
      });
  
      await db.executeSql('DELETE FROM sesion', []);
      console.log("PLF: Sesión anterior sobrescrita");
  
      await db.executeSql('INSERT INTO sesion (correo, contrasena, id_paciente) VALUES (?,?,?)', [correo, contrasena, id_paciente]);
      console.log("PLF: SESIÓN ALMACENADA OK");
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
      return db.executeSql('SELECT correo, contrasena, id_paciente FROM sesion', [])
        .then((data) => {
          let objeto: any = {};
          objeto.correo = data.rows.item(0).correo;
          objeto.contrasena = data.rows.item(0).contrasena;
          objeto.id_paciente = data.rows.item(0).id_paciente; // <-- agregar esto
          return objeto;
        })
        .catch(e => console.log('PLF: ERROR AL OBTENER SESIÓN: ' + JSON.stringify(e)));
    })
    .catch(e => console.log('PLF: ERROR AL CREAR O ABRIR BASE DE DATOS' + JSON.stringify(e)));
  }

  eliminarSesion() {
    return this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      db.executeSql('DELETE FROM sesion', [])
      .then(() => console.log('PLF: SESIÓN ELIMINADA'))
      .catch(e => console.log('PLF: ERROR AL BORRAR SESIÓN: ' + JSON.stringify(e)));
    })
    .catch(e => console.log('PLF: ERROR AL CREAR O ABRIR BASE DE DATOS'));
  }

}
