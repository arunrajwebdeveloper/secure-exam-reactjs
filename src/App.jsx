import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "./components/Modal";
import GracePeriodModal from "./components/GracePeriodModal";
import ExamEndCard from "./components/ExamEndCard";
import QuestionCard from "./components/QuestionCard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AwayModal from "./components/AwayModal";

// Main ExamPage component
const App = () => {
  // State variables for exam status and data
  const [examStarted, setExamStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // Time in seconds for main exam
  const [examEnded, setExamEnded] = useState(false);

  // New state for grace period
  const [showGracePeriodModal, setShowGracePeriodModal] = useState(false);
  const [gracePeriodCountdown, setGracePeriodCountdown] = useState(10); // 10 seconds for auto-submit

  // New state for auto-advance functionality
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false); // Default: off

  // Array of questions
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is the capital of France?",
      options: [
        { id: "a", text: "Berlin" },
        { id: "b", text: "Madrid" },
        { id: "c", text: "Paris" },
        { id: "d", text: "Rome" },
      ],
      // In a real secure exam, the correct answer would NOT be sent to the client.
      correctAnswer: "c",
    },
    {
      id: 2,
      text: "Which planet is known as the Red Planet?",
      options: [
        { id: "a", text: "Earth" },
        { id: "b", text: "Mars" },
        { id: "c", text: "Jupiter" },
        { id: "d", text: "Venus" },
      ],
      correctAnswer: "b",
    },
    {
      id: 3,
      text: "What is the largest ocean on Earth?",
      options: [
        { id: "a", text: "Atlantic Ocean" },
        { id: "b", text: "Indian Ocean" },
        { id: "c", text: "Arctic Ocean" },
        { id: "d", text: "Pacific Ocean" },
      ],
      correctAnswer: "d",
    },
    {
      id: 4,
      text: "Who painted the Mona Lisa?",
      options: [
        { id: "a", text: "Vincent van Gogh" },
        { id: "b", text: "Pablo Picasso" },
        { id: "c", text: "Leonardo da Vinci" },
        { id: "d", text: "Claude Monet" },
      ],
      correctAnswer: "c",
    },
    {
      id: 5,
      text: "What is the chemical symbol for water?",
      options: [
        { id: "a", text: "O2" },
        { id: "b", text: "H2O" },
        { id: "c", text: "CO2" },
        { id: "d", text: "NaCl" },
      ],
      correctAnswer: "b",
    },
  ]);

  const [isFullscreen, setIsFullscreen] = useState(false); // State to track fullscreen status
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Current question index
  const [userAnswers, setUserAnswers] = useState({}); // Stores answers: { questionId: selectedOptionId }
  const [activityLog, setActivityLog] = useState([]); // To log security-related events
  const examContainerRef = useRef(null); // Ref for the main exam container to request fullscreen

  // State for custom alert modal (for general messages)
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Refs to store interval IDs
  const mainTimerIntervalRef = useRef(null);
  const graceTimerIntervalRef = useRef(null);

  // Refs to track high-res time and absolute end time
  const perfStartRef = useRef(null); // performance.now() at exam start
  const endTimestampRef = useRef(null); // absolute exam end timestamp (Date.now-based)

  const awayTimerRef = useRef(null); // Away modal ref
  const [showAwayModal, setShowAwayModal] = useState(null);

  /**
   * Displays a custom alert modal.
   * @param {string} message - The message to display in the modal.
   */
  const showCustomAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  /**
   * Closes the custom alert modal.
   */
  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  /**
   * Mock API call to fetch the exam end time.
   * In a real application, this would be a network request to your backend.
   * @returns {Promise<string>} A promise that resolves with the exam end time in ISO format.
   */
  // Step 1: Fetch Exam End Time
  const fetchExamEndTime = useCallback(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5); // Set exam end time 5 mins from now
        console.log("now.toISOString() :>> ", now.toISOString());
        resolve(now.toISOString()); // Return in ISO format
      }, 500); // Simulate network delay
    });
  }, []);

  /**
   * Logs an activity message to the internal log and console.
   * @param {string} message - The activity message to log.
   */
  const logActivity = (message) => {
    setActivityLog((prevLog) => [
      ...prevLog,
      `${new Date().toLocaleString()}: ${message}`,
    ]);
    console.log(`Security Log: ${message}`); // For debugging in console
    // In a real application, this log would be sent to a server.
  };

  /**
   * Handles the exam submission. This is the ultimate function to end the exam.
   * In a real application, this would send all answers and activity log to the server.
   */
  const handleSubmitExam = useCallback(() => {
    // Clear all timers
    if (mainTimerIntervalRef.current) {
      clearInterval(mainTimerIntervalRef.current);
      mainTimerIntervalRef.current = null;
    }
    if (graceTimerIntervalRef.current) {
      clearInterval(graceTimerIntervalRef.current);
      graceTimerIntervalRef.current = null;
    }
    if (perfStartRef.current) {
      clearInterval(perfStartRef.current);
      perfStartRef.current = null;
    }
    if (endTimestampRef.current) {
      clearInterval(endTimestampRef.current);
      endTimestampRef.current = null;
    }

    setExamEnded(true); // Mark exam as officially ended
    setShowGracePeriodModal(false); // Hide grace period modal if open
    setShowAwayModal(false);
    closeModal(); // Close any other custom alerts

    logActivity("Exam submitted.");
    showCustomAlert("Exam Submitted! Your responses have been recorded.");
    console.log("User Answers:", userAnswers); // For debugging
    console.log("Final Activity Log:", activityLog); // Log the full activity log on submit for debugging
    // Here, you would typically send `userAnswers` and `activityLog` to your backend.
  }, [userAnswers, activityLog]); // Dependencies for useCallback

  // Step 2: Initialize exam - fetch end time and set examStarted
  useEffect(() => {
    const initializeExamData = async () => {
      if (!examStarted && !examEnded) {
        const examEndTimeISO = await fetchExamEndTime();
        const examEndTime = new Date(examEndTimeISO).getTime();
        const now = Date.now();

        // Store sync points
        endTimestampRef.current = examEndTime;
        perfStartRef.current = performance.now();

        const initialRemaining = Math.max(
          0,
          Math.floor((examEndTime - now) / 1000)
        );
        setRemainingTime(initialRemaining);
        setExamStarted(true);
      }
    };
    initializeExamData();
  }, [examStarted, examEnded, fetchExamEndTime]);

  // Step 3: Manage the main countdown timer
  useEffect(() => {
    if (examStarted && !examEnded && !showGracePeriodModal) {
      mainTimerIntervalRef.current = setInterval(() => {
        const elapsed = performance.now() - perfStartRef.current;
        const nowEstimate =
          Date.now() + elapsed - (performance.now() - perfStartRef.current); // stable now

        const remainingSeconds = Math.max(
          0,
          Math.floor((endTimestampRef.current - nowEstimate) / 1000)
        );

        setRemainingTime(remainingSeconds);

        if (remainingSeconds <= 0) {
          clearInterval(mainTimerIntervalRef.current);
          mainTimerIntervalRef.current = null;
          logActivity("Main exam time ended. Starting grace period.");
          setShowGracePeriodModal(true);
          setGracePeriodCountdown(10);
        }
      }, 1000);
    } else {
      if (mainTimerIntervalRef.current) {
        clearInterval(mainTimerIntervalRef.current);
        mainTimerIntervalRef.current = null;
      }
      if (perfStartRef.current) {
        clearInterval(perfStartRef.current);
        perfStartRef.current = null;
      }
      if (endTimestampRef.current) {
        clearInterval(endTimestampRef.current);
        endTimestampRef.current = null;
      }
    }

    return () => {
      if (mainTimerIntervalRef.current) {
        clearInterval(mainTimerIntervalRef.current);
        mainTimerIntervalRef.current = null;
      }
    };
  }, [examStarted, examEnded, showGracePeriodModal]); // Dependencies: timer depends on examStarted, examEnded, showGracePeriodModal

  // Effect 3: Manage the grace period countdown timer
  useEffect(() => {
    if (
      (showGracePeriodModal && gracePeriodCountdown > 0) ||
      (showAwayModal && gracePeriodCountdown > 0)
    ) {
      graceTimerIntervalRef.current = setInterval(() => {
        setGracePeriodCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(graceTimerIntervalRef.current);
            graceTimerIntervalRef.current = null;
            handleSubmitExam(); // Auto-submit when grace period ends
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    } else if (
      (gracePeriodCountdown === 0 && showGracePeriodModal) ||
      (gracePeriodCountdown === 0 && showAwayModal)
    ) {
      // If countdown is already 0 but modal is still showing (e.g., direct submit), close it
      if (showGracePeriodModal) {
        setShowGracePeriodModal(false);
      }
      if (showAwayModal) {
        setShowAwayModal(false);
      }
    }

    // Cleanup function
    return () => {
      if (graceTimerIntervalRef.current) {
        clearInterval(graceTimerIntervalRef.current);
        graceTimerIntervalRef.current = null;
      }
    };
  }, [
    showGracePeriodModal,
    showAwayModal,
    gracePeriodCountdown,
    handleSubmitExam,
  ]); // Dependencies: grace period logic

  /**
   * Requests fullscreen mode for the exam container.
   */
  const requestFullScreen = useCallback(() => {
    if (
      examContainerRef.current &&
      examContainerRef.current.requestFullscreen
    ) {
      examContainerRef.current.requestFullscreen().catch((err) => {
        logActivity(`Fullscreen request failed: ${err.message}`);
        console.error("Fullscreen request failed:", err);
        showCustomAlert(
          `Could not go full screen. Please manually enter full screen mode for a secure exam experience. Error: ${err.message}`
        );
      });
    }
  }, [logActivity, showCustomAlert]); // Dependencies for useCallback

  /**
   * Toggles fullscreen mode based on current state.
   */
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      requestFullScreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [requestFullScreen]); // Dependencies for useCallback

  // Effect for handling fullscreen and security events
  useEffect(() => {
    // Only apply security measures if the exam has started and not yet ended
    if (!examStarted || examEnded) return;

    /**
     * Handles changes in fullscreen state.
     */
    const handleFullScreenChange = () => {
      const currentFullscreenState = document.fullscreenElement !== null;
      setIsFullscreen(currentFullscreenState); // Update local state for button text
      if (!currentFullscreenState) {
        logActivity("Exited fullscreen");
        showCustomAlert(
          "You have exited fullscreen mode. This activity has been logged."
        );
      } else {
        logActivity("Entered fullscreen");
      }
    };

    /**
     * Handles changes in document visibility (e.g., tab switching).
     */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logActivity("Tab visibility changed to hidden");
        showCustomAlert(
          "You switched tabs or minimized the browser. This activity has been logged."
        ); // Use custom alert
        // In a strict exam, you might penalize the user or end the exam here.

        // awayTimerRef.current = setTimeout(() => {
        //   closeModal();
        //   setShowAwayModal(true);
        //   setGracePeriodCountdown(10);
        //   graceTimerIntervalRef.current = setInterval(() => {
        //     setGracePeriodCountdown((prev) => {
        //       if (prev <= 1) {
        //         clearInterval(graceTimerIntervalRef.current);
        //         graceTimerIntervalRef.current = null;
        //         setShowAwayModal(false);
        //         handleSubmitExam();
        //         return 0;
        //       }
        //       return prev - 1;
        //     });
        //   }, 1000);
        // }, 5000);
      } else {
        logActivity("Tab visibility changed to visible");

        // Clear away modal countdown and timer
        // if (awayTimerRef.current) {
        //   clearTimeout(awayTimerRef.current);
        //   awayTimerRef.current = null;
        // }
        // if (graceTimerIntervalRef.current) {
        //   clearInterval(graceTimerIntervalRef.current);
        //   graceTimerIntervalRef.current = null;
        // }

        // setShowAwayModal(false);
        // setGracePeriodCountdown(null);
      }
    };

    /**
     * Handles when the window loses focus (e.g., user clicks outside the browser or switches to another application).
     */
    const handleWindowBlur = () => {
      logActivity("Window lost focus");
      showCustomAlert(
        "The exam window lost focus. This activity has been logged."
      ); // Use custom alert
      // You might consider more severe actions here, like ending the exam.

      awayTimerRef.current = setTimeout(() => {
        closeModal();
        setShowAwayModal(true);
        setGracePeriodCountdown(10);
        graceTimerIntervalRef.current = setInterval(() => {
          setGracePeriodCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(graceTimerIntervalRef.current);
              graceTimerIntervalRef.current = null;
              setShowAwayModal(false);
              handleSubmitExam();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 5000);
    };

    const handleWindowFocus = () => {
      logActivity("Window regained focus");

      // Clear away modal countdown and timer
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
        awayTimerRef.current = null;
      }
      if (graceTimerIntervalRef.current) {
        clearInterval(graceTimerIntervalRef.current);
        graceTimerIntervalRef.current = null;
      }

      setShowAwayModal(false);
      setGracePeriodCountdown(null);
    };

    /**
     * Prevents copy, cut, and paste actions.
     * @param {Event} e - The event object.
     */
    const handleCopyCutPaste = (e) => {
      logActivity(`Blocked ${e.type} action`);
      e.preventDefault(); // Prevent the default action
      showCustomAlert(`"${e.type}" action is not allowed during the exam.`); // Use custom alert
    };

    /**
     * Handles keydown events to prevent unwanted actions (e.g., Esc, F-keys, Alt+Tab).
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    const handleKeyDown = (e) => {
      // List of common keys/combinations to block
      const forbiddenKeys = [
        "Escape", // Esc key
        "F1",
        "F2",
        "F3",
        "F4",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9",
        "F10",
        "F11",
        "F12", // Function keys
      ];

      // Prevent Alt+Tab (not fully preventable by JS alone, but we can log attempts)
      if (e.altKey && e.key === "Tab") {
        logActivity("Blocked Alt+Tab attempt");
        e.preventDefault();
        showCustomAlert("Alt+Tab is not allowed."); // Use custom alert
      }

      // Prevent Ctrl/Cmd + R (refresh)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        logActivity("Blocked refresh attempt (Ctrl/Cmd+R)");
        e.preventDefault();
        showCustomAlert("Refreshing the page is not allowed."); // Use custom alert
      }

      // Prevent Ctrl/Cmd + W (close tab)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        logActivity("Blocked close tab attempt (Ctrl/Cmd+W)");
        e.preventDefault();
        showCustomAlert("Closing the tab is not allowed."); // Use custom alert
      }

      // Prevent Page saving
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s")
      ) {
        logActivity(
          "Blocked page save attempt (Ctrl/Cmd+Shift+s) and (Ctrl/Cmd+s)"
        );
        e.preventDefault();
        showCustomAlert("Page save is not allowed."); // Use custom alert
      }

      // Prevent open tab / reopen tab
      // if (
      //   ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") ||
      //   ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "t")
      // ) {
      //   logActivity(
      //     "Blocked tab open / reopen attempt (Ctrl/Cmd+Shift+t) and (Ctrl/Cmd+t)"
      //   );
      //   e.preventDefault();
      //   showCustomAlert("Tab open / Re-open is not allowed."); // Use custom alert
      // }

      // Prevent Ctrl+Shift+I or Cmd+Shift+I
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "i"
      ) {
        logActivity("Blocked developer mode attempt (Ctrl/Cmd+Shift+i)");
        e.preventDefault();
        showCustomAlert("Developer mode is not allowed."); // Use custom alert
      }

      // Prevent Ctrl+Shift+C (Element Picker)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "c"
      ) {
        logActivity("Blocked inspect element attempt (Ctrl/Cmd+Shift+c)");
        e.preventDefault();
        showCustomAlert("Inspect element is not allowed."); // Use custom alert
      }

      // Prevent Ctrl+Shift+J (Console)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "j"
      ) {
        logActivity("Blocked open console panel attempt (Ctrl/Cmd+Shift+j)");
        e.preventDefault();
        showCustomAlert("Console panel is not allowed."); // Use custom alert
      }

      // Prevent context menu (right-click)
      if (e.type === "contextmenu") {
        logActivity("Blocked right-click (context menu)");
        e.preventDefault();
        showCustomAlert("Right-click is disabled during the exam."); // Use custom alert
      }

      // Prevent other forbidden keys
      if (forbiddenKeys.includes(e.key)) {
        logActivity(`Blocked key: ${e.key}`);
        e.preventDefault();
        showCustomAlert(`The "${e.key}" key is disabled during the exam.`); // Use custom alert
      }
    };

    // Attach all event listeners
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleKeyDown);

    // Initial check for fullscreen state
    setIsFullscreen(document.fullscreenElement !== null);

    // Request fullscreen when the exam starts
    requestFullScreen();

    // Cleanup function: remove all event listeners when the component unmounts or exam ends
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleKeyDown);

      if (graceTimerIntervalRef.current) {
        clearInterval(graceTimerIntervalRef.current);
      }
    };
  }, [examStarted, examEnded]);

  /**
   * Formats time from seconds into HH:MM:SS string.
   * @param {number} seconds - The total number of seconds.
   * @returns {string} Formatted time string.
   */
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  /**
   * Handles the change event for radio button options.
   * Updates the user's answer for the current question.
   * @param {Object} e - The event object from the radio button.
   */
  const handleOptionChange = (e) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion.id]: e.target.value,
    }));

    // Auto-advance logic:
    // Use a setTimeout to allow React to finish state update before potentially navigating.
    // This ensures the userAnswers state is fully updated for the next question's rendering.
    if (autoAdvanceEnabled) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }

        // If auto-advance is on and it's the last question, automatically submit
        // else {
        //   handleSubmitExam();
        // }
      }, 0);
    }
  };

  /**
   * Moves to the next question if an answer is selected.
   * If it's the last question, it triggers exam submission.
   */
  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (userAnswers[currentQuestion.id] || !autoAdvanceEnabled) {
      // Check if current question is answered
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        // This is the last question, so submit the exam
        handleSubmitExam();
      }
    } else {
      showCustomAlert(
        "Please select an option before proceeding to the next question."
      );
    }
  };

  /**
   * Moves to the previous question.
   */
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Get the current question to display
  const currentQuestion = questions[currentQuestionIndex];
  // Check if the current question has been answered
  const isCurrentQuestionAnswered =
    userAnswers[currentQuestion?.id] !== undefined;
  // Determine if it's the last question
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  // Determine if it's the first question
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    // Main container for the exam page, used for fullscreen request
    <div ref={examContainerRef} className="min-h-screen font-inter">
      {/* Custom Alert Modal (for general messages) */}
      {showModal && <Modal onClick={closeModal} modalMessage={modalMessage} />}

      {showAwayModal && (
        <AwayModal gracePeriodCountdown={gracePeriodCountdown} />
      )}

      {/* Grace Period Modal (new) */}
      {showGracePeriodModal && (
        <GracePeriodModal
          gracePeriodCountdown={gracePeriodCountdown}
          onClick={handleSubmitExam}
        />
      )}

      {/* Header section with title and timer */}
      <Header
        remainingTime={remainingTime}
        examStarted={examStarted}
        examEnded={examEnded}
        formatTime={formatTime}
        toggleFullScreen={toggleFullScreen}
        isFullscreen={isFullscreen}
      />

      {/* Main exam content card */}
      <div className="w-full max-w-[700px] mx-auto rounded-lg p-6 main">
        {examEnded ? (
          // Display when exam has ended
          <ExamEndCard activityLog={activityLog} />
        ) : (
          // Display when exam is ongoing
          <QuestionCard
            currentQuestionIndex={currentQuestionIndex}
            questions={questions}
            currentQuestion={currentQuestion}
            userAnswers={userAnswers}
            handleOptionChange={handleOptionChange}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        handlePrevQuestion={handlePrevQuestion}
        isFirstQuestion={isFirstQuestion}
        examEnded={examEnded}
        showGracePeriodModal={showGracePeriodModal}
        handleNextQuestion={handleNextQuestion}
        isCurrentQuestionAnswered={isCurrentQuestionAnswered}
        isLastQuestion={isLastQuestion}
        autoAdvanceEnabled={autoAdvanceEnabled}
        setAutoAdvanceEnabled={setAutoAdvanceEnabled}
      />
    </div>
  );
};

export default App;
