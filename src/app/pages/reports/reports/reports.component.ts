import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Category } from "../../categories/shared/category.model";
import { CategoryService } from "../../categories/shared/category.service";

import { Entry } from "../../entries/shared/entry.model";
import { EntryService } from "../../entries/shared/entry.service";

import currencyFormatter from "currency-formatter"

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  expenseTotal: any = 0;
  revenueTotal: any = 0;

  balance: any = 0;

  expenseChartData: any;
  revenueChartData: any;

  chartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  categories: Category[] = [];
  entries: Entry[] = [];

  @ViewChild('month') month: ElementRef = null;
  @ViewChild('year') year: ElementRef = null;

  constructor(private entryService: EntryService, private categoryService: CategoryService) { }

  ngOnInit() {
    this.categoryService.getAll()
      .subscribe(categories => this.categories = categories);
  }

  generateReports(){
    const month = this.month.nativeElement.value;
    const year = this.year.nativeElement.value;

    if (!month || !year) {
      alert('Você precisa selecionar o Mês e o Ano para gerar os relatórios')
    } else {
      this.entryService.getByMonthAndYear(month, year).subscribe(this.setValues.bind(this))
    }
  }

  //aqui está fazendo o cálculo manualmente
  //mas já poderia vir pronto do back.
  private setValues(entries: Entry[]){
    this.entries = entries;
    this.calculateBalance();
    this.setChartData();
  }

  private calculateBalance(){
    let expenseTotal = 0;
    let revenueTotal = 0;

    this.entries.forEach(entry => {
      if (entry.type == 'revenue') {
        //unformat, irá fazer a desformatação, pois o valor está em
        //real, com ponto e vírgula e não em decimal, assim precisa
        //desformatar para conseguir fazer o cálculo.
        //BRL diz em qual formato está atualmente, que é Brasil.
        //então irá converter por exemplo 35,60 para 35.60
        revenueTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' })
      } else {
        expenseTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' })
      }
    });

    //Formatar novamente para REAL.
    this.expenseTotal = currencyFormatter.format(expenseTotal, { code: 'BRL' })
    this.revenueTotal = currencyFormatter.format(revenueTotal, { code: 'BRL' })

    //Saldo
    this.balance = currencyFormatter.format(revenueTotal - expenseTotal, { code: 'BRL' });

  }

  private setChartData(){
    this.revenueChartData = this.getChartData('revenue', 'Gráfico de Receitas', '#9CCC65');
    this.expenseChartData = this.getChartData('expense', 'Gráfico de Despesas', '#e03131');
  }

  private getChartData(entryType: string, title: string, color: string){
    const chartData = [];

    this.categories.forEach(categories => {
      //filtering entries by category and type
      const filteredEntries = this.entries.filter(
        entry => (entry.categoryId == categories.id) && (entry.type == entryType)
      );

      //if found entries, then sum entries amount and add to chartData
      if (filteredEntries.length > 0) {
        //reduce já para fazer um loop e uma operação
        //aritmética encima.
        const totalAmount = filteredEntries.reduce(
          //0 é o valor inicial para total.
          (total, entry) => total + currencyFormatter.unformat(entry.amount, { code: 'BRL' }), 0
        )

        chartData.push({
          categoryName: categories.name,
          totalAmount: totalAmount
        })
      }
    });

    return {
      labels: chartData.map(item => item.categoryName),
      datasets: [{
        label: title,
        backgroundColor: color,
        data: chartData.map(item => item.totalAmount)
      }]
    }
  }
}
