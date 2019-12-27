import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../providers/usuarios.service';
import { Observable } from 'rxjs/Observable';
import { Usuario } from '../../interfaces/usuario.interface';
import { MensajeriaService } from '../../providers/mensajeria.service';
import { AutenticacionService } from '../../providers/autenticacion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styles: []
})
export class CuentaComponent implements OnInit {

  private tipoCuenta: string;
  private coleccion: string;
  private usuario: Usuario;
  private sexo: string;
  private nombre: string;
  private apellido: string;
  private pantalla = false;
  private botonPantalla: string;
  private correo: string;

  private formaActualizar: FormGroup;
  private formaContrasena: FormGroup;
  private listaDoctores: Usuario[];
  private badgeNombre: string; // nombre asignado al badge
  private badge = false; // indica que el badge está activo
  private carga = false; // indica que ha cargado el componente

  constructor(private _usuarios: UsuariosService,
              private _auth: AutenticacionService,
              private _mensajes: MensajeriaService,
              private router: Router,
              private modalService: NgbModal
            ) {

    let rol = this._auth.obtenerRol();
    this.tipoCuenta = rol;
    if (rol === 'paciente') {
      this.coleccion = 'pacientes';
    } else if (rol === 'doctor') {
      this.coleccion = 'doctores';
    }

    this.formaContrasena = new FormGroup({
      'contrasena': new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*')
      ]),
      'repetirContrasena': new FormControl('', [Validators.required, this.validarContrasena.bind(this)]),
    });

    this.formaActualizar = new FormGroup({
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
    });

    this.obtenerUsuario();
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
    this.formaActualizar.get('doctor').setValue(doctor._id);
    this.crearBadge(texto);
    this.listaDoctores = [];
  }

  private crearBadge(texto: string) {
    this.badgeNombre = texto;
    this.badge = true;
  }


  private cerrarBadge() {
    this.badge = false;
    this.formaActualizar.get('doctor').setValue('');
  }


  /**
   * Método para llenar formaActualizar
   */
  private obtenerUsuario() {
    let id = this._auth.obtenerId();
    let rol = this._auth.obtenerRol();
    if (id && rol) {
      let coleccion = (rol === 'paciente') ? 'pacientes' : 'doctores';
      this._usuarios.datosUsuario(id, coleccion).subscribe(resp => {
        if (rol === 'paciente') {
          this.correo = resp.paciente.correo;
          this.populateForm(resp.paciente);
        } else if (rol === 'doctor') {
          this.correo = resp.doctor.correo;
          this.populateForm(resp.doctor);
        }
      });
    }
  }

  private populateForm(paciente: Usuario) {
    const usuario = <Usuario>{
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      edad: paciente.edad,
      sexo: paciente.sexo,
      correo: paciente.correo
    };

    usuario.peso = (paciente.peso) ? paciente.peso : '';
    usuario.altura = (paciente.altura) ? paciente.altura : '';

    if (paciente.doctorId) {
      usuario.doctor = paciente.doctorId;
      let texto = paciente.doctorNombre;
      this.crearBadge(texto);
    } else {
      usuario.doctor = '';
    }
    this.formaActualizar.setValue(usuario);
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
        if (resp.success && resp.existe && control.value !== this.correo) {
          return { usuarioExiste: true };
        } else {
          return null;
        }
      });
    } else if (this.tipoCuenta === 'doctor') {
      return this._usuarios.existeUsuario(control.value, 'doctor', 'correo').map(resp => {
        if (resp.success && resp.existe && control.value !== this.correo) {
          return { usuarioExiste: true };
        } else {
          return null;
        }
      });
    }
  }

  private validarContrasena(control: FormControl): { [s: string]: boolean } | null {
    if (this.carga) {
      if (control.value === this.formaContrasena.get('contrasena').value) {
        return null;
      } else {
        return { noIguales: true };
      }
    }
  }

 /**
 * Método para actualizar datos
 */

  private actualizarCuenta() {
    if (this.formaActualizar.valid) {
      this._usuarios.actualizarUsuario(this.formaActualizar.value, this.coleccion).subscribe(data => {
        if (data.success) {
          this._mensajes.crearMensaje({
            mensaje: 'Los datos se han actualizado correctamente.',
            tipo: 'success'
          });
        }
      }, error => {
        this._mensajes.crearMensaje({
          mensaje: 'Los datos no se han actualizado debido a un error.',
          tipo: 'danger'
        });
      });
    }
  }

  /**
   * Método para actualizar contraseña
   */

  private actualizarContrasena() {
    if (this.formaActualizar.valid) {
      let actualizacion = {
        'contrasena': this.formaContrasena.get('contrasena').value
      };
      this._usuarios.actualizarUsuario(actualizacion, this.coleccion).subscribe(data => {
        if (data.success) {
          this._mensajes.crearMensaje({
            mensaje: 'La contraseña ha sido actualizada correctamente',
            tipo: 'success'
          });
        }
      }, error => {
        this._mensajes.crearMensaje({
          mensaje: 'La contraseña no se ha actualizado debido a un error.',
          tipo: 'danger'
        });
      });
    }
  }

  private borrarCuenta(content) {
    this.modalService.open(content).result.then((result) => {
      if (result === 'aceptar') {
        this._usuarios.borrarUsuario(this.coleccion).subscribe(data => {
          this._auth.logout();
          this.router.navigate(['/home']);
          this._mensajes.crearMensaje({
            mensaje: 'Cuenta eliminada exitosamente.',
            tipo: 'success'
          });
        }, err => {
          this._mensajes.crearMensaje({
            mensaje: 'La cuenta no ha sido eliminada.',
            tipo: 'danger'
          });
        });
      }
    });
  }
}
