import React from "react";

function Modal({ onClick, modalMessage }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded text-center max-w-[400px]">
        <h3 className="text-xl font-bold mb-4 text-black">Activity Info</h3>
        <p className="text-lg text-gray-700 font-semibold mb-8">
          {modalMessage}
        </p>
        <button
          onClick={onClick}
          className="px-6 py-3 cursor-pointer bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default Modal;
