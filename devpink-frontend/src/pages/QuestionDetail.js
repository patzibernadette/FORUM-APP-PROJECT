import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../api";
import "./QuestionDetail.css";

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchQuestion = () => {
    apiGet(`/questions/${id}`).then((data) => {
      if (data.id) setQuestion(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim() || answerBody.trim().length < 5) {
      setError("Answer must be at least 5 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const data = await apiPost("/answers", { question_id: id, body: answerBody }, true);
      if (data.message === "Answer posted successfully") {
        setSuccess("Answer posted!");
        setAnswerBody("");
        fetchQuestion();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to post answer.");
      }
    } catch {
      setError("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!question) return <div className="detail-loading">Question not found.</div>;

  return (
    <div className="detail-page">
      <header className="detail-header">
        <div className="dash-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <span>✦</span>
          <span className="dash-title">DevPink</span>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </header>

      <div className="detail-body fade-in">
        {/* Question */}
        <div className="question-block">
          <div className="q-meta">
            <span className="q-author">@{question.author}</span>
            <span className="q-date">{formatDate(question.created_at)}</span>
          </div>
          <h1 className="detail-title">{question.title}</h1>
          <p className="detail-body-text">{question.body}</p>
        </div>

        {/* Answers */}
        <div className="answers-section">
          <h2 className="answers-heading">
            {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
          </h2>

          {question.answers.length === 0 ? (
            <p className="no-answers">No answers yet. Be the first!</p>
          ) : (
            <ul className="answers-list">
              {question.answers.map((a, i) => (
                <li key={a.id} className="answer-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="a-meta">
                    <span className="q-author">@{a.author}</span>
                    <span className="q-date">{formatDate(a.created_at)}</span>
                  </div>
                  <p className="a-body">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Post answer */}
        {user ? (
          <div className="post-answer">
            <h3>Post Your Answer</h3>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <form onSubmit={handleAnswer}>
              <textarea
                value={answerBody}
                onChange={(e) => { setAnswerBody(e.target.value); setError(""); }}
                placeholder="Write your answer here..."
                rows={5}
              />
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Posting..." : "Post Answer"}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-prompt">
            <p>
              <span onClick={() => navigate("/login")} className="link">Sign in</span> to post an answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
