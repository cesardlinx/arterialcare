import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { Respuesta } from '../interfaces/respuesta.interface';
import { Medicion } from '../interfaces/medicion.interface';

@Injectable()
export class SensorService {

  constructor(private socket: Socket) { }

  enviarToken(token: string) {
    this.socket.emit('token', token);
  }

  realizandoMedicion() {
    return this.socket.fromEvent('medicion');
  }

  errorMedicion() {
    return this.socket.fromEvent('error');
  }

  medicionFinalizada() {
    return this.socket.fromEvent<Medicion>('finalizado');
  }

  coneccionSensor() {
    return this.socket.fromEvent('coneccion');
  }

  desconeccionSensor() {
    return this.socket.fromEvent('disconnect');
  }

  cerrarConeccion() {
    this.socket.disconnect();
  }

  conectar() {
    this.socket.connect();
  }

  reconeccion() {
    return this.socket.fromEvent('reconnect_attempt');
  }
}
