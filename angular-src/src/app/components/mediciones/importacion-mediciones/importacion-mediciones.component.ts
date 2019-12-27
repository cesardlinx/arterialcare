import { Component, ViewChild, Input } from '@angular/core';
import { Medicion } from '../../../interfaces/medicion.interface';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { MensajeriaService } from '../../../providers/mensajeria.service';
import { MedicionesService } from '../../../providers/mediciones.service';
import { Router } from '@angular/router';
import { ModalCargandoComponent } from '../../modal-cargando/modal-cargando.component';


@Component({
  selector: 'app-importar-mediciones',
  templateUrl: './importacion-mediciones.component.html',
  styleUrls: ['./importacion-mediciones.component.css']
})
export class ImportacionMedicionesComponent {

  estaSobreDropZone = false;
  formatosFecha = [
    moment.ISO_8601,
    'MM/DD/YYYY HH:mm:ss',
    'DD/MM/YYYY HH:mm:ss',
    'YYYY/MM/DD HH:mm:ss',
    'MM-DD-YYYY HH:mm:ss',
    'DD-MM-YYYY HH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'MM/DD/YY HH:mm',
    'DD/MM/YY HH:mm',
    'YY/MM/DD HH:mm',
    'YY-MM-DD HH:mm',
    'MM-DD-YY HH:mm',
    'DD-MM-YY HH:mm',
    'M/D/YY HH:mm',
    'D/M/YY HH:mm',
    'YY/M/D HH:mm',
    'YY-M-D HH:mm',
    'M-D-YY HH:mm',
    'D-M-YY HH:mm',
    'M/D/YY H:m',
    'D/M/YY H:m',
    'YY/M/D H:m',
    'YY-M-D H:m',
    'M-D-YY H:m',
    'D-M-YY H:m'
  ];

  @ViewChild(ModalCargandoComponent) modal: ModalCargandoComponent;

  constructor(private _mensajes: MensajeriaService,
              private _mediciones: MedicionesService,
              private router: Router
            ) { }


  private async archivoDropeado(event: File) {
    let archivo: File = event;
    let data = await this.leerArchivo(archivo);
    let datos = data.target.result;
    let mediciones: Medicion[];
    try {
      mediciones = this.convertirJSON(datos, archivo);
    } catch (error) {
      this._mensajes.crearMensaje({
        mensaje: 'El archivo no tiene el formato adecuado.',
        tipo: 'danger'
      });
    }
    await this.importarMediciones(mediciones);
    this.modal.ocultar();
  }

  private async archivoSubido(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length === 1) {
      this.modal.mostrar();
      let archivo: File = fileList[0];
      let data = await this.leerArchivo(archivo);
      let datos = data.target.result;
      let mediciones: Medicion[];
      try {
        mediciones = this.convertirJSON(datos, archivo);
      } catch (error) {
        this.modal.ocultar();
        this._mensajes.crearMensaje({
          mensaje: 'El archivo no tiene el formato adecuado.',
          tipo: 'danger'
        });
      }
      await this.importarMediciones(mediciones);
      this.modal.ocultar();
    } else {
      this._mensajes.crearMensaje({
        mensaje: 'Solo puede subir un archivo.',
        tipo: 'danger'
      });
    }
  }

  private leerArchivo(archivo: File): Promise<any> {
    let reader = new FileReader();
    const fileReaderPromise = new Promise(resolve => reader.onload = resolve);
    reader.readAsBinaryString(archivo);
    return fileReaderPromise;
  }

  private convertirJSON(data, archivo: File): Medicion[] {

    /*Si el archivo es Excel*/
    if (archivo.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      let wb: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });

      /* tomar la primera sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // /* obtener datos */
      let medicionesTemp: any = XLSX.utils.sheet_to_json(ws);
      let mediciones: Medicion[] = [];

      for (const medicion of medicionesTemp) {
        delete medicion['__rowNum__'];
        if (moment(medicion.fechaHora, this.formatosFecha, true).isValid()) {
          medicion.fechaHora = moment(medicion.fechaHora, this.formatosFecha).toDate();
        } else {
          throw new Error('Formato no válido');
        }
        medicion.presionSistolica = Number(medicion.presionSistolica);
        medicion.presionDiastolica = Number(medicion.presionDiastolica);
        medicion.pulso = Number(medicion.pulso);

        mediciones.push(medicion);
      }

      return mediciones;

      /*Si el archivo es JSON*/
    } else {
      let medicionesTemp = JSON.parse(data);
      let mediciones: Medicion[] = [];
      if (Array.isArray(medicionesTemp)) {
        for (const medicion of medicionesTemp) {
          if (moment(medicion.fechaHora, this.formatosFecha, true).isValid()) {
            medicion.fechaHora = moment(medicion.fechaHora, this.formatosFecha).toDate();
            mediciones.push(medicion);
          } else {
            throw new Error('Formato no válido');
          }
        }
        return mediciones;
      } else {
        if (moment(medicionesTemp.fechaHora, this.formatosFecha, true).isValid()) {
          medicionesTemp.fechaHora = moment(medicionesTemp.fechaHora, this.formatosFecha).toDate();
        } else {
          throw new Error('Formato no válido');
        }
        return medicionesTemp;
      }
    }
  }

  private importarMediciones(mediciones: Medicion | Medicion[]) {
    this._mediciones.almacenarMediciones(mediciones).subscribe(resp => {
      this._mensajes.crearMensaje({
        mensaje: `${resp.importaciones} mediciones importadas.`,
        tipo: 'success'
      });
    }, err => {
      this._mensajes.crearMensaje({
        mensaje: 'Error al intentar importar mediciones al servidor.',
        tipo: 'danger'
      });
    });
  }

  private archivoSobreDropZone(event: boolean) {
    this.estaSobreDropZone = event;
  }

  private leyendo() {
    this.modal.mostrar();
  }

}
