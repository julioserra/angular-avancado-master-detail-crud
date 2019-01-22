import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { BreadCrumbComponent } from './components/bread-crumb/bread-crumb.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    BreadCrumbComponent
  ],
  exports:[
    //Módulos compartilhados
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    //shared components - feito manualmente, pois o cli adiciona
    //apenas no "declarations"
    BreadCrumbComponent
  ]
})
export class SharedModule { }
