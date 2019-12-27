import { Component, Input, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-modal-cargando',
  templateUrl: './modal-cargando.component.html',
  styleUrls: ['./modal-cargando.component.css']
})
export class ModalCargandoComponent  {

  @Input() titulo: string;

  turnOff = true;

  constructor() { }

  mostrar() {
    this.turnOff = false;
  }

  ocultar() {
    this.turnOff = true;
  }
}
