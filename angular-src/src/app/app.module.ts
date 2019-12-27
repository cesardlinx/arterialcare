import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgDatepickerModule } from 'ng2-datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { RECAPTCHA_LANGUAGE } from 'ng-recaptcha';

const config: SocketIoConfig = { url: 'http://localhost:8988', options: { autoConnect: false} };

import { appRouting } from './app.routes';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { IngresoComponent } from './components/ingreso/ingreso.component';
import { CuentaComponent } from './components/cuenta/cuenta.component';
import { RegistroUsuarioComponent } from './components/registro/registro-usuario.component';
import { MensajesComponent } from './components/mensajes/mensajes.component';
import { HistorialMedicionesComponent } from './components/mediciones/historial-mediciones/historial-mediciones.component';
import { EditarMedicionesComponent } from './components/mediciones/editar-mediciones/editar-mediciones.component';
import { ImportacionMedicionesComponent } from './components/mediciones/importacion-mediciones/importacion-mediciones.component';
import { IngresoMedicionComponent } from './components/mediciones/ingreso-medicion/ingreso-medicion.component';
import { ModalCargandoComponent } from './components/modal-cargando/modal-cargando.component';
import { FechasMedicionesComponent } from './components/mediciones/fechas-mediciones/fechas-mediciones.component';
import { FormaMedicionesComponent } from './components/mediciones/forma-mediciones/forma-mediciones.component';
import { ResumenComponent } from './components/estadisticas/resumen/resumen.component';
import { GraficasComponent } from './components/estadisticas/graficas/graficas.component';
import { TablaEstadisticasComponent } from './components/estadisticas/tabla-estadisticas/tabla-estadisticas.component';
import { GraficoLineasComponent } from './components/estadisticas/grafico-lineas/grafico-lineas.component';
import { GraficoCircularComponent } from './components/estadisticas/grafico-circular/grafico-circular.component';
import { GraficoRadarComponent } from './components/estadisticas/grafico-radar/grafico-radar.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { ModalComponent } from './components/modal/modal.component';
import { ModalMedicionComponent } from './components/modal-medicion/modal-medicion.component';
import { FooterComponent } from './components/footer/footer.component';


import { UsuariosService } from './providers/usuarios.service';
import { MedicionesService } from './providers/mediciones.service';
import { AutenticacionService } from './providers/autenticacion.service';
import { RolGuardService } from './providers/rol-guard.service';
import { MensajeriaService } from './providers/mensajeria.service';
import { AuthGuardInterceptor } from './providers/auth-guard.interceptor';
import { EstadisticasService } from './providers/estadisticas.service';
import { DoctoresService } from './providers/doctores.service';
import { SensorService } from './providers/sensor.service';

import { FotoPipe } from './pipes/foto.pipe';
import { TildesPipe } from './pipes/tildes.pipe';

import { DropFilesDirective } from './directives/drop-files.directive';
import { DiagnosticoDirective } from './directives/diagnostico.directive';
import { DiagMedicionDirective } from './directives/diag-medicion.directive';
import { NoauthGuardService } from './providers/noauth-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    RegistroComponent,
    IngresoComponent,
    CuentaComponent,
    RegistroUsuarioComponent,
    MensajesComponent,
    FotoPipe,
    HistorialMedicionesComponent,
    EditarMedicionesComponent,
    ImportacionMedicionesComponent,
    IngresoMedicionComponent,
    DropFilesDirective,
    ModalCargandoComponent,
    FechasMedicionesComponent,
    FormaMedicionesComponent,
    DiagnosticoDirective,
    ResumenComponent,
    GraficasComponent,
    TablaEstadisticasComponent,
    GraficoLineasComponent,
    GraficoCircularComponent,
    GraficoRadarComponent,
    PacientesComponent,
    TildesPipe,
    ModalComponent,
    ModalMedicionComponent,
    DiagMedicionDirective,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    ChartsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    appRouting,
    NgDatepickerModule,
    NgbModule.forRoot(),
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthGuardInterceptor,
      multi: true
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: '6Ld_4EIUAAAAAGU8WexYyxvyPmw8skA5rJLfZAZR' } as RecaptchaSettings,
    },
    {
      provide: RECAPTCHA_LANGUAGE,
      useValue: 'es', // usar español en recaptcha
    },
    NoauthGuardService,
    AutenticacionService,
    RolGuardService,
    MensajeriaService,
    UsuariosService,
    MedicionesService,
    EstadisticasService,
    DoctoresService,
    SensorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
