import {
  HttpClient,
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse } from '@angular/common/http';
  import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { MensajeriaService } from './mensajeria.service';


@Injectable()
export class AuthGuardInterceptor implements HttpInterceptor {

  constructor(private router: Router, private mensajes: MensajeriaService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      const authReq = req.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
      });
      return next.handle(authReq).catch(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            localStorage.clear();
            this.router.navigate(['/ingreso']);
            this.mensajes.crearMensaje({mensaje: 'Usuario no autenticado.', tipo: 'danger'});
            return Observable.throw('Error de autenticación');
          }
        }
      });
    } else {
      return next.handle(req);
    }
  }

}
