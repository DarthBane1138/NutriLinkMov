import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: false
})
export class EstadisticasPage implements OnInit {

  constructor() {}

  ngOnInit() {
    // 🔸 Simulamos los datos, luego los reemplazaremos con los reales
    const fechas = ['10-04-2025', '20-04-2025', '30-04-2025'];
    const pesos = [70, 72, 71];
    const tallas = [170, 170, 170];
    const imc = [24.2, 24.9, 24.6];
    const grasas = [18, 19, 18.5];

    // 🔹 Gráficos globales (evolución conjunta)
    this.generarLineChartGlobal(fechas, imc, pesos, tallas, grasas);
    this.generarBarChartGlobal(fechas, imc, pesos, tallas, grasas);

    // 🔹 Gráficos individuales
    this.generarGraficosIndividuales('IMC', fechas, imc);
    this.generarGraficosIndividuales('Peso', fechas, pesos);
    this.generarGraficosIndividuales('Talla', fechas, tallas);
    this.generarGraficosIndividuales('Grasa', fechas, grasas);
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
          title: { display: true, text: 'Evolución Antropométrica' }
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
          title: { display: true, text: 'Comparación por Visita' }
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
          title: {
            display: false
          },
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
          title: {
            display: false,
            text: `${etiqueta} - Comparación por Visita`
          }
        }
      }
    });
  }
}