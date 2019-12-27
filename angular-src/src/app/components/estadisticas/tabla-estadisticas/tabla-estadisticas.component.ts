import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tabla-estadisticas',
  templateUrl: './tabla-estadisticas.component.html',
  styleUrls: ['../../mediciones/historial-mediciones/historial-mediciones.component.css']
})
export class TablaEstadisticasComponent {

  @Input() nombre: string;
  @Input() datos: any[];
  @Input() diagnostico: string;

  constructor() { }

}
