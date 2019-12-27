import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { IngresoComponent } from './components/ingreso/ingreso.component';
import { CuentaComponent } from './components/cuenta/cuenta.component';
import { RegistroUsuarioComponent } from './components/registro/registro-usuario.component';
import { RolGuardService } from './providers/rol-guard.service';
import { HistorialMedicionesComponent } from './components/mediciones/historial-mediciones/historial-mediciones.component';
import { ImportacionMedicionesComponent } from './components/mediciones/importacion-mediciones/importacion-mediciones.component';
import { EditarMedicionesComponent } from './components/mediciones/editar-mediciones/editar-mediciones.component';
import { IngresoMedicionComponent } from './components/mediciones/ingreso-medicion/ingreso-medicion.component';
import { FechasMedicionesComponent } from './components/mediciones/fechas-mediciones/fechas-mediciones.component';
import { ResumenComponent } from './components/estadisticas/resumen/resumen.component';
import { GraficasComponent } from './components/estadisticas/graficas/graficas.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { NoauthGuardService } from './providers/noauth-guard.service';



const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'registro', component: RegistroComponent, canActivate: [NoauthGuardService] },
  { path: 'registro/:cuenta', component: RegistroUsuarioComponent, canActivate: [NoauthGuardService] },
  { path: 'ingreso/:cuenta', component: IngresoComponent, canActivate: [NoauthGuardService] },
  { path: 'ingreso/:cuenta/:token', component: IngresoComponent, canActivate: [NoauthGuardService] },
  {
    path: 'cuenta',
    component: CuentaComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente', 'doctor'] }
  },
  {
    path: 'pacientes',
    component: PacientesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['doctor'] }
  },
  {
    path: 'mediciones',
    component: HistorialMedicionesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'mediciones/importacion',
    component: ImportacionMedicionesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'mediciones/ingreso',
    component: IngresoMedicionComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'mediciones/fechas',
    component: FechasMedicionesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'mediciones/fechas/:id',
    component: FechasMedicionesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['doctor'] }
  },
  {
    path: 'mediciones/editar/:id',
    component: EditarMedicionesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'mediciones/:id',
    component: HistorialMedicionesComponent,
    canActivate: [RolGuardService],
    data: { roles: ['doctor'] }
  },
  {
    path: 'estadisticas',
    component: ResumenComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'estadisticas/graficas',
    component: GraficasComponent,
    canActivate: [RolGuardService],
    data: { roles: ['paciente'] }
  },
  {
    path: 'estadisticas/graficas/:id',
    component: GraficasComponent,
    canActivate: [RolGuardService],
    data: { roles: ['doctor'] }
  },
  {
    path: 'estadisticas/:id',
    component: ResumenComponent,
    canActivate: [RolGuardService],
    data: { roles: ['doctor'] }
  },
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];


export const appRouting = RouterModule.forRoot(routes);

