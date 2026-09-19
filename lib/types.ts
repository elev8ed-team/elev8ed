// ==============================================================================
// ELEV8ED DOMAIN & DATA TYPES
// ==============================================================================

export type UserRole = "owner" | "admin" | "head" | "member"

export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type EventStatus = "draft" | "upcoming" | "ongoing" | "completed" | "cancelled"
export type AnnouncementPriority = "low" | "normal" | "urgent"
export type AnnouncementAudience = "all" | "department"

export interface UserProfile {
  id: string
  fullName: string
  email: string
  college?: string
  course?: string
  year?: string
  bio?: string
  avatarUrl?: string
  skills?: string[]
  createdAt: string
}

export interface Committee {
  id: string
  name: string
  slug: string
  description: string
  college: string
  category: string
  academicYear: string
  logoUrl?: string
  createdBy: string
  createdAt: string
}

export interface Department {
  id: string
  committeeId: string
  name: string
  description?: string
  headId?: string
  createdAt: string
}

export interface CommitteeMember {
  id: string
  committeeId: string
  userId: string
  departmentId?: string
  role: UserRole
  title: string
  status: "active" | "inactive"
  joinedAt: string
  user: UserProfile
  departmentName?: string
}

export interface Task {
  id: string
  committeeId: string
  departmentId?: string
  title: string
  description?: string
  assignedTo?: string
  createdBy: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  createdAt: string
  completedAt?: string
  assignee?: UserProfile
  departmentName?: string
}

export interface CommitteeEvent {
  id: string
  committeeId: string
  departmentId?: string
  title: string
  description?: string
  startTime: string
  endTime: string
  venue: string
  status: EventStatus
  createdBy: string
  createdAt: string
  departmentName?: string
}

export interface Announcement {
  id: string
  committeeId: string
  departmentId?: string
  title: string
  content: string
  authorId: string
  authorName: string
  priority: AnnouncementPriority
  audience: AnnouncementAudience
  createdAt: string
  departmentName?: string
}

export interface Invitation {
  id: string
  committeeId: string
  committeeName: string
  email?: string
  departmentId?: string
  departmentName?: string
  role: UserRole
  token: string
  status: "pending" | "accepted" | "rejected" | "expired"
  invitedBy: string
  createdAt: string
  expiresAt: string
}

export interface ActivityLog {
  id: string
  committeeId: string
  actorId: string
  actorName: string
  action: string
  entityType: "task" | "member" | "department" | "event" | "announcement" | "committee"
  entityTitle: string
  createdAt: string
}
