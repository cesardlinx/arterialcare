import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicionesService } from '../../../providers/mediciones.service';
import { Medicion } from '../../../interfaces/medicion.interface';
import { MensajeriaService } from '../../../providers/mensajeria.service';

@Component({
  selector: 'app-editar-mediciones',
  templateUrl: './editar-mediciones.component.html',
  styleUrls: []
})
export class EditarMedicionesComponent implements OnInit {

  medicion: any;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private _mensajes: MensajeriaService,
              private _mediciones: MedicionesService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      this._mediciones.obtenerMedicion(id).subscribe(data => {
        this.medicion = data;
      });
    });
  }

  editarMedicion(event) {
    this._mediciones.almacenarMediciones(event).subscribe(data => {
      this.router.navigate(['/mediciones']);
      this._mensajes.crearMensaje({
        mensaje: 'Se han almacenado los cambios.',
        tipo: 'success'
      });
    }, err => {
      this._mensajes.crearMensaje({
        mensaje: 'La medición no se ha actualizado.',
        tipo: 'danger'
      });
    });
  }

}
