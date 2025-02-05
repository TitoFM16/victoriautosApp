import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
  } from 'chart.js/auto';
  
  ChartJS.register(CategoryScale, LinearScale, BarElement);
  
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VehicleSearchChart = ({ searchData }) => {
    const data = {
        labels: searchData.map(item => item.marca),
        datasets: [
            {
                label: 'Búsquedas',
                data: searchData.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Vehículos más buscados',
            },
        },
    };

    return <Bar data={data} options={options} />;
};

VehicleSearchChart.propTypes = {
    searchData: PropTypes.arrayOf(
        PropTypes.shape({
            marca: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired
        })
    ).isRequired
};

export default VehicleSearchChart; 