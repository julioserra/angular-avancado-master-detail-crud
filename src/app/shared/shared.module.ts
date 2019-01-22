import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { BreadCrumbComponent } from './components/bread-crumb/bread-crumb.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    BreadCrumbComponent,
    PageHeaderComponent
  ],
  exports:[
    //Módulos compartilhados
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    //shared components - feito manualmente, pois o cli adiciona
    //apenas no "declarations"
    BreadCrumbComponent,
    PageHeaderComponent
  ]
})
export class SharedModule { }
