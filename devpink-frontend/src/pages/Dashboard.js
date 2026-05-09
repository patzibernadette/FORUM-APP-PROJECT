import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../api";
import QuestionModal from "../components/QuestionModal";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    apiGet("/categories").then((data) => {
      if (Array.isArray(data)) setCategories(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setLoadingQ(true);
    apiGet(`/questions?category_id=${selectedCategory.id}`).then((data) => {
      if (Array.isArray(data)) setQuestions(data);
      setLoadingQ(false);
    });
  }, [selectedCategory]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleQuestionPosted = () => {
    if (selectedCategory) {
      apiGet(`/questions?category_id=${selectedCategory.id}`).then((data) => {
        if (Array.isArray(data)) setQuestions(data);
      });
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <span>✦</span>
          <span className="dash-title">DevPink</span>
        </div>
        <div className="dash-user">
          <span className="dash-welcome">Welcome, <strong>{user?.username}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dash-body">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <p className="sidebar-label">Categories</p>
          <ul className="category-list">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`category-item ${selectedCategory?.id === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="dash-main">
          {!selectedCategory ? (
            <div className="empty-state fade-in">
              <div className="empty-icon">✦</div>
              <h3>Select a category</h3>
              <p>Choose a topic from the left to view its questions.</p>
            </div>
          ) : (
            <div className="questions-area fade-in">
              <div className="questions-header">
                <div>
                  <span className="cat-icon-lg">{selectedCategory.icon}</span>
                  <h2>{selectedCategory.name}</h2>
                  <p className="cat-desc">{selectedCategory.description}</p>
                </div>
                <button className="btn-ask" onClick={() => setShowModal(true)}>
                  + Ask a Question
                </button>
              </div>

              {loadingQ ? (
                <div className="loading-state">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="no-questions">
                  <p>No questions yet in this category.</p>
                  <button className="btn-ask" onClick={() => setShowModal(true)}>
                    Be the first to ask!
                  </button>
                </div>
              ) : (
                <ul className="question-list">
                  {questions.map((q, i) => (
                    <li
                      key={q.id}
                      className="question-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => navigate(`/questions/${q.id}`)}
                    >
                      <div className="q-meta">
                        <span className="q-author">@{q.author}</span>
                        <span className="q-date">{formatDate(q.created_at)}</span>
                      </div>
                      <h3 className="q-title">{q.title}</h3>
                      <p className="q-body">{q.body}</p>
                      <div className="q-footer">
                        <span className="q-answers">
                          💬 {q.answer_count} {q.answer_count === 1 ? "answer" : "answers"}
                        </span>
                        <span className="q-read">Read more →</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <QuestionModal
          categories={categories}
          defaultCategory={selectedCategory}
          onClose={() => setShowModal(false)}
          onPosted={handleQuestionPosted}
        />
      )}
    </div>
  );
}
