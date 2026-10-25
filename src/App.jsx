import { useEffect, useRef, useState } from "react";
import "./App.css";
import quizData from "../quiz/quiz.json";

function App() {
  const videoRef = useRef(null);
  const ImageCaptureRef = useRef(null);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  const [showExamDetails, setShowExamDetails] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Quiz state
  const questions = Array.isArray(quizData) ? quizData : quizData.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  async function getLaspedTime() {
    try {
      const currTime = await window.electronAPI.getRemainingTime();
      setTime(currTime);
    } catch (error) {
      console.error("Error fetching time:", error);
    }
  }

  async function clickPhoto() {
    if (!ImageCaptureRef.current) return;

    try {
      const blob = await ImageCaptureRef.current.takePhoto();
      const buffer = await blob.arrayBuffer();
      await window.electronAPI.savePhoto(buffer);
      console.log(blob);
    } catch (error) {
      console.error("Failed to capture photo:", error);
    }
  }

  useEffect(() => {
    if (!started || isSubmitted) return;

    const interval = setInterval(() => clickPhoto(), 5000);
    const timerInterval = setInterval(() => getLaspedTime(), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [started, isSubmitted]);

  async function getCamera() {
    try {
      const videoData = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = videoData;

      const track = videoData.getVideoTracks()[0];
      ImageCaptureRef.current = new ImageCapture(track);

      setCameraReady(true);
    } catch (error) {
      console.error("Camera access denied or failed", error);
      alert("Please grant camera permissions to continue.");
    }
  }

  async function getFullscreen() {
    try {
      await window.electronAPI.setFullScreen();
    } catch (error) {
      console.error("Fullscreen request failed", error);
    }
  }

  // Transitions to the new details screen
  function handleGoToTest() {
    if (!cameraReady) {
      alert("Please allow camera access first!");
      return;
    }
    setShowExamDetails(true);
  }

  // Actually starts the test from the details screen
  async function startActualTest() {
    try {
      await window.electronAPI.showExamRules();
      await window.electronAPI.startTest();
      await getLaspedTime();
      setStarted(true);
    } catch (error) {
      console.error("Failed to start test:", error);
    }
  }

  function handleSubmitTest() {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit the test?"
    );
    if (!confirmSubmit) return;

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsSubmitted(true);
  }

  function formatTimeLeft(ms) {
    if (!ms || ms < 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, "0");
    const minutes = Math.floor((ms / (1000 * 60)) % 60).toString().padStart(2, "0");
    const hours = Math.floor(ms / (1000 * 60 * 60)).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // View: Test Completed Screen (no evaluation yet)
  if (isSubmitted) {
    return (
      <div className="test-completed-page">
        <div className="completed-card">
          <div className="completed-card-header">
            <div className="success-icon">✓</div>
          </div>

          <div className="completed-card-body">
            <h2>Test Completed!</h2>
            <p className="completed-subtitle">
              Your test has been successfully submitted.
            </p>

            <div className="submission-summary">
              <div className="summary-stat">
                <span className="summary-label">Total Questions</span>
                <p className="summary-value">{questions.length}</p>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Answered</span>
                <p className="summary-value">
                  {Object.keys(selectedAnswers).length}
                </p>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Unanswered</span>
                <p className="summary-value">
                  {questions.length - Object.keys(selectedAnswers).length}
                </p>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Status</span>
                <p className="summary-value status-badge">Submitted</p>
              </div>
            </div>

            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <p>
                Evaluation is pending. Your responses have been securely recorded. You may now safely exit or close this window.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Exam Details Screen
  if (showExamDetails && !started) {
    return (
      <div className="exam-details-page">
        <button className="back-btn" onClick={() => setShowExamDetails(false)}>
          &lt; Back
        </button>
        
        <div className="exam-card">
          <div className="exam-card-header">
            <div className="clipboard-icon">📋</div>
          </div>
          
          <div className="exam-card-body">
            <div className="exam-section">
              <span className="label">Playlist Title</span>
              <p className="title-text">Data Communication, UI/UX, List Rendering, Screen Communication, React Native Da ... - Revision</p>
            </div>

            <div className="exam-section">
              <span className="label">TEST SYLLABUS</span>
              <p className="description-text">Data Communication, UI/UX, Screen Communication, React Native Data Storage, List Rendering, Local Persistence</p>
            </div>

            <div className="exam-stats">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div>
                  <span className="label">SCHEDULED FOR</span>
                  <p>Oct 21, 2026 8:05 PM</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📝</span>
                <div>
                  <span className="label">NUMBER OF QUESTIONS</span>
                  <p>{questions.length} Questions</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <div>
                  <span className="label">TOTAL XP</span>
                  <p>16</p>
                </div>
              </div>
            </div>

            <button onClick={startActualTest} className="btn-start-test">
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 1 & 3: Permissions Screen and Active Test Video state
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        className={cameraReady && !started ? "video-preview" : "hidden-video"}
      />

      {/* Hide permissions page if test is running */}
      {!started && (
        <div className="page-container">
          <div className="header-section">
            <h1>Hi User!</h1>
            <p>Kindly Allow the following Permissions to Start the test:</p>
          </div>

          <div className="card-container">
            <div className="permission-item">
              <div className="permission-icon">↗</div>
              <div className="permission-content">
                <h3>Configure Camera</h3>
                <p>Kindly configure Camera to attempt quiz/contests.</p>
                <div className="action-row">
                  <button onClick={getCamera} className="btn btn-dark" disabled={cameraReady}>
                    {cameraReady ? "Camera Ready" : "Get Camera Access"}
                  </button>
                </div>
                {cameraReady && <div className="camera-space" />}
              </div>
            </div>

            <div className="divider" />

            <div className="permission-item">
              <div className="permission-icon">⛶</div>
              <div className="permission-content">
                <h3>Switch to full screen</h3>
                <p>Kindly close all tabs and switch to full screen.</p>
                <button onClick={getFullscreen} className="btn btn-light-blue">
                  Give Full Screen Permissions
                </button>
              </div>
            </div>
          </div>

          <div className="bottom-actions">
            <button 
              onClick={handleGoToTest} 
              className={`btn ${cameraReady ? "btn-light-blue" : "btn-disabled"}`}
            >
              Go To Test
            </button>
            <button className="btn btn-outline">Need Help?</button>
          </div>
        </div>
      )}
      
      {started && (
        <div className="exam-page">
          <div className="exam-container">
            <div className="exam-header">
              <h3>Time Left : {formatTimeLeft(time)}</h3>
              <button className="end-test-btn" onClick={handleSubmitTest}>
                Submit Test
              </button>
            </div>

            {currentQuestion ? (
              <div className="question-card">
                <h2>
                  QUESTION {currentQuestionIndex + 1} OF {questions.length}
                </h2>
                <p>{currentQuestion.question || currentQuestion.title}</p>

                <div className="options-container">
                  {(currentQuestion.options || currentQuestion.choices || []).map(
                    (option, index) => (
                      <label key={index} className="option-row">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          checked={selectedAnswers[currentQuestionIndex] === index}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [currentQuestionIndex]: index,
                            }))
                          }
                        />
                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>

                <div className="navigation-buttons">
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button className="btn-submit-nav" onClick={handleSubmitTest}>
                      Submit Test
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(questions.length - 1, prev + 1)
                        )
                      }
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="question-card">
                <p>No questions available in quiz/quiz.json.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;