import React from "react";
import ToggleSwitch from "./ToggleSwitch";

function Footer({
  handlePrevQuestion,
  isFirstQuestion,
  examEnded,
  showGracePeriodModal,
  handleNextQuestion,
  isCurrentQuestionAnswered,
  isLastQuestion,
  autoAdvanceEnabled,
  setAutoAdvanceEnabled,
}) {
  const isDisabledPrev = isFirstQuestion || examEnded || showGracePeriodModal;
  const isDisabledNext =
    (isLastQuestion && !isCurrentQuestionAnswered) || // remove this condition if want to enable submit button on last question
    (autoAdvanceEnabled && !isLastQuestion) ||
    (!isCurrentQuestionAnswered && !isLastQuestion) ||
    examEnded ||
    showGracePeriodModal;

  return (
    <footer className="h-[50px] flex justify-between">
      <div className="btn-group">
        <div>
          <button
            onClick={handlePrevQuestion}
            disabled={isDisabledPrev} // Disable if first question, exam ended, or grace period active
            className={`${
              isDisabledPrev
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            Previous Question
          </button>
        </div>
        <div>
          <button
            onClick={handleNextQuestion}
            disabled={isDisabledNext} // Disable if not answered and not last question, or exam ended, or grace period active
            className={`
                  ${
                    isDisabledNext
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
          >
            {isLastQuestion ? "Submit Exam" : "Next Question"}
          </button>
        </div>
      </div>

      <div className="pe-[20px] flex items-center">
        <ToggleSwitch
          autoAdvanceEnabled={autoAdvanceEnabled}
          onChange={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
        />
      </div>
    </footer>
  );
}

export default Footer;
