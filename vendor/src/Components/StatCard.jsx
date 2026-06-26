import React from "react";

const StatCard = ({ title, value }) => {

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition duration-300">

      <h4 className="text-gray-500 text-sm font-medium">
        {title}
      </h4>

      <p className="text-3xl font-bold mt-3 text-gray-800">
        {value}
      </p>

    </div>
  );
};

export default StatCard;