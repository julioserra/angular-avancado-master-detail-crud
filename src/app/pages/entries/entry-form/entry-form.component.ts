import { EntryService } from './../shared/entry.service';
import { Entry } from './../shared/entry.model';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.builEntryForm();
    this.loadEntry();
  }

  //O método é invocado depois que estiver tudo carregado,
  //assim garente que o título da página após o carregamento.
  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;
    if (this.currentAction == "new"){
      this.createEntry();
    }else {
      this.updateEntry();
    }
  }

  //PRIVATES METHODS

  private setCurrentAction(){
    //para saber se a pessoa está editando ou não
    //aqui retorna um array contendo todos os seguimentos da url
    //a partir de /entries 
    //se tiver criando será /entries/new, se tiver editando será por exemplo
    //entries/123/edit
    //[0] primeiro seguinte do path
    if(this.route.snapshot.url[0].path == "new"){
      this.currentAction = "new"
    } else {
      this.currentAction = "edit"
    }
  }

  private builEntryForm(){
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private loadEntry(){
    if (this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id")))//o mais antes de params é para fazer um cast para number.
      )
      .subscribe(
        (entry) => {
          this.entry = entry;
          //fazer um bind
          this.entryForm.patchValue(entry)//binds loaded entry data to EntryForm.
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }

  private setPageTitle(){
    if (this.currentAction == "new"){
      this.pageTitle = 'Cadastro de Novo Lançamento'
    }else{
      //se ainda não estiver carregado entry.name irá retornar nulo,
      //então fica null ou vazio.
      //então garanto que quando for nulo o entry name seja preenchido com uma
      //string vazia, assim não irá aparecer para o usuário:
      //Editando Categoria: null.
      const entryName = this.entry.name || ""
      this.pageTitle = 'Editando Lançamento: ' + entryName
    }
  }

  private createEntry(){
    //criando uma categoria nova e atribuindo para ela os valores do cartegoryForm pelo objeto assign.
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      )
  }

  private updateEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    
    this.entryService.update(entry)
    .subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success('Solicitação processada com sucesso"');

    //Forçar um recarregamento do componente
    //skipLocationChange true é para não adicionar este redirecionando ao histórico do navegador.
    //Saio do nomedosite.com/entries/new
    //vou para nomedosite.com/entries/
    //quando terminar o redirecionamento, com o then faço o reredirecionamento para
    //nomedosite.com/entries/:id/edit
    // redirect/reload component page
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => this.router.navigate(['entries', entry.id, 'edit'])
    )
  }

  private actionsForError(error){
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

}
