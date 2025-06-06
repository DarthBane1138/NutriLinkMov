import { Component, OnInit } from '@angular/core';
import { ViewDidEnter } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ApiService } from 'src/app/services/api.service';
import { DblocalService } from 'src/app/services/dblocal.service';
import { lastValueFrom } from 'rxjs';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: false
})
export class EstadisticasPage implements OnInit, ViewDidEnter {

  id_paciente: number = 0;
  noDatosGlobal: boolean = false;
  noDatosIMC: boolean = false;
  noDatosPeso: boolean = false;
  noDatosTalla: boolean = false;
  noDatosGrasa: boolean = false;

  constructor(private api: ApiService, private db: DblocalService) {}

  async ngOnInit() {
    const sesion = await this.db.obtenerSesion();
    this.id_paciente = sesion.id_paciente;
  }

async ionViewDidEnter() {
  this.limpiarGraficos();

  try {
    const response: any = await lastValueFrom(this.api.obtenerAntropometria(this.id_paciente));

    // Mostrar toda la respuesta para diagnóstico
    console.log('PLF: respuesta de API:', response);

    // Si el status no es OK, marcar todos los gráficos como sin datos
    if (response.status !== 'ok') {
      this.noDatosGlobal = true;
      this.noDatosIMC = true;
      this.noDatosPeso = true;
      this.noDatosTalla = true;
      this.noDatosGrasa = true;
      return;
    }

    const fechas: string[] = [];
    const pesos: number[] = [];
    const tallas: number[] = [];
    const imcs: number[] = [];
    const grasas: number[] = [];

    for (const dato of response.datos) {
      if (!dato.fecha) continue;

      const partes = dato.fecha.slice(0, 10).split('-');
      const fechaFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;

      fechas.push(fechaFormateada);
      pesos.push(dato.peso_kg || 0);
      tallas.push(dato.talla_cm || 0);

      const fechaAPI = `${partes[0]}-${partes[1]}-${partes[2]}`;
      const calcResp: any = await lastValueFrom(
        this.api.obtenerCalculosAntropometricos(this.id_paciente, fechaAPI)
      );

      if (calcResp.status === 'success') {
        imcs.push(calcResp.data.imc || 0);
        grasas.push(calcResp.data.porc_grasa || 0);
      } else {
        imcs.push(0);
        grasas.push(0);
      }
    }

    fechas.reverse();
    pesos.reverse();
    tallas.reverse();
    imcs.reverse();
    grasas.reverse();

    // Mostrar los datos en consola
    console.log('PLF: IMC:', imcs);
    console.log('PLF: Peso:', pesos);
    console.log('PLF: Talla:', tallas);
    console.log('PLF: Grasa:', grasas);

    // Si hay fechas, se considera que hay datos globales
    this.noDatosGlobal = fechas.length === 0;

    if (this.noDatosGlobal) {
      this.noDatosIMC = true;
      this.noDatosPeso = true;
      this.noDatosTalla = true;
      this.noDatosGrasa = true;
      return;
    }

    // Renderizar gráficos
    this.generarLineChartGlobal(fechas, imcs, pesos, tallas, grasas);
    this.generarBarChartGlobal(fechas, imcs, pesos, tallas, grasas);
    this.generarGraficosIndividuales('IMC', fechas, imcs);
    this.generarGraficosIndividuales('Peso', fechas, pesos);
    this.generarGraficosIndividuales('Talla', fechas, tallas);
    this.generarGraficosIndividuales('Grasa', fechas, grasas);

  } catch (error) {
    console.error('Error al cargar datos para estadísticas:', error);
    this.noDatosGlobal = true;
    this.noDatosIMC = true;
    this.noDatosPeso = true;
    this.noDatosTalla = true;
    this.noDatosGrasa = true;
  }
}

  limpiarGraficos() {
    const ids = [
      'lineChart', 'barChart',
      'lineChartIMC', 'barChartIMC',
      'lineChartPeso', 'barChartPeso',
      'lineChartTalla', 'barChartTalla',
      'lineChartGrasa', 'barChartGrasa'
    ];
    ids.forEach(id => {
      const chart = Chart.getChart(id);
      if (chart) chart.destroy();
    });
  }

  generarLineChartGlobal(fechas: string[], imc: number[], peso: number[], talla: number[], grasa: number[]) {
    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [
          { label: 'IMC', data: imc, fill: false, tension: 0.3 },
          { label: 'Peso (kg)', data: peso, fill: false, tension: 0.3 },
          { label: 'Talla (cm)', data: talla, fill: false, tension: 0.3 },
          { label: '% Grasa', data: grasa, fill: false, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Evolución Antropométrica' },
          datalabels: { display: false }
        }
      }
    });
  }

  generarBarChartGlobal(fechas: string[], imc: number[], peso: number[], talla: number[], grasa: number[]) {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [
          { label: 'IMC', data: imc },
          { label: 'Peso (kg)', data: peso },
          { label: 'Talla (cm)', data: talla },
          { label: '% Grasa', data: grasa }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Comparación por Visita' },
          datalabels: { display: false }
        }
      }
    });
  }

  generarGraficosIndividuales(tipo: string, fechas: string[], datos: number[]) {
    const idLinea = `lineChart${tipo}`;
    const idBarra = `barChart${tipo}`;
    const etiqueta = tipo === 'Grasa' ? '% Grasa' : tipo;

    new Chart(idLinea, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: etiqueta,
          data: datos,
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false },
          datalabels: {
            anchor: 'start',
            align: 'bottom',
            offset: 4,
            color: '#333',
            font: {
              weight: 'bold'
            },
            formatter: (value: number) => value.toString()
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    new Chart(idBarra, {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          label: etiqueta,
          data: datos
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false },
          datalabels: {
            anchor: 'center',
            align: 'center',
            offset: 2,
            color: '#333',
            font: {
              weight: 'bold'
            },
            formatter: (value: number) => value.toString()
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }
}