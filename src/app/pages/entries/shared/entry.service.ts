import { CategoryService } from './../../categories/shared/category.service';
import { Entry } from './entry.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath: string = "api/entries";

  //NÃO precisa do CategoryService se estiver usando api rest java
  //esta configuração é somente para o In Memory Web API.
  constructor(private http: HttpClient, private categoryService: CategoryService ) { }

  getAll(): Observable<Entry[]>{
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    )
  }

  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)      
    )

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

        return this.http.post(this.apiPath, entry).pipe(
          catchError(this.handleError),
          map(this.jsonDataToEntry)        
        )

      })
    )
  }

  update(entry: Entry): Observable<Entry>{
    const url = `${this.apiPath}/${entry.id}`;

    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;

        return this.http.put(url, entry).pipe(
          catchError(this.handleError),
          map(() => entry) //para retornar a própria entrada, já que aqui o put não iria retornar nada.
          )
      })
    )
  }

  delete(id: number): Observable<any>{
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)//retornar nulo, não precisa retornar nada.
    )
  }

  //PRIVATE METHODS

  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];

    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    });
    return entries;
  }

  private jsonDataToEntry(jsonData: any): Entry {
    return Object.assign(new Entry(), jsonData);
  }

  private handleError(error: any): Observable<any> { 
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
