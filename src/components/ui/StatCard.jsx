import React from 'react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </div>
);

export default StatCard;
