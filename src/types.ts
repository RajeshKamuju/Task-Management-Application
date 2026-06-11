export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  userId: number;
}

export interface UserSession {
  token: string;
  tokenType: string;
  userId: number;
  userName: string;
  userEmail: string;
}
