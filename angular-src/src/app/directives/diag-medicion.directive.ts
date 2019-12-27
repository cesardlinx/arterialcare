import { Directive, Input, HostBinding } from '@angular/core';


@Directive({
  selector: '[appDiagMedicion]'
})
export class DiagMedicionDirective {

  @Input('appDiagMedicion')
  public appDiagMedicion: number;

  @Input() variable: string;

  @HostBinding('style.color')
  public get color(): string {
    let medida = this.appDiagMedicion;
    switch (this.variable) {
      case 'sistolica':
        if (medida > 120) {
          return 'red';
        } else if (medida <= 120 && medida >= 90) {
          return '#16d241';
        } else if (medida < 90) {
          return '#ffc107';
        }
        break;
      case 'diastolica':
        if (medida > 80) {
          return 'red';
        } else if (medida <= 80 && medida >= 60) {
          return '#16d241';
        } else if (medida < 60) {
          return '#ffc107';
        }
        break;
      case 'pulso':
        if (medida > 100) {
          return 'red';
        } else if (medida <= 100 && medida >= 60) {
          return '#16d241';
        } else if (medida < 60) {
          return '#ffc107';
        }
        break;
    }
  }

  @HostBinding('innerHtml')
  public get innerHtml(): string {
    if (this.variable === 'pulso') {
      return this.appDiagMedicion + ' lat/min';
    } else {
      return this.appDiagMedicion + ' mmHg';
    }
  }

  constructor() { }


}
