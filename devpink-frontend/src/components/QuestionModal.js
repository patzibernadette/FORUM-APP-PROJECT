import { useState } from "react";
import { apiPost } from "../api";
import "./QuestionModal.css";

export default function QuestionModal({ categories, defaultCategory, onClose, onPosted }) {
  const [form, setForm] = useState({
    title: "",
    body: "",
    category_id: defaultCategory?.id || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.title || form.title.trim().length < 5)
      e.title = "Title must be at least 5 characters.";
    if (!form.body || form.body.trim().length < 10)
      e.body = "Please provide more detail in your question.";
    if (!form.category_id)
      e.category_id = "Please select a category.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const data = await apiPost("/questions", form, true);
      if (data.message === "Question posted successfully") {
        onPosted();
        onClose();
      } else {
        setErrors({ title: data.error || "Failed to post question." });
      }
    } catch {
      setErrors({ title: "Server error." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card fade-in">
        <div className="modal-header">
          <h2>Ask a Question</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-group" style={{ marginBottom: "1rem" }}>
            <label>Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={errors.category_id ? "input-error" : ""}
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {errors.category_id && <span className="field-error">{errors.category_id}</span>}
          </div>

          <div className="field-group" style={{ marginBottom: "1rem" }}>
            <label>Title</label>
            <input
              name="title"
              type="text"
              placeholder="What's your question?"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field-group" style={{ marginBottom: "1rem" }}>
            <label>Details</label>
            <textarea
              name="body"
              placeholder="Provide more context or details..."
              value={form.body}
              onChange={handleChange}
              rows={5}
              className={errors.body ? "input-error" : ""}
            />
            {errors.body && <span className="field-error">{errors.body}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary modal-submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
