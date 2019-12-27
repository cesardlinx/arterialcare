import {
  Directive, EventEmitter, ElementRef,
  HostListener, Input, Output
} from '@angular/core';
import { MensajeriaService } from '../providers/mensajeria.service';


@Directive({
  selector: '[appDropFiles]'
})
export class DropFilesDirective {


  @Output() archivoSobre: EventEmitter<any> = new EventEmitter();
  @Output() contenido: EventEmitter<File> = new EventEmitter();
  @Output() leyendo: EventEmitter<boolean> = new EventEmitter();


  constructor(public elemento: ElementRef, private _mensajes: MensajeriaService) { }

  // ==================================================================

  @HostListener('dragenter', ['$event'])
  public onDragEnter(event: any) {
    this.archivoSobre.emit(true);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: any) {

    this._prevenirYDetener(event);
    this.archivoSobre.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: any) {
    this.archivoSobre.emit(false);

  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any) {
    this._prevenirYDetener(event);
    this.archivoSobre.emit(false);
    this.leyendo.emit(true);
    const transferencia = this._getTransferencia(event);

    if (!transferencia) {
      return;
    }

    if (transferencia.files.length === 1) {
      let archivo: File = transferencia.files[0];
      this.contenido.emit(archivo);
    } else {
      this._mensajes.crearMensaje({
        mensaje: 'Solo puede subir un archivo.',
        tipo: 'danger'
      });
    }

  }

  // =======================================================================

  private _getTransferencia(event: any) {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
  }

  private _prevenirYDetener(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

}
