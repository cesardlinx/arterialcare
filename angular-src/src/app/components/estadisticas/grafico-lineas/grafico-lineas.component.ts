import { Component, OnInit } from '@angular/core';
import { EstadisticasService } from '../../../providers/estadisticas.service';
import { AutenticacionService } from '../../../providers/autenticacion.service';
import { MensajeriaService } from '../../../providers/mensajeria.service';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-grafico-lineas',
  templateUrl: './grafico-lineas.component.html',
  styleUrls: ['./grafico-lineas.component.css']
})
export class GraficoLineasComponent implements OnInit {

  private id: string;
  private rol: string;
  private tipoGrafico = 'line';

  private fechas: string[];


  private lineChartData: Array<any> = [
    { data: [], label: 'Presión Sistólica' },
    { data: [], label: 'Presión Diastólica' },
    { data: [], label: 'Pulso' }
  ];
  private lineChartOptions: any = {
    responsive: true
  };

  private lineChartLegend = true;

  private desdeOptions = environment.datepickerOptions;
  private hastaOptions = environment.datepickerOptions;



  private _desde = moment().subtract(7, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  private _hasta = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  get desde() {
    return this._desde;
  }

  set desde(desde) {
    this._desde = desde;
    if (this.desde > this.hasta) {
      this._mensajes.crearMensaje({
        mensaje: 'La fecha "desde" debe ser menor a la fecha "hasta".',
        tipo: 'danger'
      });
    }
    this.obtenerDatos(this.id, this.desde.toISOString(), this.hasta.toISOString());


  }

  get hasta(): moment.Moment {
    return this._hasta;
  }

  set hasta(hasta: moment.Moment) {
    this._hasta = hasta;
    if (this.desde > this.hasta) {
      this._mensajes.crearMensaje({
        mensaje: 'La fecha "desde" debe ser menor a la fecha "hasta".',
        tipo: 'danger'
      });
    }
    this.obtenerDatos(this.id, this.desde.toISOString(), this.hasta.toISOString());

  }

  constructor(private _estadisticas: EstadisticasService,
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
    this.obtenerDatos(this.id, this.desde.toISOString(), this.hasta.toISOString());
  }

  obtenerDatos(id: string, desde: string, hasta: string) {
    this._estadisticas.obtenerPromedios(id, desde, hasta).subscribe(data => {
      this.fechas = data.fechas;
      this.lineChartData[0].data = data.presionSistolica;
      this.lineChartData[1].data = data.presionDiastolica;
      this.lineChartData[2].data = data.pulso;
    });
  }
}
