import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Respuesta } from '../interfaces/respuesta.interface';
import { environment } from '../../environments/environment';


@Injectable()
export class DoctoresService {

  private urlPrincipal = environment.url;

  constructor(private http: HttpClient) { }

  obtenerPacientes() {
    let url = `${this.urlPrincipal}/doctores/pacientes`;
    return this.http.get<Respuesta>(url);
  }

}
