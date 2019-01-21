import { Injector } from "@angular/core";
import { BaseResourceModel } from '../models/base-resource.model';

import { HttpClient } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

//Classe Abstrata com Generics

export abstract class BaseResourceService<T extends BaseResourceModel> {

    protected http: HttpClient;

    //passo como parâmento uma função jsonData para emilinar esta reptição
    //de código nos serviços.
    constructor(protected apiPath: string, 
      protected injector: Injector, 
      protected jsonDataToResourceFn: (jsonData: any) => T){
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
          //Fazendo o bind this, está passando para o jsonDataToResources
          //que o this, está sendo a classe que está sendo passada por parâmetro
          //por exemplo "Entry" e não mais uma instância do MapSubscribe, o que estava
          //gerando problema, pois no anterior o método reconhecia o this como uma
          //instância do Map e não do Entry.
          //map(this.jsonDataToResources),
          map(this.jsonDataToResources.bind(this)),
          catchError(this.handleError)
        )
      }
    
      getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`;
    
        return this.http.get(url).pipe(
          map(this.jsonDataToResource.bind(this)),
          catchError(this.handleError)                
        )
    
      }
    
      create(resource: T): Observable<T>{
        return this.http.post(this.apiPath, resource).pipe(
          map(this.jsonDataToResource.bind(this)),
          catchError(this.handleError)                
        )
      }
    
      update(resource: T): Observable<T>{
        const url = `${this.apiPath}/${resource.id}`;
    
        return this.http.put(url, resource).pipe(
          map(() => resource), //para retornar a própria categoria, já que aqui o put não iria retornar nada.
          catchError(this.handleError)          
        )
      }
    
      delete(id: number): Observable<any>{
        const url = `${this.apiPath}/${id}`;
    
        return this.http.delete(url).pipe(
          map(() => null), //retornar nulo, não precisa retornar nada.
          catchError(this.handleError)          
        )
      }

    //PROTECTED METHODS, pois é visível na classe atual e nas filhas.

    protected jsonDataToResources(jsonData: any[]): T[] {
        const resources: T[] = [];
        jsonData.forEach(
          element => resources.push( this.jsonDataToResourceFn(element) )
        );
        return resources;
    }

    protected jsonDataToResource(jsonData: any): T {
        return this.jsonDataToResourceFn(jsonData);
    }

    protected handleError(error: any): Observable<any> { 
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
    }      

}