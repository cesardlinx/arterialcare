import { Component, OnInit } from '@angular/core';
import { EstadisticasService } from '../../../providers/estadisticas.service';
import { AutenticacionService } from '../../../providers/autenticacion.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-grafico-radar',
  templateUrl: './grafico-radar.component.html',
  styleUrls: ['./grafico-radar.component.css']
})
export class GraficoRadarComponent implements OnInit {

  private etiquetas: string[] = ['Alta', 'Normal', 'Baja'];

  private radarDatosTotales: any = [
    { data: [], label: 'Presión Sistólica' },
    { data: [], label: 'Presión Diastólica' },
    { data: [], label: 'Pulso' }
  ];

  private datosPresionSistolica: number[];
  private datosPresionDiastolica: number[];
  private datosPulso: number[];


  private id: string;
  private rol: string;

  constructor(private _estadisticas: EstadisticasService,
              private _auth: AutenticacionService,
              private activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    this.rol = this._auth.obtenerRol();
    if (this.rol === 'doctor') {
      this.activatedRoute.params.subscribe(params => {
        this.id = params['id'];
      });
    } else {
      this.id = this._auth.obtenerId();
    }

    let datosSistolica = this._estadisticas.obtenerPorcentajes(this.id, 'sistolica').toPromise();
    let datosDiastolica = this._estadisticas.obtenerPorcentajes(this.id, 'diastolica').toPromise();
    let datosPulso = this._estadisticas.obtenerPorcentajes(this.id, 'pulso').toPromise();

    let datos = await Promise.all([datosSistolica, datosDiastolica, datosPulso]);

    this.radarDatosTotales[0].data = datos[0].porcentajes;
    this.radarDatosTotales[1].data = datos[1].porcentajes;
    this.radarDatosTotales[2].data = datos[2].porcentajes;
  }

}
