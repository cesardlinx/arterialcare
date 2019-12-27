import { Component, OnInit } from '@angular/core';
import { EstadisticasService } from '../../../providers/estadisticas.service';
import { AutenticacionService } from '../../../providers/autenticacion.service';
import { environment } from '../../../../environments/environment';
import * as moment from 'moment';
import { MensajeriaService } from '../../../providers/mensajeria.service';
import { ActivatedRoute } from '@angular/router';
import { Documento } from '../../../interfaces/documento.interface';

declare var pdfMake: any;

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: [
    './resumen.component.css',
    '../../mediciones/historial-mediciones/historial-mediciones.component.css'
  ]
})
export class ResumenComponent implements OnInit {

  private id: string;
  private rol: string;
  private datosPresionSistolica: any[] = [];
  private datosPresionDiastolica: any[] = [];
  private datosPulso: any[] = [];
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
    this.obtenerPresionSistolica(this.id, this.desde.toISOString(), this.hasta.toISOString());
    this.obtenerPresionDiastolica(this.id, this.desde.toISOString(), this.hasta.toISOString());
    this.obtenerPulso(this.id, this.desde.toISOString(), this.hasta.toISOString());

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
    this.obtenerPresionSistolica(this.id, this.desde.toISOString(), this.hasta.toISOString());
    this.obtenerPresionDiastolica(this.id, this.desde.toISOString(), this.hasta.toISOString());
    this.obtenerPulso(this.id, this.desde.toISOString(), this.hasta.toISOString());
  }


  constructor(private _estadisticas: EstadisticasService,
              private _auth: AutenticacionService,
              private _mensajes: MensajeriaService,
              private activatedRoute: ActivatedRoute,
            ) { }

  ngOnInit() {
    this.rol = this._auth.obtenerRol();
    if (this.rol === 'doctor') {
      this.activatedRoute.params.subscribe(params => {
        this.id = params['id'];
      });
    } else {
      this.id = this._auth.obtenerId();
    }
    let desde = this.desde.toISOString();
    let hasta = this.hasta.toISOString();
    this.obtenerPresionSistolica(this.id, desde, hasta);
    this.obtenerPresionDiastolica(this.id, desde, hasta);
    this.obtenerPulso(this.id, desde, hasta);
  }

  private obtenerPresionSistolica(id: string, desde: string, hasta: string) {
    this._estadisticas.obtenerResumen(id, 'sistolica', desde, hasta).subscribe(data => {
      this.datosPresionSistolica = data;
    });
  }

  private obtenerPresionDiastolica(id: string, desde: string, hasta: string) {
    this._estadisticas.obtenerResumen(id, 'diastolica', desde, hasta).subscribe(data => {
      this.datosPresionDiastolica = data;
    });
  }

  private obtenerPulso(id: string, desde: string, hasta: string) {
    this._estadisticas.obtenerResumen(id, 'pulso', desde, hasta).subscribe(data => {
      this.datosPulso = data;
    });
  }

  private exportarEstadisticas(modo: string) {
    let docDefinition = <Documento>{
      content: [
        { text: 'Resumen de Estadísticas', style: 'header', alignment: 'center' },

        { text: 'Desde:', style: ['subheader2', 'top20'] },
        moment(this.desde).format('YYYY/MM/DD'),
        { text: 'Hasta:', style: 'subheader2' },
        moment(this.hasta).format('YYYY/MM/DD'),

        { text: 'Presión Sistólica', style: ['subheader2', 'top20'] },
        {
          style: 'tabla',
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Hora del Día', style: 'tableHeader', alignment: 'center' },
                { text: 'Máximo', style: 'tableHeader', alignment: 'center' },
                { text: 'Promedio', style: 'tableHeader', alignment: 'center' },
                { text: 'Mínimo', style: 'tableHeader', alignment: 'center' },
                { text: 'Total', style: 'tableHeader', alignment: 'center' },
              ]
            ]
          }
        },
        { text: 'Presión Diastólica', style: ['subheader2', 'top20'] },
        {
          style: 'tabla',
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Hora del Día', style: 'tableHeader', alignment: 'center' },
                { text: 'Máximo', style: 'tableHeader', alignment: 'center' },
                { text: 'Promedio', style: 'tableHeader', alignment: 'center' },
                { text: 'Mínimo', style: 'tableHeader', alignment: 'center' },
                { text: 'Total', style: 'tableHeader', alignment: 'center' },
              ]
            ]
          }
        },
        { text: 'Pulso', style: ['subheader2', 'top-20'] },
        {
          style: 'tabla',
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Hora del Día', style: 'tableHeader', alignment: 'center' },
                { text: 'Máximo', style: 'tableHeader', alignment: 'center' },
                { text: 'Promedio', style: 'tableHeader', alignment: 'center' },
                { text: 'Mínimo', style: 'tableHeader', alignment: 'center' },
                { text: 'Total', style: 'tableHeader', alignment: 'center' },
              ]
            ]
          }
        }
      ],
      styles: {
        header: {
          color: '#10436b',
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        subheader2: {
          color: '#064386',
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tabla: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        top20: {
          margin: [20, 0, 0, 0]
        }
      }
    };

    for (const stat of this.datosPresionSistolica) {
      docDefinition.content[6].table.body.push(this.estadisticasDoc(stat, 'sistolica'));
    }

    for (const stat of this.datosPresionDiastolica) {
      docDefinition.content[8].table.body.push(this.estadisticasDoc(stat, 'diastolica'));
    }

    for (const stat of this.datosPulso) {
      docDefinition.content[10].table.body.push(this.estadisticasDoc(stat, 'pulso'));
    }

    /*Experimental*/
    if (modo === 'pdf') {
      pdfMake.createPdf(docDefinition).download('estadisticas.pdf');
    } else if (modo === 'correo') {
      let resumen = pdfMake.createPdf(docDefinition);
      console.log(resumen);
      
      // this._estadisticas.exportarACorreo(resumen).subscribe(data => {
      //   this._mensajes.crearMensaje({
      //     mensaje: 'Se ha exportado el resumen al correo',
      //     tipo: 'success'
      //   });
      // }, err => {
      //   this._mensajes.crearMensaje({
      //     mensaje: 'No se ha exportado el resumen al correo',
      //     tipo: 'danger'
      //   });
      // });
    }
  }

  private estadisticasDoc(stat, variable: string) {
    let horaDia: string;
    switch (stat._id) {
      case 'dia':
        horaDia = 'Día';
        break;
      case 'tarde':
        horaDia = 'Tarde';
        break;
      case 'noche':
        horaDia = 'Noche';
        break;
    }
    let unidad: string;
    if (variable === 'pulso') {
      unidad = 'lat/min';
    } else {
      unidad = 'mmHg';
    }
    let colorMin = this.obtenerColorDoc(stat.min, variable);
    let colorAvg = this.obtenerColorDoc(stat.avg, variable);
    let colorMax = this.obtenerColorDoc(stat.max, variable);

    let stats = [
      { text: horaDia, alignment: 'center' },
      { text: `${stat.max.toFixed(2)} ${unidad}`, alignment: 'center', color: colorMax },
      { text: `${stat.avg.toFixed(2)} ${unidad}`, alignment: 'center', color: colorAvg },
      { text: `${stat.min.toFixed(2)} ${unidad}`, alignment: 'center', color: colorMin},
      { text: stat.total, alignment: 'center'},
    ];
    return stats;
  }

  private obtenerColorDoc(medida: number, variable: string) {
    let color: string;
    switch (variable) {
      case 'sistolica':
        if (medida > 120) {
          color = '#dc3545';
        } else if (medida <= 120 && medida >= 90) {
          color = '#28a745';
        } else if (medida < 90) {
          color = '#ffc107';
        }
        break;
      case 'diastolica':
        if (medida > 80) {
          color = '#dc3545';
        } else if (medida <= 80 && medida >= 60) {
          color = '#28a745';
        } else if (medida < 60) {
          color = '#ffc107';
        }
        break;
      case 'pulso':
        if (medida > 100) {
          color = '#dc3545';
        } else if (medida <= 100 && medida >= 60) {
          color = '#28a745';
        } else if (medida < 60) {
          color = '#ffc107';
        }
        break;
    }
    return color;
  }

}
