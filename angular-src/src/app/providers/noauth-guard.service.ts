import { Injectable } from '@angular/core';
import { AutenticacionService } from './autenticacion.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


@Injectable()
export class NoauthGuardService implements CanActivate{

  constructor(private router: Router, private _auth: AutenticacionService) { }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (!this._auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}
