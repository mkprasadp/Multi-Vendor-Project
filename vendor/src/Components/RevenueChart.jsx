import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ sales }) => {
  const totalRevenue = sales.reduce(
    (sum, value) => sum + value,
    0
  );

  const highestRevenue = Math.max(...sales, 0);

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    datasets: [
      {
        label: "Monthly Revenue",
        data: sales,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6,182,212,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        display: true,
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.raw}`;
          },
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Revenue Analytics
          </h2>

          <p className="text-gray-500">
            Monthly revenue performance
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Total Revenue
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            ₹{totalRevenue.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">

        <div className="bg-cyan-50 p-4 rounded-xl">
          <p className="text-gray-500">
            Highest Month
          </p>

          <h3 className="text-2xl font-bold text-cyan-600">
            ₹{highestRevenue.toLocaleString()}
          </h3>
        </div>

        <div className="bg-green-50 p-4 rounded-xl">
          <p className="text-gray-500">
            Average Revenue
          </p>

          <h3 className="text-2xl font-bold text-green-600">
            ₹
            {Math.round(
              totalRevenue / 12
            ).toLocaleString()}
          </h3>
        </div>

      </div>

      {/* Chart */}
      <Line
        data={data}
        options={options}
      />
    </div>
  );
};

export default RevenueChart;