import React, { useState } from "react";
import axios from "axios";
import { Edit3, Calendar, Type, FileText, CheckCircle, ShieldAlert, X } from "lucide-react";
import { Task, TaskStatus } from "../types";

interface EditTaskFormProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onCancel: () => void;
}

export default function EditTaskForm({ task, onTaskUpdated, onCancel }: EditTaskFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
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
      const res = await axios.put(
        `/api/tasks/${task.id}`,
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

      // Notify parent list of the update
      onTaskUpdated(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update task. Check database permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-md border-0 rounded-4 p-4 h-100 bg-white" id="edit-task-form-card">
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
            <Edit3 size={18} />
          </div>
          <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>Edit Task Details</h4>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-light btn-sm text-secondary rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "28px", height: "28px" }}
        >
          <X size={16} />
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3 rounded-3" role="alert" id="edit-task-error">
          <ShieldAlert size={16} className="text-danger flex-shrink-0" />
          <div className="text-start">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} id="edit-task-form">
        {/* Title input */}
        <div className="mb-3 text-start">
          <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1.5 mb-1">
            <Type size={14} /> Title
          </label>
          <input
            type="text"
            id="edit-task-title-input"
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
            id="edit-task-description-input"
            className="form-control bg-light border-0 py-2.5 px-3 rounded-3"
            rows={3}
            placeholder="Add task details..."
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
              id="edit-task-status-select"
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
              id="edit-task-due-date-input"
              className="form-control bg-light border-0 py-2.5 px-3 rounded-3"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex gap-2.5 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-50 py-2 fw-semibold rounded-3"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            id="edit-task-submit-button"
            className="btn btn-primary w-50 py-2 fw-bold rounded-3 shadow-sm"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
