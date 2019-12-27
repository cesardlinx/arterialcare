import { Component, OnInit } from '@angular/core';
import { DoctoresService } from '../../providers/doctores.service';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {

  private pacientes: Usuario[];

  constructor(private _doctores: DoctoresService) { }

  ngOnInit() {
    this._doctores.obtenerPacientes().subscribe(data => {
      this.pacientes = data.pacientes;
    });
  }

}
