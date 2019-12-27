import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Respuesta } from '../interfaces/respuesta.interface';
import { Medicion } from '../interfaces/medicion.interface';
import * as moment from 'moment';
import 'rxjs/add/operator/map';


@Injectable()
export class MedicionesService {

  private urlPrincipal = environment.url;

  constructor(private http: HttpClient) { }

  almacenarMediciones(mediciones: Medicion | Medicion[]) {
    let url = `${this.urlPrincipal}/mediciones/importar`;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Respuesta>(url, mediciones, { headers });
  }

  obtenerHistorial(id: string, pagina: number) {
    let url = `${this.urlPrincipal}/mediciones/historial/${id}?pagina=${pagina}`;
    return this.http.get<Respuesta>(url).map(resp => {
      let historial = [];
      let medicion = {};
      for (const medicionTemp of resp.historial) {
        medicion['fecha'] = moment(medicionTemp.hora).format('DD/MM/YYYY');
        medicion['hora'] = moment(medicionTemp.hora).format('HH:mm:ss');
        medicion['presionSistolica'] = medicionTemp.presionSistolica;
        medicion['presionDiastolica'] = medicionTemp.presionDiastolica;
        medicion['pulso'] = medicionTemp.pulso;
        medicion['id'] = medicionTemp.id;
        historial.push(medicion);
        medicion = {};
      }
      if (resp.hasOwnProperty('total')) {
        let totalPaginas: number = Math.ceil(resp.total / 10);
        let siguientePag = !((pagina + 1) >= totalPaginas);
        return {siguientePag, historial};
      } else {
        return { siguientePag: false, historial: false };
      }

    });
  }

  obtenerMedicionesFecha(id: string, fecha: string) {
    let url = `${this.urlPrincipal}/mediciones/historial/fechas/${id}?fecha=${fecha}`;
    return this.http.get<Respuesta>(url).map(resp => {
      let historialFecha = [];
      let medicion = {};
      for (const medicionTemp of resp.historialFecha) {
        medicion['fecha'] = moment(medicionTemp.hora).format('DD/MM/YYYY');
        medicion['hora'] = moment(medicionTemp.hora).format('HH:mm:ss');
        medicion['presionSistolica'] = medicionTemp.presionSistolica;
        medicion['presionDiastolica'] = medicionTemp.presionDiastolica;
        medicion['pulso'] = medicionTemp.pulso;
        historialFecha.push(medicion);
        medicion = {};
      }
      return historialFecha;
    });
  }

  obtenerMedicion(id: string) {
    let url = `${this.urlPrincipal}/mediciones/${id}`;
    return this.http.get<Respuesta>(url).map(resp => {
      let medicionTemp = resp.medicion.valores[0];
      let fecha = new Date(medicionTemp.hora);
      let horaTemp = fecha.getHours();
      let minutosTemp = fecha.getMinutes();
      let hora = { hour: horaTemp, minute: minutosTemp };
      let medicion = {
        fecha,
        hora,
        presionSistolica: medicionTemp.presionSistolica,
        presionDiastolica: medicionTemp.presionDiastolica,
        pulso: medicionTemp.pulso,
      };
      return medicion;
    });
  }

  actualizarMedicion(id: string, medicion: Medicion) {
    let url = `${this.urlPrincipal}/mediciones/${id}`;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Respuesta>(url, medicion, {headers});
  }

  borrarMedicion(id: string) {
    let url = `${this.urlPrincipal}/mediciones/${id}`;
    return this.http.delete<Respuesta>(url);
  }

}
