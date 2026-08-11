export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  managerId: string;
  manager: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  members: ProjectMember[];
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  createdById: string;
  project: { id: string; name: string; managerId?: string };
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginatedMeta;
  message?: string;
  details?: unknown;
}

export interface DashboardData {
  stats: {
    projects: number;
    tasks: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  myTasks: Task[];
  permissions: string[];
  role: Role;
}
