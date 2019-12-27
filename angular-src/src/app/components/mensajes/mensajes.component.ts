import { Component, OnInit, HostListener } from '@angular/core';
import { MensajeriaService } from '../../providers/mensajeria.service';
import { Mensaje } from '../../interfaces/mensaje.interface';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styles: []
})
export class MensajesComponent implements OnInit {

  tipo: string;
  mensaje: string;
  activado = false;
  flotar = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.flotar = (window.scrollY > 56) ? true : false;
  }

  constructor(private _mensajes: MensajeriaService) { }


  ngOnInit() {
    this._mensajes.envio.subscribe((data: Mensaje) => {
      this.mensaje = data.mensaje;
      this.tipo = data.tipo;
      if (data.mensaje) {
        this.activado = true;
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => { resolve(false); }, 6000);
        });
        promise.then((res: boolean) => this.activado = res);
      }
    });
  }


}
