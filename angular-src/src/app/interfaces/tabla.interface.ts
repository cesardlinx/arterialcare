import { Texto } from './texto.interface';

export interface Tabla {
  style: string | string[];
  widths: string[];
  body: Texto[][];
}
