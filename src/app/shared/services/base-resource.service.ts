import { Injector } from "@angular/core";
import { BaseResourceModel } from '../models/base-resource.model';

import { HttpClient } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

//Classe Abstrata com Generics

export abstract class BaseResourceService<T extends BaseResourceModel> {

    protected http: HttpClient;

    constructor(protected apiPath: string, protected injector: Injector){
      //O Injector vai falar para o angular:
      //Angular me dá uma instância de httpcliente para eu poder usar aqui
      //dentro da classe.

      //Assim as classes filhas não precisam passar como parâmetro o
      //http cliente, caso contrário iria ter muito repetição de código
      //nos serviços.
      this.http = injector.get(HttpClient);
    }

    getAll(): Observable<T[]>{
        return this.http.get(this.apiPath).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResources)
        )
      }
    
      getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`;
    
        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResource)      
        )
    
      }
    
      create(resource: T): Observable<T>{
        return this.http.post(this.apiPath, resource).pipe(
          catchError(this.handleError),
          map(this.jsonDataToResource)        
        )
      }
    
      update(resource: T): Observable<T>{
        const url = `${this.apiPath}/${resource.id}`;
    
        return this.http.put(url, resource).pipe(
          catchError(this.handleError),
          map(() => resource) //para retornar a própria categoria, já que aqui o put não iria retornar nada.
        )
      }
    
      delete(id: number): Observable<any>{
        const url = `${this.apiPath}/${id}`;
    
        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)//retornar nulo, não precisa retornar nada.
        )
      }

    //PROTECTED METHODS, pois é visível na classe atual e nas filhas.

    protected jsonDataToResources(jsonData: any[]): T[] {
        const resources: T[] = [];
        jsonData.forEach(element => resources.push(element as T));
        return resources;
    }

    protected jsonDataToResource(jsonData: any): T {
        return jsonData as T;
    }

    protected handleError(error: any): Observable<any> { 
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
    }      

}