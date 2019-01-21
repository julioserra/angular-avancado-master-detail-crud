import { Component, Injector } from '@angular/core';
import { Validators } from "@angular/forms";



import { Category } from './../shared/category.model';
import { CategoryService } from './../shared/category.service';
import { BaseResourceFormComponent } from '../../../shared/components/base-resource-form/base-resource-form.component';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})

export class CategoryFormComponent extends BaseResourceFormComponent<Category> {

  constructor(
    protected categoryService: CategoryService,
    protected injector: Injector
  ) {
    super(injector, new Category(), categoryService, Category.fromJson)
   }


  /*//O método é invocado depois que estiver tudo carregado,
  //assim garente que o título da página após o carregamento.
  ngAfterContentChecked(){
    this.setPageTitle();
  }*/

  /*submitForm(){
    this.submittingForm = true;
    if (this.currentAction == "new"){
      this.createCategory();
    }else {
      this.updateCategory();
    }
  }*/

  //PRIVATES METHODS

  /*private setCurrentAction(){
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
  }*/


  //Implementação específica para o formulário de categorias.
  protected builResourceForm(){
    this.resourceForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  //Sobrescrevendo método pai
  protected creationPageTitle(): string {
    return "Cadastro de Nova Categoria";
  }

  //Sobrescrevendo método pai
  protected editionPageTitle(): string {
    const categoryName = this.resource.name || "";
    return "Editando Categoria: " + categoryName;
  }

  /*private loadCategory(){
    if (this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id")))//o mais antes de params é para fazer um cast para number.
      )
      .subscribe(
        (category) => {
          this.category = category;
          //fazer um bind
          this.categoryForm.patchValue(category)//binds loaded category data to CategoryForm.
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }*/

  /*private setPageTitle(){
    if (this.currentAction == "new"){
      this.pageTitle = 'Cadastro de Nova Categoria'
    }else{
      //se ainda não estiver carregado category.name irá retornar nulo,
      //então fica null ou vazio.
      //então garanto que quando for nulo o category name seja preenchido com uma
      //string vazia, assim não irá aparecer para o usuário:
      //Editando Categoria: null.
      const categoryName = this.category.name || ""
      this.pageTitle = 'Editando Categoria: ' + categoryName
    }
  }*/

  /*private createCategory(){
    //criando uma categoria nova e atribuindo para ela os valores do cartegoryForm pelo objeto assign.
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )
  }*/

  /*private updateCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    
    this.categoryService.update(category)
    .subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    )
  }*/

  /*private actionsForSuccess(category: Category){
    toastr.success('Solicitação processada com sucesso"');

    //Mostrar um snapshot, uma fotografia da árvore de rodas.
    //console.log(this.route.snapshot.parent);
    //então para pegar o path Pai:
    //console.log(this.route.snapshot.parent.url[0].path);

    //Forçar um recarregamento do componente
    //skipLocationChange true é para não adicionar este redirecionando ao histórico do navegador.
    //Saio do nomedosite.com/categories/new
    //vou para nomedosite.com/categories/
    //quando terminar o redirecionamento, com o then faço o reredirecionamento para
    //nomedosite.com/categories/:id/edit
    // redirect/reload component page
    this.router.navigateByUrl('categories', {skipLocationChange: true}).then(
      () => this.router.navigate(['categories', category.id, 'edit'])
    )
  }*/

  /*private actionsForError(error){
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

  }*/

}
