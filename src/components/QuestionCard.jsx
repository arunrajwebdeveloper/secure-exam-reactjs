import React from "react";

function QuestionCard({
  currentQuestionIndex,
  questions,
  currentQuestion,
  userAnswers,
  handleOptionChange,
}) {
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-400 mb-3">
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <p className="text-xl font-semibold text-white mb-8">
        {currentQuestion.text}
      </p>
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center p-1 cursor-pointer"
          >
            <div className="relative w-[20px] h-[20px]">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={userAnswers[currentQuestion.id] === option.id}
                onChange={handleOptionChange}
                className="peer hidden"
              />
              <div className="peer-disabled:bg-slate-500 w-[20px] h-[20px] rounded-full border-2 border-gray-400 flex items-center justify-center transition peer-checked:border-blue-600 peer-checked:bg-blue-600"></div>
              <div className="peer-disabled:bg-slate-500 w-[8px] h-[8px] absolute top-[6px] left-[6px] z-40 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform duration-200" />
            </div>

            <span className="ml-3 text-base text-white">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;
