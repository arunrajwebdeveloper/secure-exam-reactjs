import React from "react";

function Header({
  remainingTime,
  examEnded,
  formatTime,
  toggleFullScreen,
  showGracePeriodModal,
  isFullscreen,
}) {
  return (
    <header className="h-[50px] flex justify-between">
      <div className="left">
        <div>
          <h2>Secure Exam</h2>
        </div>
        <div>
          <h2
            className={`${
              remainingTime <= 60 && !examEnded ? "time-alert" : ""
            }`}
          >
            {formatTime(remainingTime)}
          </h2>
        </div>
      </div>

      <div className="right">
        <div>
          <button
            onClick={toggleFullScreen} // Use the new toggleFullScreen function
            disabled={examEnded || showGracePeriodModal}
            className={`toggle-fullscreen-btn
                      ${
                        examEnded || showGracePeriodModal
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
          >
            <svg
              className="toggle-fullscreen-svg"
              width="24"
              height="24"
              viewBox="-2 -2 28 28"
            >
              {!isFullscreen ? (
                <g className="icon-fullscreen-enter">
                  <path d="M 2 9 v -7 h 7" />
                  <path d="M 22 9 v -7 h -7" />
                  <path d="M 22 15 v 7 h -7" />
                  <path d="M 2 15 v 7 h 7" />
                </g>
              ) : (
                <g className="icon-fullscreen-leave">
                  <path d="M 24 17 h -7 v 7" />
                  <path d="M 0 17 h 7 v 7" />
                  <path d="M 0 7 h 7 v -7" />
                  <path d="M 24 7 h -7 v -7" />
                </g>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
