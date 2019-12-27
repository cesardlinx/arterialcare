import { Component, OnInit, ViewChild } from '@angular/core';
import { AutenticacionService } from '../../providers/autenticacion.service';
import { Router } from '@angular/router';
import { SensorService } from '../../providers/sensor.service';
import { MensajeriaService } from '../../providers/mensajeria.service';
import { ModalCargandoComponent } from '../modal-cargando/modal-cargando.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { Medicion } from '../../interfaces/medicion.interface';
import { ModalMedicionComponent } from '../modal-medicion/modal-medicion.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: []
})
export class NavbarComponent implements OnInit {

  coneccion = false;

  private titulo = '';
  private mensaje = '';
  private medicion: Medicion;

  @ViewChild(ModalCargandoComponent) modal: ModalCargandoComponent;
  @ViewChild(ModalComponent) modalMensaje: ModalComponent;
  @ViewChild(ModalMedicionComponent) modalMedicion: ModalMedicionComponent;


  constructor(private _auth: AutenticacionService,
              private _sensor: SensorService,
              private _mensajes: MensajeriaService,
            ) { }

  ngOnInit() {

    if (this._auth.obtenerRol() === 'paciente') {
      this.conectarse();
      let token = localStorage.getItem('token');

      this._sensor.coneccionSensor().subscribe(data => {
        this.coneccion = true;
        this._sensor.enviarToken(token);
        this._mensajes.crearMensaje({
          mensaje: 'La aplicación está conectada al dispositivo de medición.',
          tipo: 'success'
        });
      });

      this._sensor.realizandoMedicion().subscribe(data => {
        this.modalMedicion.ocultar();
        this.modalMensaje.ocultar();
        this.modal.mostrar();
      });

      this._sensor.errorMedicion().subscribe(data => {
        this.modalMedicion.ocultar();
        this.modal.ocultar();
        this.titulo = 'Error';
        this.mensaje = 'Se ha producido un error en la medición.';
        this.modalMensaje.mostrar();
      });

      this._sensor.medicionFinalizada().subscribe(data => {
        this.modal.ocultar();
        this.modalMensaje.ocultar();
        this.titulo = '¡Medición exitosa!';
        this.medicion = {
          presionSistolica: data.presionSistolica,
          presionDiastolica: data.presionDiastolica,
          pulso: data.pulso
        };
        this.modalMedicion.mostrar();
      });

      this._sensor.desconeccionSensor().subscribe(data => {
        this.coneccion = false;
        this.modal.ocultar();
        this.modal.ocultar();
        this.modalMensaje.ocultar();
        this._mensajes.crearMensaje({
          mensaje: 'La aplicación se ha desconectado del dispositivo de medición.',
          tipo: 'danger'
        });
      });

    }
    this._sensor.reconeccion().subscribe(numeroIntento => {
      if (numeroIntento > 3) {
        this.desconectarse();
      }
    });
  }

  conectarse() {
    this._sensor.conectar();
  }

  desconectarse() {
    this._sensor.cerrarConeccion();
  }

}
