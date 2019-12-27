import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AutenticacionService } from './autenticacion.service';

@Injectable()
export class RolGuardService  implements CanActivate {

  constructor(private router: Router, private _auth: AutenticacionService) { }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (this._auth.isLoggedIn()) {
      let rol = this._auth.obtenerRol();
      let roles = route.data['roles'] as Array<string>;
      let accion = (roles == null || roles.indexOf(rol) !== -1);
      if (accion) {
        return true;
      } else {
        this.router.navigate(['/home']);
        return false;
      }
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }

}
