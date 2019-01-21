import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from './../../categories/shared/category.service';
import { Entry } from './entry.model';

import { Observable, throwError } from "rxjs";
import { flatMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  //NÃO precisa do CategoryService se estiver usando api rest java
  //esta configuração é somente para o In Memory Web API.
  constructor(protected injector: Injector, private categoryService: CategoryService ) {
    super('api/entries', injector);
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

  create(entry: Entry): Observable<Entry>{

    //o flatMap irá juntar os dois observables e um único.
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;

        //Este código é igual ao que está no BaseResourceService,
        //então podemos utilizar o que está no pai com SUPER.
        /*return this.http.post(this.apiPath, entry).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResource)        
        )*/

        //Passo meu Entry pronto e configurado.
        return super.create(entry);

      })
    )
  }

  update(entry: Entry): Observable<Entry>{
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;        
        return super.update(entry);
      })
    )
  }

  protected jsonDataToResources(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];

    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    });
    return entries;
  }

  protected jsonDataToResource(jsonData: any): Entry {
    return Object.assign(new Entry(), jsonData);
  }

}
