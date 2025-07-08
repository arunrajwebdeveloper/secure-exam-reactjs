import React from "react";

function AwayModal() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[90]">
      <div className="bg-white p-8 rounded text-center max-w-[400px]">
        <h3 className="text-xl font-bold mb-4 text-black">
          Are you still there?
        </h3>
        <p className="text-lg text-gray-700 font-semibold mb-8">
          Please return to the exam within 10 seconds or it will be
          automatically ended.
        </p>
      </div>
    </div>
  );
}

export default AwayModal;
