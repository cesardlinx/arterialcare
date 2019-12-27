import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Respuesta } from '../interfaces/respuesta.interface';
import * as moment from 'moment';
import 'rxjs/add/operator/map';


@Injectable()
export class EstadisticasService {

  private urlPrincipal = environment.url;

  constructor(private http: HttpClient) { }

  obtenerResumen(id: string, variable: string, desde: string, hasta: string) {
    let url = `${this.urlPrincipal}/estadisticas/resumen/${variable}/${id}?desde=${desde}&hasta=${hasta}`;

    return this.http.get<Respuesta>(url).map(resp => {
      resp.valores.sort((a, b) => {
        let partesDia = ['dia', 'tarde', 'noche'];
        let parteDiaA = partesDia.indexOf(a._id);
        let parteDiaB = partesDia.indexOf(b._id);
        return parteDiaA - parteDiaB;
      });
      return resp.valores;
    });
  }

  obtenerPromedios(id: string, desde: string, hasta: string) {
    let url = `${this.urlPrincipal}/estadisticas/promedio/${id}?desde=${desde}&hasta=${hasta}`;
    return this.http.get<Respuesta>(url).map(resp => {
      let fechas = [];
      for (const fecha of resp.valores.fechas) {
        fechas.push(fecha.split('T')[0]);
      }
      delete resp.valores.fechas;
      resp.valores.fechas = fechas;
      return resp.valores;
    });
  }

  obtenerPorcentajes(id: string, variable: string) {
    let url = `${this.urlPrincipal}/estadisticas/porcentajes/${variable}/${id}`;
    return this.http.get<Respuesta>(url);
  }

  obtenerPorcentajesHora(id: string, variable: string) {
    let url = `${this.urlPrincipal}/estadisticas/porcentajes/hora/${variable}/${id}`;
    return this.http.get<Respuesta>(url);
  }

  /*Experimental*/
  exportarACorreo(archivo: any) {
    let url = `${this.urlPrincipal}/estadisticas/exportar`;
    return this.http.put<Respuesta>(url, archivo);
  }
}
