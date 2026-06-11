import { useState, useEffect } from "react";
import axios from "axios";
import { Search, PlusCircle, CheckCircle, Clock, CalendarDays, Loader2, ListTodo } from "lucide-react";
import { Task, TaskStatus } from "../types";
import Navbar from "../components/Navbar";
import AddTaskForm from "../components/AddTaskForm";
import EditTaskForm from "../components/EditTaskForm";
import TaskList from "../components/TaskList";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "";

  // Fetch initial tasks belonging to user
  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err: any) {
      setError("Failed to coordinate and retrieve task cards. Please sign in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter and search computation
  useEffect(() => {
    let result = [...tasks];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    setFilteredTasks(result);
  }, [tasks, statusFilter, searchQuery]);

  // CRUD Handler - Create Task
  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };

  // CRUD Handler - Update Task
  const handleTaskUpdated = async (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
  };

  // CRUD Handler - Delete Task
  const handleTaskDelete = async (taskId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== taskId));
      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
    } catch (err: any) {
      alert("Failed to delete task. Make sure you possess adequate user tokens.");
    }
  };

  // CRUD Handler - Toggle Status
  const handleStatusToggle = async (taskId: number, nextStatus: TaskStatus) => {
    try {
      const token = localStorage.getItem("token");
      const targetTask = tasks.find((t) => t.id === taskId);
      if (!targetTask) return;

      const res = await axios.put(
        `/api/tasks/${taskId}`,
        {
          ...targetTask,
          status: nextStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
      
      // Sync editing form if open
      if (editingTask?.id === taskId) {
        setEditingTask(res.data);
      }
    } catch (err: any) {
      alert("Failed to alter status. Make sure context and validations hold.");
    }
  };

  // Metrics computation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").bind ? tasks.filter((t) => t.status === "COMPLETED").length : tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const progressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="container-fluid min-vh-100 bg-light py-4 px-3 px-md-5" id="dashboard-container">
      
      {/* Navigation bar containing context metrics and WebSocket information */}
      <Navbar
        userName={userName}
        userEmail={userEmail}
        totalCount={totalCount}
        completedCount={completedCount}
      />

      {/* Analytical Metric Cards Grid */}
      <div className="row g-3 mb-4 text-start">
        
        {/* Total Tasks metric card */}
        <div className="col-12 col-sm-6 col-lg-3" id="metric-card-total">
          <div className="card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold">Total Tasks</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{totalCount}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                <ListTodo size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks metric card */}
        <div className="col-12 col-sm-6 col-lg-3" id="metric-card-pending">
          <div className="card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold">Pending</span>
                <h3 className="fw-bold text-secondary mt-1 mb-0">{pendingCount}</h3>
              </div>
              <div className="bg-secondary bg-opacity-10 text-secondary p-3 rounded-3">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* In Progress Tasks metric card */}
        <div className="col-12 col-sm-6 col-lg-3" id="metric-card-inprogress">
          <div className="card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold">In Progress</span>
                <h3 className="fw-bold text-warning mt-1 mb-0">{progressCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-3">
                <CalendarDays size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tasks metric card */}
        <div className="col-12 col-sm-6 col-lg-3" id="metric-card-completed">
          <div className="card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold">Completed</span>
                <h3 className="fw-bold text-success mt-1 mb-0">{completedCount}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-3">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Board Section: Left form panel, Right task details list panel */}
      <div className="row g-4 text-start">
        
        {/* Left Side Form Column (Add Task / Edit Task) */}
        <div className="col-12 col-lg-4" id="form-column">
          <div className="position-sticky" style={{ top: "24px" }}>
            {editingTask ? (
              <EditTaskForm
                task={editingTask}
                onTaskUpdated={handleTaskUpdated}
                onCancel={() => setEditingTask(null)}
              />
            ) : (
              <AddTaskForm onTaskCreated={handleTaskCreated} />
            )}
          </div>
        </div>

        {/* Right Side Task Manager queue with Search filters */}
        <div className="col-12 col-lg-8" id="queue-column">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
            
            {/* Direct Filters Toolbar */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 pb-3 border-bottom border-light">
              
              {/* Category selector pills */}
              <div className="d-flex flex-wrap gap-2" id="status-filters-toolbar">
                {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((status) => (
                  <button
                    key={status}
                    id={`filter-pill-${status.toLowerCase()}`}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold border-0 ${
                      statusFilter === status
                        ? "btn-primary shadow-sm text-white"
                        : "btn-light text-secondary"
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Sub search input bar */}
              <div className="input-group" style={{ maxWidth: "300px" }}>
                <span className="input-group-text bg-light border-0 text-secondary">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  id="dashboard-search-input"
                  className="form-control bg-light border-0 ps-0 text-sm"
                  placeholder="Query titles or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

            </div>

            {/* Render error notification */}
            {error && (
              <div className="alert alert-danger py-2.5 px-3 mb-3 small rounded-3" role="alert" id="dashboard-error-alert">
                {error}
              </div>
            )}

            {/* Task card list queue */}
            <TaskList
              tasks={filteredTasks}
              onEditSelect={(t) => setEditingTask(t)}
              onTaskDelete={handleTaskDelete}
              onStatusToggle={handleStatusToggle}
              loading={loading}
            />

          </div>
        </div>

      </div>

    </div>
  );
}
