import { Component, OnInit, ViewChild } from '@angular/core';
import { MedicionesService } from '../../../providers/mediciones.service';
import { AutenticacionService } from '../../../providers/autenticacion.service';
import { MensajeriaService } from '../../../providers/mensajeria.service';
import { Medicion } from '../../../interfaces/medicion.interface';
import { ActivatedRoute } from '@angular/router';


import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ModalCargandoComponent } from '../../modal-cargando/modal-cargando.component';



@Component({
  selector: 'app-historial-mediciones',
  templateUrl: './historial-mediciones.component.html',
  styleUrls: ['./historial-mediciones.component.css']
})
export class HistorialMedicionesComponent implements OnInit {

  private mediciones: any;
  private pagina = 0;
  private siguientePag: boolean;
  private id: string;
  private rol: string;

  closeResult: string;
  @ViewChild(ModalCargandoComponent) modal: ModalCargandoComponent;
  private cargando = true;



  constructor(private _mediciones: MedicionesService,
              private _auth: AutenticacionService,
              private _mensajes: MensajeriaService,
              private activatedRoute: ActivatedRoute,

              private modalService: NgbModal) {
              }

  ngOnInit() {
    this.rol = this._auth.obtenerRol();
    if (this.rol === 'doctor') {
      this.activatedRoute.params.subscribe(params => {
        this.id = params['id'];
      });
    } else {
      this.id = this._auth.obtenerId();
    }
    this.modal.mostrar();
    this.cargarMediciones(this.id, this.pagina);
  }


  cargarMediciones(id: string, pagina: number) {
    this._mediciones.obtenerHistorial(id, pagina).subscribe(data => {
      this.mediciones = data.historial;
      this.siguientePag = data.siguientePag;
      this.cargando = false;
      this.modal.ocultar();
    }, err => {
      this.cargando = false;
      this.modal.ocultar();
      this._mensajes.crearMensaje({
        mensaje: 'No se pudo acceder al historial',
        tipo: 'danger'
      });
    });
  }

  cargarMas() {
    this.pagina++;
    this._mediciones.obtenerHistorial(this.id, this.pagina).subscribe(data => {
      this.siguientePag = data.siguientePag;
      this.mediciones.push.apply(this.mediciones, data.historial);
    }, err => {
      this._mensajes.crearMensaje({
        mensaje: 'No se pudo acceder',
        tipo: 'danger'
      });
    });
  }


  borrarMedicion(content, id: string) {
    this.modalService.open(content).result.then((result) => {
      if (result === 'aceptar') {
        this._mediciones.borrarMedicion(id).subscribe(data => {
          this.cargarMediciones(this.id, 0);
          this._mensajes.crearMensaje({
            mensaje: 'Se ha eliminado una medición.',
            tipo: 'success'
          });
        }, err => {
          this._mensajes.crearMensaje({
            mensaje: 'No se ha podido eliminar la medición.',
            tipo: 'danger'
          });
        });
      }
    });
  }
}
