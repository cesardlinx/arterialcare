import { Usuario } from './usuario.interface';
import { Medicion } from './medicion.interface';

export interface Respuesta {
  success: boolean;
  doctores?: Usuario[];
  existe?: boolean;
  token?: string;
  paciente?: Usuario;
  doctor?: Usuario;
  msg?: string;
  importaciones?: number;
  historial?: Medicion[];
  total?: number;
  historialFecha?: Medicion[];
  medicion?: any;
  valores?: any;
  porcentajes?: number[];
  porcentajesDia?: number[];
  porcentajesTarde?: number[];
  porcentajesNoche?: number[];
  pacientes?: Usuario[];
}
