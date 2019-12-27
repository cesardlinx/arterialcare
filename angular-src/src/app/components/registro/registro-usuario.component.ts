import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../providers/usuarios.service';
import { Observable } from 'rxjs/Observable';
import { Usuario } from '../../interfaces/usuario.interface';
import 'rxjs/add/operator/map';
import { MensajeriaService } from '../../providers/mensajeria.service';


@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.component.html',
  styles: []
})
export class RegistroUsuarioComponent implements OnInit {

  private tipoCuenta: string;
  private formulario: FormGroup;

  private busqueda: string;
  private listaDoctores: Usuario[];

  private badgeNombre: string;
  private badge = false;

  private carga = false;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private _usuarios: UsuariosService,
              private _mensajes: MensajeriaService) {


    this.activatedRoute.params.subscribe(params => {
      if (params.cuenta === 'paciente') {
        this.tipoCuenta = 'paciente';
      } else if (params.cuenta === 'doctor') {
        this.tipoCuenta = 'doctor';
      } else {
        this.router.navigate(['/home']);
      }
    });


    this.formulario = new FormGroup({
      'nombre': new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
        Validators.pattern('[a-zA-ZñÑáÁéÉíÍóÓúÚ]+')
      ]),
      'apellido': new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
        Validators.pattern('[a-zA-ZñÑáÁéÉíÍóÓúÚ]+')
      ]),
      'edad': new FormControl('', [
        Validators.required,
        Validators.min(18),
        Validators.max(100),
        Validators.pattern('[0-9]+')
      ]),
      'sexo': new FormControl('', Validators.required),
      'peso': new FormControl('', [
        Validators.max(300),
        Validators.pattern('([0-9]+|[0-9]+\.[0-9]+)')
      ]),
      'altura': new FormControl('', [
        Validators.max(300),
        Validators.pattern('([0-9]+|[0-9]+\.[0-9]+)')
      ]),
      'doctor': new FormControl('', [], this.validarDoctor.bind(this)),
      'correo': new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.email
      ], this.verificarUsuario.bind(this)),
      'contrasena': new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*?[A-ZÑ])(?=.*?[a-zñ])(?=.*?[0-9])/)
      ]),
      'repetirContrasena': new FormControl('', [Validators.required, this.validarContrasena.bind(this)]),
      'recaptcha': new FormControl(null, Validators.required)
    });

  }

  ngOnInit() {
    this.carga = true;
  }

  /**
   * Eventos
   */

  private listarDoctores(doctor: string) {
    this._usuarios.buscarDoctores(doctor).subscribe(data => {
      this.listaDoctores = data;
    });
  }

  private autocompletar(doctor: Usuario) {
    let texto = doctor.nombreCompleto;

    this.formulario.get('doctor').setValue(doctor._id);
    this.badgeNombre = texto;

    this.listaDoctores = [];
    this.badge = true;
  }


  private cerrarBadge() {
    this.badge = false;
    this.formulario.get('doctor').setValue('');
  }

  /**
   * Función para registro
   */

  private registrar() {

    if (this.tipoCuenta === 'paciente' && this.formulario.valid) {
      let peso, altura, doctor;
      // tslint:disable-next-line:curly
      if (this.formulario.get('peso').value) peso = this.formulario.get('peso').value;
      // tslint:disable-next-line:curly
      if (this.formulario.get('altura').value) altura = this.formulario.get('altura').value;
      // tslint:disable-next-line:curly
      if (this.formulario.get('doctor').value) doctor = this.formulario.get('doctor').value;

      const paciente = <Usuario>{
        nombre: this.formulario.get('nombre').value,
        apellido: this.formulario.get('apellido').value,
        edad: this.formulario.get('edad').value,
        sexo: this.formulario.get('sexo').value,
        peso,
        altura,
        doctor,
        correo: this.formulario.get('correo').value,
        contrasena: this.formulario.get('contrasena').value,
        recaptcha: this.formulario.get('recaptcha').value
      };

      this._usuarios.registrarUsuario(paciente, 'pacientes').subscribe(data => {
        this._mensajes.crearMensaje({ mensaje: 'Usuario registrado exitosamente.', tipo: 'success'});
        this.router.navigate(['/ingreso', 'paciente']);
      }, error => {
        if (error) {
          this._mensajes.crearMensaje({ mensaje: 'Hubo un fallo en el registro.', tipo: 'danger' });
        }
      });

    } else if (this.tipoCuenta === 'doctor' && this.formulario.valid) {
      const doctor = <Usuario>{
        nombre: this.formulario.get('nombre').value,
        apellido: this.formulario.get('apellido').value,
        edad: this.formulario.get('edad').value,
        sexo: this.formulario.get('sexo').value,
        correo: this.formulario.get('correo').value,
        contrasena: this.formulario.get('contrasena').value,
        recaptcha: this.formulario.get('recaptcha').value
      };

      this._usuarios.registrarUsuario(doctor, 'doctores').subscribe(data => {
        this._mensajes.crearMensaje({ mensaje: 'Doctor registrado exitosamente.', tipo: 'success' });
        this.router.navigate(['/ingreso', 'doctor']);
      }, error => {
        if (error) {
          this._mensajes.crearMensaje({ mensaje: 'Hubo un fallo en el registro.', tipo: 'danger' });
        }
      });

    }
  }

  /**
   * Validaciones
   */
  private validarDoctor(control: FormControl): Promise<any> | Observable<any> {
    if (control.value) {
      const id = control.value;
      return this._usuarios.existeUsuario(id, 'doctor', 'id').map(resp => {
        if (resp.success && resp.existe) {
          return null;
        } else {
          return { doctorNoExiste: true };
        }
      });
    } else {
      return new Promise((resolve, reject) => resolve(null));
    }
  }



  /*Verifica la existencia del usuario o doctor por correo*/
  private verificarUsuario(control: FormControl): Promise<any> | Observable<any> {
    if (this.tipoCuenta === 'paciente') {
      return this._usuarios.existeUsuario(control.value, 'paciente', 'correo').map(resp => {
        if (resp.success && resp.existe) {
          return { usuarioExiste: true };
        } else {
          return null;
        }
      });
    } else if (this.tipoCuenta === 'doctor') {
      return this._usuarios.existeUsuario(control.value, 'doctor', 'correo').map(resp => {
        if (resp.success && resp.existe) {
          return { usuarioExiste: true };
        } else {
          return null;
        }
      });
    }
  }

  private validarContrasena(control: FormControl): { [s: string]: boolean } | null {
    if (this.carga) {
      if (control.value === this.formulario.get('contrasena').value) {
        return null;
      } else {
        return { noIguales: true };
      }
    }

  }


}
