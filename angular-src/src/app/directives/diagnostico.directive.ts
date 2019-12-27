import { Directive, Input, HostBinding } from '@angular/core';

@Directive({
  selector: '[appDiagnostico]'
})
export class DiagnosticoDirective {

  @Input('appDiagnostico')
  public appDiagnostico: number;

  @Input() variable: string;

  @HostBinding('style.color')
  public get color(): string {
    let medida = this.appDiagnostico;
    switch (this.variable) {
      case 'sistolica':
        if (medida > 120) {
          return '#dc3545';
        } else if (medida <= 120 && medida >= 90) {
          return '#28a745';
        } else if (medida < 90) {
          return '#ffc107';
        }
        break;
      case 'diastolica':
        if (medida > 80) {
          return '#dc3545';
        } else if (medida <= 80 && medida >= 60) {
          return '#28a745';
        } else if (medida < 60) {
          return '#ffc107';
        }
        break;
      case 'pulso':
        if (medida > 100) {
          return '#dc3545';
        } else if (medida <= 100 && medida >= 60) {
          return '#28a745';
        } else if (medida < 60) {
          return '#ffc107';
        }
        break;
    }
  }

  @HostBinding('innerHtml')
  public get innerHtml(): string {
    if (this.variable === 'pulso') {
      return this.appDiagnostico + ' lat/min';
    } else {
      return this.appDiagnostico + ' mmHg';
    }
  }

  constructor() { }

}
