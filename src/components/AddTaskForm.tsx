import React, { useState } from "react";
import axios from "axios";
import { Plus, Calendar, Type, FileText, CheckCircle, ShieldAlert } from "lucide-react";
import { Task, TaskStatus } from "../types";

interface AddTaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export default function AddTaskForm({ onTaskCreated }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/tasks",
        {
          title: title.trim(),
          description: description.trim(),
          status,
          dueDate: dueDate ? dueDate : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset
      setTitle("");
      setDescription("");
      setStatus("PENDING");
      setDueDate("");
      
      // Notify parent list
      onTaskCreated(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not register new task. Check validation guidelines.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white" id="add-task-form-card">
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-light">
        <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
          <Plus size={18} />
        </div>
        <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>Create New Task</h4>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3 rounded-3" role="alert" id="add-task-error">
          <ShieldAlert size={16} className="text-danger flex-shrink-0" />
          <div className="text-start">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} id="add-task-form">
        {/* Title input */}
        <div className="mb-3 text-start">
          <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1.5 mb-1">
            <Type size={14} /> Title
          </label>
          <input
            type="text"
            id="add-task-title-input"
            className="form-control bg-light border-0 py-2.5 px-3 rounded-3"
            placeholder="Review Spring Jpa models..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3 text-start">
          <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1.5 mb-1">
            <FileText size={14} /> Description
          </label>
          <textarea
            id="add-task-description-input"
            className="form-control bg-light border-0 py-2.5 px-3 rounded-3"
            rows={3}
            placeholder="Add task bullet points or descriptions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="row">
          {/* Status Select */}
          <div className="col-12 col-md-6 mb-3 text-start">
            <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1.5 mb-1">
              <CheckCircle size={14} /> Status
            </label>
            <select
              id="add-task-status-select"
              className="form-select bg-light border-0 py-2.5 px-3 rounded-3"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Due date Calendar selection */}
          <div className="col-12 col-md-6 mb-3 text-start">
            <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1.5 mb-1">
              <Calendar size={14} /> Due Date
            </label>
            <input
              type="date"
              id="add-task-due-date-input"
              className="form-control bg-light border-0 py-2.5 px-3 rounded-3"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          id="add-task-submit-button"
          className="btn btn-success w-100 py-2.5 fw-bold rounded-3 shadow-sm mt-2 d-flex align-items-center justify-content-center gap-2"
          disabled={loading}
        >
          {loading ? "Saving task..." : "Add New Task"}
        </button>
      </form>
    </div>
  );
}
