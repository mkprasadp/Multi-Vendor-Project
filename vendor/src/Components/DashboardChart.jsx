import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const DashboardChart = ({ statistics }) => {

  const data = [
    {
      name: "Orders",
      value: statistics?.totalOrders || 0
    },
    {
      name: "Delivered",
      value: statistics?.deliveredOrders || 0
    },
    {
      name: "Pending",
      value: statistics?.pendingOrders || 0
    },
    {
      name: "Cancelled",
      value: statistics?.cancelledOrders || 0
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h3 className="text-xl font-bold mb-5">
        Orders Overview
      </h3>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default DashboardChart;