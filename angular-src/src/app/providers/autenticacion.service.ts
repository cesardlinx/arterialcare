import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Respuesta } from '../interfaces/respuesta.interface';
import { Usuario } from '../interfaces/usuario.interface';
import { Router } from '@angular/router';
import { SensorService } from './sensor.service';


@Injectable()
export class AutenticacionService {

  private urlPrincipal = environment.url;

  constructor(private router: Router, private http: HttpClient, private _sensor: SensorService) { }


  autenticarUsuario(usuario: Usuario, coleccion: string) {
    let url = `${this.urlPrincipal}/${coleccion}/autenticar`;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Respuesta>(url, usuario, { headers });
  }


  leerToken() {
    let token = localStorage.getItem('token');
    if (token) {
      let payloadCoded = token.split('.')[1];
      let payload = JSON.parse(atob(payloadCoded));
      return payload;
    } else {
      return false;
    }
  }

  obtenerRol() {
    let payload = this.leerToken();
    if (payload) {
      return payload.role;
    } else {
      return false;
    }
  }

  obtenerId() {
    let payload = this.leerToken();
    if (payload) {
      return payload.sub;
    } else {
      return false;
    }
  }


  isLoggedIn() {
    let payload = this.leerToken();
    if (payload) {
      let hoy = new Date();
      let expira = new Date(parseInt(payload.exp, 10));
      if (expira < hoy) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  logout() {
    this._sensor.cerrarConeccion();
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  confirmarCorreo(coleccion: string, token: string) {
    let url = `${this.urlPrincipal}/${coleccion}/confirmar/${token}`;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Respuesta>(url);
  }

}
