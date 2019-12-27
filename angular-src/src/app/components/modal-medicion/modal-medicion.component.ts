import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Medicion } from '../../interfaces/medicion.interface';

@Component({
  selector: 'app-modal-medicion',
  templateUrl: './modal-medicion.component.html',
  styleUrls: ['./modal-medicion.component.css']
})
export class ModalMedicionComponent  {

  @Input() titulo: string;
  @Input() medicion: Medicion;

  turnOff = true;

  constructor() { }

  mostrar() {
    this.turnOff = false;
  }

  ocultar() {
    this.turnOff = true;
  }
}
