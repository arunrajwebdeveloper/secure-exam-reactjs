import React from "react";

function ExamEndCard({ activityLog }) {
  return (
    <div className="text-left py-10">
      <h2 className="text-3xl font-bold text-green-600 mb-4">Exam Ended!</h2>
      <p className="text-lg text-white">Thank you for completing the exam.</p>
      {/* Activity Log Display */}
      <div className="mt-8 text-left text-gray-300 max-h-100 overflow-y-auto">
        <h3 className="font-semibold mb-4">Activity Log:</h3>
        {activityLog.length > 0 ? (
          <ul>
            {activityLog.map((log, index) => (
              <li key={index} className="mb-1 text-sm">
                {log}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">No suspicious activity logged.</p>
        )}
      </div>
    </div>
  );
}

export default ExamEndCard;
