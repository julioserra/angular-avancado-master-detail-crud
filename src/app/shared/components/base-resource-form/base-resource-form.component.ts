import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseResourceModel } from "../../models/base-resource.model";
import { BaseResourceService } from "../../services/base-resource.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    protected resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) { 
      this.route = this.injector.get(ActivatedRoute);
      this.router = this.injector.get(Router);
      this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrentAction();
    this.builResourceForm();
    this.loadResource();
  }

  //O método é invocado depois que estiver tudo carregado,
  //assim garente que o título da página após o carregamento.
  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;
    if (this.currentAction == "new"){
      this.createResource();
    }else {
      this.updateResource();
    }
  }

  //PRIVATES METHODS

  protected setCurrentAction(){
    //para saber se a pessoa está editando ou não
    //aqui retorna um array contendo todos os seguimentos da url
    //a partir de /categories 
    //se tiver criando será /categories/new, se tiver editando será por exemplo
    //categories/123/edit
    //[0] primeiro seguinte do path
    if(this.route.snapshot.url[0].path == "new"){
      this.currentAction = "new"
    } else {
      this.currentAction = "edit"
    }
  }

  protected loadResource(){
    if (this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id")))
      )
      .subscribe(
        (resource) => {
          this.resource = resource;
          //fazer um bind
          this.resourceForm.patchValue(resource)
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }

  protected setPageTitle(){
    if (this.currentAction == "new"){
      this.pageTitle = this.creationPageTitle();
    }else{
       this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return "Novo";
  }

  protected editionPageTitle(): string {
      return "Edição"
  }

  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )
  }

  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    
    this.resourceService.update(resource)
    .subscribe(
        resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }

  protected actionsForSuccess(resource: T){
    toastr.success('Solicitação processada com sucesso"');

    //Neste caso, vai pegar o endereço Pai da URL do Endeço, ou seja, vai
    //pegar por exemplo: Category, Entry, etc.
    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

    //Forçar um recarregamento do componente
    //skipLocationChange true é para não adicionar este redirecionando ao histórico do navegador.
    //Saio do nomedosite.com/categories/new
    //vou para nomedosite.com/categories/
    //quando terminar o redirecionamento, com o then faço o reredirecionamento para
    //nomedosite.com/categories/:id/edit
    // redirect/reload component page
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(
      () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    )
  }

  protected actionsForError(error){
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');

    this.submittingForm = false;

    //configuração para quando for integrar com um servidor remoto
   
    //erro quando não foi processado a entidade, erro do lado da API,
    //quando o recurso não foi processado com sucesso.
    if (error.status === 422) {
      //No caso do servidor Rails retorna o _body, precisando talves
      //se alterado conforme o retorno de outro servidor, no body irá
      //conter um array sobre o erro.
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente mais tarde'];
    }

  }

  //vai precisar implementar onde herdar.
  protected abstract builResourceForm(): void;

}
