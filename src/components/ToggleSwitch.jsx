import React from "react";

function ToggleSwitch({ autoAdvanceEnabled, onChange }) {
  return (
    <div>
      <label
        htmlFor="autoAdvanceToggle"
        className="flex items-center justify-between cursor-pointer"
        title="Automatically moves to the next question once you select an answer."
      >
        <p className="text-gray-100 mr-2 max-w-[80%] text-left leading-normal">
          <span className="block text-sm font-medium">
            Auto-navigate questions:
          </span>
          {/* <span className="text-[10px] font-normal block leading-[10px]">
            Automatically moves to the next question once you select an answer.
          </span> */}
        </p>
        <div className="relative">
          <input
            type="checkbox"
            id="autoAdvanceToggle"
            className="sr-only"
            checked={autoAdvanceEnabled}
            onChange={onChange}
          />
          <div
            className={`block w-10 h-6 rounded-full duration-200 ${
              autoAdvanceEnabled ? "bg-green-100" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition duration-200 ${
              autoAdvanceEnabled ? "translate-x-full bg-green-400" : "bg-white"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
}

export default ToggleSwitch;
