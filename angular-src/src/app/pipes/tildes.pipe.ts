import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tildes'
})
export class TildesPipe implements PipeTransform {

  transform(value: string): string {
    if (value === 'Dia') {
      return 'Día';
    } else {
      return value;
    }
  }

}
