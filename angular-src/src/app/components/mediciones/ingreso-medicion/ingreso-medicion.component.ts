import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MensajeriaService } from '../../../providers/mensajeria.service';
import { MedicionesService } from '../../../providers/mediciones.service';


@Component({
  selector: 'app-ingreso-medicion',
  templateUrl: './ingreso-medicion.component.html',
  styles: []
})
export class IngresoMedicionComponent {


  constructor(private _mensajes: MensajeriaService,
              private _mediciones: MedicionesService,
              private router: Router) { }



  almacenarMedicion(event) {
    this._mediciones.almacenarMediciones(event).subscribe(data => {
      this.router.navigate(['/mediciones']);
      this._mensajes.crearMensaje({
        mensaje: 'Se ha almacenado una nueva medición.',
        tipo: 'success'
      });
    }, err => {
      this._mensajes.crearMensaje({
        mensaje: 'La medición no se ha almacenado.',
        tipo: 'danger'
      });
    });
  }
}


