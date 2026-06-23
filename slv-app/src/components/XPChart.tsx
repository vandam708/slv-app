import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler, Legend);

const baseScales = {
  y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#647082' } },
  x: { grid: { display: false }, ticks: { color: '#647082', maxRotation: 0 } },
};

export function XPLineChart({ labels, values }: { labels: string[]; values: number[] }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'XP',
            data: values,
            borderColor: '#4cc9f0',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            backgroundColor: (ctx) => {
              const { ctx: c, chartArea } = ctx.chart;
              if (!chartArea) return 'rgba(76,201,240,0.2)';
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, 'rgba(76,201,240,0.45)');
              g.addColorStop(1, 'rgba(76,201,240,0)');
              return g;
            },
          },
        ],
      }}
      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: baseScales }}
    />
  );
}

export function MetricBarChart({
  labels,
  values,
  color = '#ef6f6f',
  unit = '',
}: {
  labels: string[];
  values: number[];
  color?: string;
  unit?: string;
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: unit || 'reps',
            data: values,
            borderRadius: 6,
            maxBarThickness: 26,
            backgroundColor: (ctx) => {
              const { ctx: c, chartArea } = ctx.chart;
              if (!chartArea) return `${color}cc`;
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, color);
              g.addColorStop(1, `${color}33`);
              return g;
            },
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i) => `${i.formattedValue}${unit ? ' ' + unit : ''}` } },
        },
        scales: baseScales,
      }}
    />
  );
}

export function MetricLineChart({
  labels,
  values,
  color = '#ef6f6f',
  unit = '',
}: {
  labels: string[];
  values: number[];
  color?: string;
  unit?: string;
}) {
  const rgb = hexToRgb(color);
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: unit || 'total',
            data: values,
            borderColor: color,
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            backgroundColor: (ctx) => {
              const { ctx: c, chartArea } = ctx.chart;
              if (!chartArea) return `rgba(${rgb},0.2)`;
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, `rgba(${rgb},0.45)`);
              g.addColorStop(1, `rgba(${rgb},0)`);
              return g;
            },
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i) => `${i.formattedValue}${unit ? ' ' + unit : ''}` } },
        },
        scales: baseScales,
      }}
    />
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function SecretBarChart({
  labels,
  soulData,
  shadowData,
}: {
  labels: string[];
  soulData: number[];
  shadowData: number[];
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          { label: 'Душа', data: soulData, backgroundColor: '#9d7be8', borderRadius: 4 },
          { label: 'Аскеза', data: shadowData, backgroundColor: '#647082', borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9fb0c6', boxWidth: 12 } } },
        scales: baseScales,
      }}
    />
  );
}
