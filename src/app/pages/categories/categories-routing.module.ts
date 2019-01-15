import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//No app routing já está o path, então aqui fica em branco, pois se 
//colocar categories aqui, na url irá ficar categories/categories, 
//irá duplicar.
const routes: Routes = [
  { path: '', component: CategoryListComponent },//master
  { path: 'new', component: CategoryFormComponent},//detail
  { path: ':id/edit', component: CategoryFormComponent}//detail
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
