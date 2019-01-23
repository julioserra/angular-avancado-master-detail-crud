import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from './../../categories/shared/category.service';
import { Entry } from './entry.model';

import { Observable, throwError } from "rxjs";
import { flatMap, catchError, map } from "rxjs/operators";

import * as moment from "moment"

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  //NÃO precisa do CategoryService se estiver usando api rest java
  //esta configuração é somente para o In Memory Web API.
  constructor(protected injector: Injector, private categoryService: CategoryService ) {
    super('api/entries', injector, Entry.fromJson);//o terceiro parâmetro está passando apenas uma funão e não executando ela.
  }

  /*
  //Métodos originais, para uso com api rest java,
  //os outros modificados são pelo motivo de estar
  //trabalhando InMemory e a categoria não vem preenchida
  //no mesmo json do Entry.
  create(entry: Entry): Observable<Entry>{
    return this.http.post(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)        
    )
  }

  update(entry: Entry): Observable<Entry>{
    const url = `${this.apiPath}/${entry.id}`;

    return this.http.put(url, entry).pipe(
      catchError(this.handleError),
      map(() => entry) //para retornar a própria entrada, já que aqui o put não iria retornar nada.
    )
  }
  */

  //Método refatorado com o auxílio de:
  //setCategoryAndSendToServer
  /*create(entry: Entry): Observable<Entry>{
    //o flatMap irá juntar os dois observables e um único.
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;

        //Este código é igual ao que está no BaseResourceService,
        //então podemos utilizar o que está no pai com SUPER.
        //return this.http.post(this.apiPath, entry).pipe(
          //catchError(this.handleError),
          //map(this.jsonDataToResource)        
        //)

        //Passo meu Entry pronto e configurado.
        return super.create(entry);
      })
    );
  }*/

  create(entry: Entry): Observable<Entry>{
    return this.setCategoryAndSendToServer(entry, super.create.bind(this));
  }

  update(entry: Entry): Observable<Entry>{
    return this.setCategoryAndSendToServer(entry, super.update.bind(this));
  }

  //Método para o Gráfico
  //Quando for usando o back spring, usar um método que já devolva os
  //dados filtrados passando os parâmetros para facilitar. assim evitaria o pipe e não usaria
  //o getAll.
  getByMonthAndYear(month: number, year: number) : Observable<Entry[]> {
    return this.getAll().pipe(
      map(entries => this.filterByMonthAndYear(entries, month, year))
    )
  }

  //Método refatorado com o auxílio de:
  //setCategoryAndSendToServer
  /*update(entry: Entry): Observable<Entry>{
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;        
        return super.update(entry);
      })
    )
  }*/

  private setCategoryAndSendToServer(entry: Entry, sendFn: any): Observable<Entry>{
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return sendFn(entry)
      }),
      catchError(this.handleError)
    );
  }

  private filterByMonthAndYear(entries: Entry[], month: number, year: number){
    return entries.filter(entry => {
      const entryDate = moment(entry.date, "DD/MM/YYYY");
      const monthMatches = entryDate.month() + 1 == month;
      const yearMatches = entryDate.year() == year;

      if (monthMatches && yearMatches){
        return entry;
      }

    })
  }

  //Não há mais a necessidade desses dois métodos, pois foi melhorado
  //no base, recebendo assim pela função o objeto correto, não precisando
  //fazer lá o cast.
  /*protected jsonDataToResources(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];

    jsonData.forEach(element => {
      const entry = Entry.fromJson(element);
      entries.push(entry);
    });
    return entries;
  }

  protected jsonDataToResource(jsonData: any): Entry {
    return Entry.fromJson(jsonData);
  }*/

}
