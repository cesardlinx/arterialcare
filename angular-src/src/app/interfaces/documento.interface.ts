import { Tabla } from './tabla.interface';
import { Texto } from './texto.interface';

export interface Documento {
  content: any[] | string[] | Texto[] | Tabla[];
  styles: any;
}
