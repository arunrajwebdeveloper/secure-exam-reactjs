import React from "react";

function GracePeriodModal({ gracePeriodCountdown, onClick }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded text-center max-w-[400px]">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Time Up!</h2>
        <p className="text-lg text-gray-700 font-medium mb-6">
          <span className="block">Your results will be auto-submitted in</span>
          {` ${gracePeriodCountdown} seconds.`}
        </p>
        <button
          onClick={onClick}
          className="px-8 transition duration-200 cursor-pointer py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-semibold text-lg"
        >
          End Exam Now
        </button>
      </div>
    </div>
  );
}

export default GracePeriodModal;
