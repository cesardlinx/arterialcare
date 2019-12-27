import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import * as esLocale from 'date-fns/locale/es';
import { DatepickerOptions } from 'ng2-datepicker';
import { environment } from '../../../../environments/environment';
import { Medicion } from '../../../interfaces/medicion.interface';


@Component({
  selector: 'app-forma-mediciones',
  templateUrl: './forma-mediciones.component.html',
  styles: []
})
export class FormaMedicionesComponent {

  formulario: FormGroup;
  @Output() datosFormulario: EventEmitter<Medicion> = new EventEmitter();
  private _medicion: Medicion;

  get medicion(): Medicion {
    return this._medicion;
  }

  @Input()
  set medicion(medicion: Medicion) {
    this._medicion = medicion;
    if (medicion) {
      this.formulario.setValue(medicion);
    }
  }

  datepickerOptions = environment.datepickerOptions;

  constructor() {
    this.formulario = new FormGroup({
      'fecha': new FormControl(new Date(), [
        Validators.required
      ]),
      'hora': new FormControl('22:13', [
        Validators.required
      ]),
      'presionSistolica': new FormControl('', [
        Validators.required,
        Validators.max(200),
        Validators.pattern('([0-9]+|[0-9]+\.[0-9]+)')
      ]),
      'presionDiastolica': new FormControl('', [
        Validators.required,
        Validators.max(200),
        Validators.pattern('([0-9]+|[0-9]+\.[0-9]+)')
      ]),
      'pulso': new FormControl('', [
        Validators.required,
        Validators.max(200),
        Validators.pattern('([0-9]+|[0-9]+\.[0-9]+)')
      ]),
    });
  }

  recibirDatos() {
    if (this.formulario.valid) {
      let horasMinutos = this.formulario.get('hora').value;
      let horas = horasMinutos.hour;
      let minutos = horasMinutos.minute;

      let fechaTemp = new Date(this.formulario.get('fecha').value);

      let fecha = moment(fechaTemp).format('MM/DD/YYYY');

      let fechaHora = moment(`${fecha} ${horas}:${minutos}`, 'MM/DD/YYYY HH:mm').toDate();

      let medicion = <Medicion>{
        fechaHora: fechaHora,
        presionSistolica: Number(this.formulario.get('presionSistolica').value),
        presionDiastolica: Number(this.formulario.get('presionDiastolica').value),
        pulso: Number(this.formulario.get('pulso').value)
      };

      this.datosFormulario.emit(medicion);
    }
  }


}
