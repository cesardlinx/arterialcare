import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../providers/usuarios.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Usuario } from '../../interfaces/usuario.interface';
import { AutenticacionService } from '../../providers/autenticacion.service';
import { MensajeriaService } from '../../providers/mensajeria.service';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styles: []
})
export class IngresoComponent implements AfterViewInit {

  private formulario: FormGroup;
  private error = false;
  private cuenta: string;
  private _intentosFallidos = 0;

  public set intentosFallidos(intentos: number) {
    this._intentosFallidos = intentos;
    if (this.intentosFallidos > 5) {
      let recaptcha = new FormControl(null, Validators.required);
      this.formulario.addControl('recaptcha', recaptcha);
    }
  }

  public get intentosFallidos(): number {
    return this._intentosFallidos;
  }


  @ViewChild('primeraEntrada')
  private primeraEntrada: ElementRef;

  constructor(private _auth: AutenticacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _mensajes: MensajeriaService
  ) {

    this.activatedRoute.params.subscribe(params => {
      if (params.cuenta === 'paciente') {
        this.cuenta = 'paciente';
      } else if (params.cuenta === 'doctor') {
        this.cuenta = 'doctor';
      } else {
        this.router.navigate(['/home']);
      }
      /*En caso de verificar el correo*/
      if (params.token) {
        let coleccion: string;
        switch (this.cuenta) {
          case 'paciente':
           coleccion = 'pacientes';
            break;
          case 'doctor':
            coleccion = 'doctores';
            break;
        }
        this._auth.confirmarCorreo(coleccion, params.token).subscribe(data => {
          this._mensajes.crearMensaje({
            mensaje: 'Correo verificado exitosamente',
            tipo: 'success'
          });
        }, err => {
          this._mensajes.crearMensaje({
            mensaje: 'Error en verificar correo',
            tipo: 'danger'
          });
        });
      }
    });


    this.formulario = new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      contrasena: new FormControl('', Validators.required),
    });
  }

  ngAfterViewInit() {
    this.primeraEntrada.nativeElement.focus();
  }

  private ingreso() {
    if (this.cuenta === 'doctor') {
      const doctor = <Usuario>{
        usuario: this.formulario.get('usuario').value,
        contrasena: this.formulario.get('contrasena').value
      };
      if (this.intentosFallidos > 5) {
        doctor.recaptcha = this.formulario.get('recaptcha').value;
      }
      this._auth.autenticarUsuario(doctor, 'doctores').subscribe(data => {
        localStorage.setItem('token', JSON.stringify(data.token));
        this.router.navigate(['/home']);
        console.clear();
      }, err => {
        if (err.status === 404) {
          this.intentosFallidos++;
          this.formulario.get('contrasena').setValue('');
          this._mensajes.crearMensaje({
            mensaje: 'El usuario o la contraseña son incorrectos para el tipo de cuenta "Doctor".',
            tipo: 'danger'
          });
        }
      });
    } else if (this.cuenta === 'paciente') {
      const paciente = <Usuario>{
        usuario: this.formulario.get('usuario').value,
        contrasena: this.formulario.get('contrasena').value
      };
      if (this.intentosFallidos > 5) {
        paciente.recaptcha = this.formulario.get('recaptcha').value;
      }
      this._auth.autenticarUsuario(paciente, 'pacientes').subscribe(data => {
        localStorage.setItem('token', JSON.stringify(data.token));
        this.router.navigate(['/home']);
        console.clear();
      }, err => {
        if (err.status === 404) {
          this.intentosFallidos++;
          this.formulario.get('contrasena').setValue('');
          this._mensajes.crearMensaje({
            mensaje: 'El usuario o la contraseña son incorrectos para el tipo de cuenta "Paciente".',
            tipo: 'danger'
          });
        }
      });
    }
  }

}
