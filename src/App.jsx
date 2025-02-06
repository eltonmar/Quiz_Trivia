import { useState, useEffect } from 'react'
import questions from './data/questions.json'
import './App.css'

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  const [highScores, setHighScores] = useState(
    JSON.parse(localStorage.getItem('highScores')) || []
  )

  const handleAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === questions.questions[currentQuestion].correctAnswer
    setLastAnswerCorrect(isCorrect)
    if (isCorrect) {
      setScore(score + questions.questions[currentQuestion].points)
    }
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    setShowExplanation(false)
    const next = currentQuestion + 1
    if (next < questions.questions.length) {
      setCurrentQuestion(next)
    } else {
      setShowScore(true)
      saveHighScore()
    }
  }

  const saveHighScore = () => {
    const newScore = {
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString('en-US')
    }
    
    const newHighScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
    
    setHighScores(newHighScores)
    localStorage.setItem('highScores', JSON.stringify(newHighScores))
  }

  const clearHighScores = () => {
    setHighScores([])
    localStorage.removeItem('highScores')
  }

  const startGame = () => {
    if (playerName.trim()) {
      setGameStarted(true)
    }
  }

  const restartGame = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowScore(false)
    setGameStarted(false)
    setPlayerName('')
    setShowExplanation(false)
  }

  const isBonus = (question) => {
    return question.points > 10
  }

  return (
    <div className="app">
      <h1 className="title">Chinese History Quiz</h1>
      
      {!gameStarted ? (
        <div className="start-screen">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame}>Start Game</button>
          
          {highScores.length > 0 && (
            <div className="high-scores">
              <div className="high-scores-header">
                <h2>Hall of Fame</h2>
                <button 
                  onClick={clearHighScores}
                  className="clear-scores-btn"
                  title="Clear all high scores"
                >
                  Clear Scores
                </button>
              </div>
              <ul>
                {highScores.map((score, index) => (
                  <li key={index}>
                    <div className="score-info">
                      <span className="score-rank">{index + 1}</span>
                      <div className="score-details">
                        <span className="score-name">{score.name}</span>
                        <span className="score-value"> • {score.score} points</span>
                        <div className="score-date">{score.date}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : showScore ? (
        <div className="score-section">
          <h2>Game Over!</h2>
          <p>You scored {score} out of {questions.questions.reduce((total, q) => total + q.points, 0)}!</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      ) : (
        <div className="question-section">
          <div className="question-count">
            <span>Question {currentQuestion + 1}</span>/{questions.questions.length}
            {isBonus(questions.questions[currentQuestion]) && 
              <span className="bonus-indicator">BONUS! (Double Points)</span>
            }
          </div>
          <div className={`question-text ${isBonus(questions.questions[currentQuestion]) ? 'bonus-question' : ''}`}>
            {questions.questions[currentQuestion].question}
          </div>
          {!showExplanation ? (
            <div className="answer-options">
              {questions.questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`answer-button ${isBonus(questions.questions[currentQuestion]) ? 'bonus-button' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="explanation-section">
              <div className={`answer-result ${lastAnswerCorrect ? 'correct' : 'incorrect'}`}>
                {lastAnswerCorrect ? 'Excellent! You got it right!' : 'Good try! Let\'s learn together!'}
                {isBonus(questions.questions[currentQuestion]) && lastAnswerCorrect && 
                  ' (Double Points Earned!)'
                }
              </div>
              <div className="correct-answer">
                <span className="answer-label">Correct Answer:</span> {questions.questions[currentQuestion].correctAnswer}
              </div>
              <div className="explanation">
                <h3 className="explanation-title">Let's understand why:</h3>
                <p className="explanation-text">{questions.questions[currentQuestion].explanation}</p>
                <div className="fun-fact">
                  <span className="fun-fact-icon">💡</span>
                  <span className="fun-fact-text">Did you know? This is just one of many fascinating facts about Chinese history!</span>
                </div>
              </div>
              <button onClick={nextQuestion} className="next-button">
                Continue Your Journey
              </button>
            </div>
          )}
          <div className="current-score">
            Current Score: {score}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
