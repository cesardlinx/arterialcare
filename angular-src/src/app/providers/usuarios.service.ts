import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Respuesta } from '../interfaces/respuesta.interface';
import { Usuario } from '../interfaces/usuario.interface';
import { environment } from '../../environments/environment';


@Injectable()
export class UsuariosService {

  private urlPrincipal = environment.url;

  constructor(private http: HttpClient) { }

  buscarDoctores(termino: string) {
    const url = `${this.urlPrincipal}/doctores/buscar?nombre=${termino}`;
    return this.http.get<Respuesta>(url).map(resp => {
      if (resp.success) {
        let doctores: Usuario[] = [];

        for (const doctor of resp.doctores) {
          const nombre = doctor.nombre;
          const apellido = doctor.apellido;
          const nombreCompleto = `Dr. ${nombre} ${apellido}`;
          doctores.push({ _id: doctor._id, nombreCompleto });
        }
        return doctores;
      }
    });
  }

  existeUsuario(campo: string, tipoCuenta: string, buscarPor: string) {
    const url = `${this.urlPrincipal}/existe/${tipoCuenta}?${buscarPor}=${campo}`;
    return this.http.get<Respuesta>(url);
  }

  registrarUsuario(usuario: Usuario, coleccion: string) {
    let url = `${this.urlPrincipal}/${coleccion}/registrar`;
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<Respuesta>(url, usuario, {headers});
  }

  datosUsuario(id: string, coleccion: string) {
    let url;
    if (coleccion === 'pacientes') {
      url = `${this.urlPrincipal}/${coleccion}/${id}`;
    } else if (coleccion === 'doctores') {
      url = `${this.urlPrincipal}/${coleccion}`;
    }
    return this.http.get<Respuesta>(url);
  }

  actualizarUsuario(usuario: Usuario, coleccion: string) {
    let url = `${this.urlPrincipal}/${coleccion}`;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Respuesta>(url, usuario, { headers });
  }

  borrarUsuario(coleccion: string) {
    let url = `${this.urlPrincipal}/${coleccion}`;
    return this.http.delete<Respuesta>(url);
  }


}


