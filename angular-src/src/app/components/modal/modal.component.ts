import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: []
})
export class ModalComponent {

  @Input() titulo: string;
  @Input() mensaje: string;
  @Input() tipo: string;

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('close') close: ElementRef;

  constructor(private router: Router) { }


  mostrar() {
    this.modal.nativeElement.click();
  }

  ocultar() {
    this.close.nativeElement.click();
  }

}
