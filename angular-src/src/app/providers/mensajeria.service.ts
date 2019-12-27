import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Mensaje } from '../interfaces/mensaje.interface';

@Injectable()
export class MensajeriaService {

  envio: BehaviorSubject<any> = new BehaviorSubject({});

  constructor() { }

  crearMensaje(data: Mensaje) {
    this.envio.next(data);
  }


}
