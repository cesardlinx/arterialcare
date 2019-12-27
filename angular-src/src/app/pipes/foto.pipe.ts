import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'foto'
})
export class FotoPipe implements PipeTransform {

  transform(sexo: string, tipoCuenta: string): string {
    switch (tipoCuenta) {
      case 'doctor':
        switch (sexo) {
          case 'Femenino':
            return 'assets/img/usuarios/doctora.png';
          default:
            return 'assets/img/usuarios/doctor.png';
        }
      default:
        switch (sexo) {
          case 'Femenino':
            return 'assets/img/usuarios/mujer.png';
          default:
            return 'assets/img/usuarios/hombre.png';
        }
    }
  }

}
