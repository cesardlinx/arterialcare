

import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { MedicionesService } from '../../../providers/mediciones.service';
import { AutenticacionService } from '../../../providers/autenticacion.service';
import { MensajeriaService } from '../../../providers/mensajeria.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-fechas-mediciones',
  templateUrl: './fechas-mediciones.component.html',
  styleUrls: ['./fechas-mediciones.component.css']
})
export class FechasMedicionesComponent implements OnInit {

  private diasMes = [];
  private id: string;
  private rol: string;
  private nombreMes: string;
  private anio = new Date().getFullYear();
  private mes = new Date().getMonth();
  private hoy = new Date().getDate(); // no cambia

  private mediciones: any[] = [];

  constructor(private renderer: Renderer2,
              private elRef: ElementRef,
              private _mediciones: MedicionesService,
              private _auth: AutenticacionService,
              private _mensajes: MensajeriaService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.rol = this._auth.obtenerRol();
    if (this.rol === 'doctor') {
      this.activatedRoute.params.subscribe(params => {
        this.id = params['id'];
      });
    } else {
      this.id = this._auth.obtenerId();
    }
    this.generarCalendario();
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.obtenerMediciones(this.id, hoy.toISOString());
  }

  private generarCalendario() {
    let primero = new Date(this.anio, this.mes, this.hoy);
    primero.setDate(1);
    let mes = primero.getMonth();
    let anio = primero.getFullYear();
    let meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre'];
    this.nombreMes = meses[mes];
    let numerodiasMes = new Date(anio, mes + 1, 0).getDate();
    let diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    let primerDia = diasSemana[primero.getDay()];
    let arr = [];
    let diaTemp = 0;
    let numeroVacios = diasSemana.indexOf(primerDia);
    let numeroSemanas = Math.ceil((numerodiasMes + numeroVacios) / 7);
    for (let i = 1; i <= numeroSemanas; i++) {
      if (i === 1) {
        for (let j = 0; j < 7; j++) {
          if (j < numeroVacios) {
            arr.push('');
          } else {
            arr.push(++diaTemp);
          }
        }
        this.diasMes.push(arr);
        arr = [];
      } else {
        for (let j = 0; j < 7; j++) {
          if (diaTemp < numerodiasMes) {
            arr.push(++diaTemp);
          } else {
            arr.push('');
          }
        }
        this.diasMes.push(arr);
        arr = [];
      }
    }
  }

  /**
   * Función para obtención de fecha del calendario
   */
  private obtenerFecha(event: any) {
    let elSelec = this.elRef.nativeElement.querySelector('.seleccionado');
    if (elSelec) {
      this.renderer.removeClass(elSelec, 'seleccionado');
    }
    this.renderer.addClass(event.target, 'seleccionado');


    let dia = event.srcElement.innerText;
    let mes = event.srcElement.attributes['data-mes'].value;
    let anio = event.srcElement.attributes['data-anio'].value;
    let fecha = new Date(anio, mes, dia).toISOString();

    this.obtenerMediciones(this.id, fecha);
  }

  private obtenerMediciones(id: string, fecha: string) {
    this._mediciones.obtenerMedicionesFecha(id, fecha).subscribe(data => {

      this.mediciones = data;
    }, err => {
      this._mensajes.crearMensaje({
        mensaje: 'No se puso obtener mediciones',
        tipo: 'danger'
      });
    });
  }

  regresarMes() {
    this.diasMes = [];
    --this.mes;
    if (this.mes === -1) {
      this.anio--;
      this.mes = 11;
    }
    this.generarCalendario();
  }

  private adelantarMes() {
    this.diasMes = [];
    this.mes++;
    if (this.mes === 12) {
      this.anio++;
      this.mes = 0;
    }
    this.generarCalendario();
  }

}
