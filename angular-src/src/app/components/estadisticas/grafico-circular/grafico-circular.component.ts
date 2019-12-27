import { Component, OnInit, Input } from '@angular/core';
import { EstadisticasService } from '../../../providers/estadisticas.service';
import { AutenticacionService } from '../../../providers/autenticacion.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-grafico-circular',
  templateUrl: './grafico-circular.component.html',
  styleUrls: ['./grafico-circular.component.css']
})
export class GraficoCircularComponent implements OnInit {

  private etiquetas: string[] = ['Alto', 'Normal', 'Bajo'];
  private datosTotal: number[] = [0, 0, 0];
  private datosDia: number[] = [0, 0, 0];
  private datosTarde: number[] = [0, 0, 0];
  private datosNoche: number[] = [0, 0, 0];

  private id: string;
  private rol: string;

  private tipoGrafico = 'doughnut';
  private _variable = 'sistolica';

  get variable(): string {
    return this._variable;
  }

  set variable(variable: string) {
    this._variable = variable;
    this.obtenerDatos(this.id, this.variable);
  }

  constructor(private _estadisticas: EstadisticasService,
              private _auth: AutenticacionService,
              private activatedRoute: ActivatedRoute)  { }

  ngOnInit() {
    this.rol = this._auth.obtenerRol();
    if (this.rol === 'doctor') {
      this.activatedRoute.params.subscribe(params => {
        this.id = params['id'];
      });
    } else {
      this.id = this._auth.obtenerId();
    }
    this.obtenerDatos(this.id, this.variable);
  }

  private obtenerDatos(id: string, variable: string) {
    this._estadisticas.obtenerPorcentajes(id, variable).subscribe(data => {
      this.datosTotal = data.porcentajes;
    });
    this._estadisticas.obtenerPorcentajesHora(id, variable).subscribe(data => {
      this.datosDia = data.porcentajesDia;
      this.datosTarde = data.porcentajesTarde;
      this.datosNoche = data.porcentajesNoche;
    });
  }

}
