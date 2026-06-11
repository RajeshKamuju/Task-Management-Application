import { Task, TaskStatus } from "../types";
import { Trash2, Edit2, Calendar, ClipboardCheck, ClipboardCopy, Loader2, RefreshCw } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onEditSelect: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onStatusToggle: (taskId: number, currentStatus: TaskStatus) => void;
  loading: boolean;
}

export default function TaskList({ tasks, onEditSelect, onTaskDelete, onStatusToggle, loading }: TaskListProps) {

  // Helper to resolve status badge styling
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-30 rounded-pill py-1.5 px-2.5">Completed</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-30 rounded-pill py-1.5 px-2.5">In Progress</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-30 rounded-pill py-1.5 px-2.5">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" id="task-list-loading">
        <Loader2 className="text-primary animate-spin" size={32} />
        <span className="text-secondary small mt-2">Loading tasks securely...</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 shadow-sm id-task-list-empty" id="task-list-empty-card">
        <div className="d-inline-flex p-3 bg-light rounded-circle text-muted mb-3">
          <ClipboardCopy size={36} />
        </div>
        <h5 className="fw-bold text-dark mb-1">No tasks catalogued</h5>
        <p className="text-muted small mb-0 px-3">Try introducing a new task using the submission form on the left.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3" id="task-list-container">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          id={`task-item-${task.id}`}
          className="card shadow-sm border-0 rounded-4 p-4 text-start transition-all duration-300 hover:shadow-md bg-white border-start border-4"
          style={{
            borderLeftColor: task.status === "COMPLETED" ? "#198754" : task.status === "IN_PROGRESS" ? "#ffc107" : "#6c757d"
          }}
        >
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3">
            
            {/* Title & Description Column */}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{task.title}</h5>
                {getStatusBadge(task.status)}
              </div>
              
              <p className="text-muted small mb-3 text-break" style={{ lineHeight: "1.5" }}>
                {task.description || <span className="fst-italic text-secondary">No description supplied.</span>}
              </p>

              {/* Created and Due Date Footer metrics */}
              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small" style={{ fontSize: "0.75rem" }}>
                <span className="d-flex align-items-center gap-1">
                  <Calendar size={13} />
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </span>
                
                {task.dueDate && (
                  <span className="d-flex align-items-center gap-1 font-semibold text-dark">
                    <ClipboardCheck size={13} className="text-primary" />
                    <span>Due Date: {new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons Column */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0 align-self-sm-center">
              
              {/* Status toggler */}
              <button
                type="button"
                className="btn btn-light btn-sm text-secondary d-flex align-items-center justify-content-center p-2 rounded-3 border-0 shadow-sm"
                onClick={() => {
                  const nextStatus = task.status === "PENDING" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "COMPLETED" : "PENDING";
                  onStatusToggle(task.id, nextStatus);
                }}
                title="Change task status"
                style={{ width: "34px", height: "34px" }}
              >
                <RefreshCw size={14} />
              </button>

              {/* Edit selector */}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center p-2 rounded-3 shadow-sm border-light"
                onClick={() => onEditSelect(task)}
                title="Modify Task Details"
                style={{ width: "34px", height: "34px" }}
              >
                <Edit2 size={14} />
              </button>

              {/* Delete trigger */}
              <button
                type="button"
                className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center p-2 rounded-3 shadow-sm border-light"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    onTaskDelete(task.id);
                  }
                }}
                title="Delete Task"
                style={{ width: "34px", height: "34px" }}
              >
                <Trash2 size={14} />
              </button>

            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
