import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface NutritionChartProps {
  protein: number;
  carbohydrates: number;
  fat: number;
}

const NutritionChart = ({
  protein,
  carbohydrates,
  fat,
}: NutritionChartProps) => {
  const data = {
    labels: ['Protein', 'Carbohydrates', 'Fat'],
    datasets: [
      {
        data: [protein, carbohydrates, fat],
        backgroundColor: [
          'rgb(54, 162, 235)', // Blue for protein
          'rgb(255, 206, 86)', // Yellow for carbs
          'rgb(255, 99, 132)', // Pink for fat
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Source of Calories',
      },
    },
  };

  return (
    <div className='w-full max-w-full mx-auto'>
      <Pie data={data} options={options} />
    </div>
  );
};

export default NutritionChart;
