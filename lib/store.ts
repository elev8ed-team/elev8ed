// ==============================================================================
// ELEV8ED PERSISTENT APPLICATION & DOMAIN STORE
// Provides robust, reactive, multi-tenant state management with LocalStorage & Supabase hooks
// ==============================================================================

import { useSyncExternalStore } from "react"
import {
  UserProfile,
  Committee,
  Department,
  CommitteeMember,
  Task,
  CommitteeEvent,
  Announcement,
  Invitation,
  ActivityLog,
  TaskStatus,
  UserRole,
} from "./types"

const STORAGE_KEY = "elev8ed_store_v1"

// ------------------------------------------------------------------------------
// DEFAULT SEED DATA (Realistic College Committees)
// ------------------------------------------------------------------------------

const SEED_USER: UserProfile = {
  id: "usr_nevedhya",
  fullName: "Nevedhya",
  email: "nevedhya@elev8ed.edu",
  college: "Apex Institute of Technology",
  course: "Computer Science & Engineering",
  year: "3rd Year",
  bio: "Lead developer and student committee chairperson passionate about clean systems and automation.",
  skills: ["Next.js", "TypeScript", "Event Operations", "UI/UX Architecture"],
  createdAt: "2026-01-10T00:00:00Z",
}

const SEED_COMMITTEES: Committee[] = [
  {
    id: "comm_acm",
    name: "ACM Student Chapter",
    slug: "acm-student-chapter",
    description: "Premier collegiate computing society fostering research, coding hackathons, and industry mentorship.",
    college: "Apex Institute of Technology",
    category: "Technical",
    academicYear: "2026-2027",
    createdBy: "usr_nevedhya",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "comm_cultural",
    name: "Cultural Affairs Council",
    slug: "cultural-affairs-council",
    description: "Central executive body coordinating college flagship fests, music ensembles, and stage productions.",
    college: "Apex Institute of Technology",
    category: "Cultural & Arts",
    academicYear: "2026-2027",
    createdBy: "usr_dhruv",
    createdAt: "2026-02-15T12:00:00Z",
  },
]

const SEED_DEPARTMENTS: Department[] = [
  // ACM Departments
  { id: "dept_acm_tech", committeeId: "comm_acm", name: "Technical", description: "Hackathons, web development, and cloud infra.", headId: "usr_nevedhya", createdAt: "2026-02-01T10:00:00Z" },
  { id: "dept_acm_design", committeeId: "comm_acm", name: "Design & Creatives", description: "UI/UX, visual identity, branding, and motion graphics.", headId: "usr_priya", createdAt: "2026-02-01T10:00:00Z" },
  { id: "dept_acm_pr", committeeId: "comm_acm", name: "Public Relations", description: "Social media, campus outreach, and community engagement.", headId: "usr_rahul", createdAt: "2026-02-01T10:00:00Z" },
  { id: "dept_acm_logistics", committeeId: "comm_acm", name: "Logistics & Operations", description: "Venue bookings, audio/video, hardware, and hospitality.", headId: "usr_arjun", createdAt: "2026-02-01T10:00:00Z" },
  { id: "dept_acm_spons", committeeId: "comm_acm", name: "Sponsorship & Finance", description: "Corporate partnerships, prize pools, and budgeting.", headId: "usr_ananya", createdAt: "2026-02-01T10:00:00Z" },

  // Cultural Council Departments
  { id: "dept_cult_music", committeeId: "comm_cultural", name: "Music & Audio", description: "Band competitions, acoustic nights, sound gear.", headId: "usr_nevedhya", createdAt: "2026-02-15T12:00:00Z" },
  { id: "dept_cult_dramatics", committeeId: "comm_cultural", name: "Dramatics & Theater", description: "Street plays, stage drama, and scriptwriting.", headId: "usr_dhruv", createdAt: "2026-02-15T12:00:00Z" },
  { id: "dept_cult_media", committeeId: "comm_cultural", name: "Media & Coverage", description: "Photography, live streaming, aftermovies.", headId: "usr_arjun", createdAt: "2026-02-15T12:00:00Z" },
]

const SEED_MEMBERS: CommitteeMember[] = [
  // ACM Members
  {
    id: "mem_acm_1",
    committeeId: "comm_acm",
    userId: "usr_nevedhya",
    departmentId: "dept_acm_tech",
    departmentName: "Technical",
    role: "owner",
    title: "Chairperson",
    status: "active",
    joinedAt: "2026-02-01T10:00:00Z",
    user: SEED_USER,
  },
  {
    id: "mem_acm_2",
    committeeId: "comm_acm",
    userId: "usr_dhruv",
    departmentId: "dept_acm_tech",
    departmentName: "Technical",
    role: "admin",
    title: "Vice Chairperson",
    status: "active",
    joinedAt: "2026-02-01T10:30:00Z",
    user: {
      id: "usr_dhruv",
      fullName: "Dhruv",
      email: "dhruv@elev8ed.edu",
      college: "Apex Institute of Technology",
      course: "Computer Science",
      year: "3rd Year",
      bio: "Systems architect and technical coordinator.",
      createdAt: "2026-01-15T00:00:00Z",
    },
  },
  {
    id: "mem_acm_3",
    committeeId: "comm_acm",
    userId: "usr_priya",
    departmentId: "dept_acm_design",
    departmentName: "Design & Creatives",
    role: "head",
    title: "Design Head",
    status: "active",
    joinedAt: "2026-02-02T11:00:00Z",
    user: {
      id: "usr_priya",
      fullName: "Priya Sharma",
      email: "priya.sharma@apex.edu",
      college: "Apex Institute of Technology",
      course: "Information Technology",
      year: "2nd Year",
      bio: "Product designer and design systems lead.",
      createdAt: "2026-01-20T00:00:00Z",
    },
  },
  {
    id: "mem_acm_4",
    committeeId: "comm_acm",
    userId: "usr_rahul",
    departmentId: "dept_acm_pr",
    departmentName: "Public Relations",
    role: "head",
    title: "PR Head",
    status: "active",
    joinedAt: "2026-02-03T14:00:00Z",
    user: {
      id: "usr_rahul",
      fullName: "Rahul Verma",
      email: "rahul.verma@apex.edu",
      college: "Apex Institute of Technology",
      course: "Electronics Engineering",
      year: "3rd Year",
      bio: "Community builder and public outreach manager.",
      createdAt: "2026-01-22T00:00:00Z",
    },
  },
  {
    id: "mem_acm_5",
    committeeId: "comm_acm",
    userId: "usr_arjun",
    departmentId: "dept_acm_logistics",
    departmentName: "Logistics & Operations",
    role: "member",
    title: "Logistics Executive",
    status: "active",
    joinedAt: "2026-02-04T09:00:00Z",
    user: {
      id: "usr_arjun",
      fullName: "Arjun Nair",
      email: "arjun.nair@apex.edu",
      college: "Apex Institute of Technology",
      course: "Mechanical Engineering",
      year: "2nd Year",
      bio: "Operations lead and event planner.",
      createdAt: "2026-01-25T00:00:00Z",
    },
  },

  // Cultural Council Members (Shows Nevedhya having a different role here: Head of Music!)
  {
    id: "mem_cult_1",
    committeeId: "comm_cultural",
    userId: "usr_dhruv",
    departmentId: "dept_cult_dramatics",
    departmentName: "Dramatics & Theater",
    role: "owner",
    title: "President",
    status: "active",
    joinedAt: "2026-02-15T12:00:00Z",
    user: {
      id: "usr_dhruv",
      fullName: "Dhruv",
      email: "dhruv@elev8ed.edu",
      college: "Apex Institute of Technology",
      course: "Computer Science",
      year: "3rd Year",
      bio: "Systems architect and technical coordinator.",
      createdAt: "2026-01-15T00:00:00Z",
    },
  },
  {
    id: "mem_cult_2",
    committeeId: "comm_cultural",
    userId: "usr_nevedhya",
    departmentId: "dept_cult_music",
    departmentName: "Music & Audio",
    role: "head",
    title: "Head of Music",
    status: "active",
    joinedAt: "2026-02-16T14:00:00Z",
    user: SEED_USER,
  },
]

const SEED_TASKS: Task[] = [
  {
    id: "tsk_1",
    committeeId: "comm_acm",
    departmentId: "dept_acm_tech",
    departmentName: "Technical",
    title: "Deploy Hackathon Registration Portal",
    description: "Finalize Next.js portal with Supabase auth and QR code verification pass.",
    assignedTo: "usr_nevedhya",
    createdBy: "usr_dhruv",
    priority: "urgent",
    status: "in_progress",
    dueDate: "2026-03-25",
    createdAt: "2026-02-10T10:00:00Z",
    assignee: SEED_USER,
  },
  {
    id: "tsk_2",
    committeeId: "comm_acm",
    departmentId: "dept_acm_design",
    departmentName: "Design & Creatives",
    title: "Design Instagram Carousels for Speaker Series",
    description: "Create 4 dark-themed announcement slides following brand guidelines.",
    assignedTo: "usr_priya",
    createdBy: "usr_nevedhya",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-03-22",
    createdAt: "2026-02-12T11:00:00Z",
  },
  {
    id: "tsk_3",
    committeeId: "comm_acm",
    departmentId: "dept_acm_logistics",
    departmentName: "Logistics & Operations",
    title: "Reserve Main Auditorium and A/V Equipment",
    description: "Secure permission slips and request 4 lapel mics + HDMI switchers.",
    assignedTo: "usr_arjun",
    createdBy: "usr_dhruv",
    priority: "medium",
    status: "completed",
    dueDate: "2026-03-18",
    createdAt: "2026-02-08T09:00:00Z",
    completedAt: "2026-02-17T15:00:00Z",
  },
  {
    id: "tsk_4",
    committeeId: "comm_acm",
    departmentId: "dept_acm_pr",
    departmentName: "Public Relations",
    title: "Send WhatsApp Blast to Class Representatives",
    description: "Distribute registration link and dates to 1st and 2nd year CRs.",
    assignedTo: "usr_rahul",
    createdBy: "usr_nevedhya",
    priority: "high",
    status: "todo",
    dueDate: "2026-03-28",
    createdAt: "2026-02-15T16:00:00Z",
  },

  // Cultural Task
  {
    id: "tsk_5",
    committeeId: "comm_cultural",
    departmentId: "dept_cult_music",
    departmentName: "Music & Audio",
    title: "Soundcheck Gear for Annual Fest Opening",
    description: "Test guitar amps, drum monitors, and multi-channel snake box.",
    assignedTo: "usr_nevedhya",
    createdBy: "usr_dhruv",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-04-05",
    createdAt: "2026-02-18T10:00:00Z",
    assignee: SEED_USER,
  },
]

const SEED_EVENTS: CommitteeEvent[] = [
  {
    id: "evt_1",
    committeeId: "comm_acm",
    departmentId: "dept_acm_tech",
    departmentName: "Technical",
    title: "CodeMatrix 2026: 24-Hour Campus Hackathon",
    description: "Flagship annual software hackathon with web3, AI, and mobile tracks. Cash prizes of $2,000.",
    startTime: "2026-04-10T09:00:00Z",
    endTime: "2026-04-11T12:00:00Z",
    venue: "Main Campus Library Auditorium",
    status: "upcoming",
    createdBy: "usr_nevedhya",
    createdAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "evt_2",
    committeeId: "comm_acm",
    departmentId: "dept_acm_design",
    departmentName: "Design & Creatives",
    title: "Figma to Code: Design Systems Workshop",
    description: "Hands-on UI engineering workshop on tokens, autolayout, and shadcn styling.",
    startTime: "2026-03-28T16:00:00Z",
    endTime: "2026-03-28T18:30:00Z",
    venue: "Lab 302, Computing Block",
    status: "upcoming",
    createdBy: "usr_priya",
    createdAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "evt_3",
    committeeId: "comm_cultural",
    departmentId: "dept_cult_music",
    departmentName: "Music & Audio",
    title: "Acoustic Unplugged Evening",
    description: "Open mic and live acoustic band showcase for student songwriters.",
    startTime: "2026-04-02T18:00:00Z",
    endTime: "2026-04-02T21:00:00Z",
    venue: "Amphitheatre Stage",
    status: "upcoming",
    createdBy: "usr_nevedhya",
    createdAt: "2026-02-18T12:00:00Z",
  },
]

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_1",
    committeeId: "comm_acm",
    title: "Mandatory Core Team Sync this Wednesday",
    content: "All department heads must prepare their Q1 budget projections and volunteer rosters for CodeMatrix review.",
    authorId: "usr_nevedhya",
    authorName: "Nevedhya (Chairperson)",
    priority: "urgent",
    audience: "all",
    createdAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "ann_2",
    committeeId: "comm_acm",
    departmentId: "dept_acm_tech",
    departmentName: "Technical",
    title: "Git Repository Standards & PR Template",
    content: "Please ensure all hackathon PRs have descriptive titles and pass TypeScript strict checks before merging.",
    authorId: "usr_dhruv",
    authorName: "Dhruv (Vice Chair)",
    priority: "normal",
    audience: "department",
    createdAt: "2026-02-15T11:00:00Z",
  },
]

const SEED_INVITATIONS: Invitation[] = [
  {
    id: "inv_1",
    committeeId: "comm_acm",
    committeeName: "ACM Student Chapter",
    departmentId: "dept_acm_tech",
    departmentName: "Technical",
    role: "member",
    token: "E8-ACM-2026",
    status: "pending",
    invitedBy: "usr_nevedhya",
    createdAt: "2026-02-10T10:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    id: "inv_2",
    committeeId: "comm_cultural",
    committeeName: "Cultural Affairs Council",
    departmentId: "dept_cult_music",
    departmentName: "Music & Audio",
    role: "member",
    token: "E8-CULT-2026",
    status: "pending",
    invitedBy: "usr_dhruv",
    createdAt: "2026-02-15T12:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
  },
]

const SEED_ACTIVITY: ActivityLog[] = [
  {
    id: "act_1",
    committeeId: "comm_acm",
    actorId: "usr_nevedhya",
    actorName: "Nevedhya",
    action: "posted announcement",
    entityType: "announcement",
    entityTitle: "Mandatory Core Team Sync this Wednesday",
    createdAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "act_2",
    committeeId: "comm_acm",
    actorId: "usr_arjun",
    actorName: "Arjun Nair",
    action: "completed task",
    entityType: "task",
    entityTitle: "Reserve Main Auditorium and A/V Equipment",
    createdAt: "2026-02-17T15:00:00Z",
  },
  {
    id: "act_3",
    committeeId: "comm_acm",
    actorId: "usr_nevedhya",
    actorName: "Nevedhya",
    action: "assigned task to Priya Sharma",
    entityType: "task",
    entityTitle: "Design Instagram Carousels for Speaker Series",
    createdAt: "2026-02-12T11:00:00Z",
  },
  {
    id: "act_4",
    committeeId: "comm_acm",
    actorId: "usr_dhruv",
    actorName: "Dhruv",
    action: "scheduled event",
    entityType: "event",
    entityTitle: "CodeMatrix 2026: 24-Hour Campus Hackathon",
    createdAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "act_5",
    committeeId: "comm_acm",
    actorId: "usr_nevedhya",
    actorName: "Nevedhya",
    action: "created committee workspace",
    entityType: "committee",
    entityTitle: "ACM Student Chapter",
    createdAt: "2026-02-01T10:00:00Z",
  },
]

export interface StoreState {
  currentUser: UserProfile
  committees: Committee[]
  departments: Department[]
  members: CommitteeMember[]
  tasks: Task[]
  events: CommitteeEvent[]
  announcements: Announcement[]
  invitations: Invitation[]
  activityLogs: ActivityLog[]
}

// ------------------------------------------------------------------------------
// ELEV8ED DATA STORE CLASS
// ------------------------------------------------------------------------------

class Elev8edStore {
  private state: StoreState
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.state = this.loadInitialState()
  }

  private loadInitialState(): StoreState {
    if (typeof window === "undefined") {
      return {
        currentUser: SEED_USER,
        committees: SEED_COMMITTEES,
        departments: SEED_DEPARTMENTS,
        members: SEED_MEMBERS,
        tasks: SEED_TASKS,
        events: SEED_EVENTS,
        announcements: SEED_ANNOUNCEMENTS,
        invitations: SEED_INVITATIONS,
        activityLogs: SEED_ACTIVITY,
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e)
    }

    const defaultState: StoreState = {
      currentUser: SEED_USER,
      committees: SEED_COMMITTEES,
      departments: SEED_DEPARTMENTS,
      members: SEED_MEMBERS,
      tasks: SEED_TASKS,
      events: SEED_EVENTS,
      announcements: SEED_ANNOUNCEMENTS,
      invitations: SEED_INVITATIONS,
      activityLogs: SEED_ACTIVITY,
    }
    this.saveState(defaultState)
    return defaultState
  }

  private saveState(newState: StoreState) {
    this.state = newState
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      } catch (e) {
        console.error("Failed to persist state", e)
      }
    }
    this.notify()
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getState(): StoreState {
    return this.state
  }

  // --- Current User ---
  public getCurrentUser(): UserProfile {
    return this.state.currentUser
  }

  public updateCurrentUser(updates: Partial<UserProfile>): UserProfile {
    const updated = { ...this.state.currentUser, ...updates }
    this.saveState({
      ...this.state,
      currentUser: updated,
    })
    return updated
  }

  // --- Committees ---
  public getCommittees(): Committee[] {
    return this.state.committees
  }

  public getUserCommittees(userId: string = this.state.currentUser.id): Committee[] {
    const userCommitteeIds = this.state.members
      .filter((m) => m.userId === userId && m.status === "active")
      .map((m) => m.committeeId)
    return this.state.committees.filter((c) => userCommitteeIds.includes(c.id))
  }

  public getCommittee(id: string): Committee | undefined {
    return this.state.committees.find((c) => c.id === id)
  }

  public createCommittee(params: {
    name: string
    description?: string
    college: string
    category?: string
    academicYear?: string
    departmentNames: string[]
    founderRole?: UserRole
  }): Committee {
    const committeeId = `comm_${Date.now()}`
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    
    const newCommittee: Committee = {
      id: committeeId,
      name: params.name,
      slug,
      description: params.description || `Official workspace for ${params.name}`,
      college: params.college,
      category: params.category || "Student Organization",
      academicYear: params.academicYear || "2026-2027",
      createdBy: this.state.currentUser.id,
      createdAt: new Date().toISOString(),
    }

    // Provision departments
    const createdDepts: Department[] = params.departmentNames.map((name, index) => ({
      id: `dept_${committeeId}_${index}`,
      committeeId,
      name,
      createdAt: new Date().toISOString(),
    }))

    // Add current user as Founder / Owner
    const founderMember: CommitteeMember = {
      id: `mem_${committeeId}_founder`,
      committeeId,
      userId: this.state.currentUser.id,
      departmentId: createdDepts[0]?.id,
      departmentName: createdDepts[0]?.name,
      role: params.founderRole || "owner",
      title: params.founderRole === "owner" ? "Chairperson" : "Lead",
      status: "active",
      joinedAt: new Date().toISOString(),
      user: this.state.currentUser,
    }

    // Default invitation token for this committee
    const defaultInvite: Invitation = {
      id: `inv_${Date.now()}`,
      committeeId,
      committeeName: newCommittee.name,
      token: `E8-${newCommittee.name.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      role: "member",
      status: "pending",
      invitedBy: this.state.currentUser.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    }

    // Log Activity
    const creationLog: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: "provisioned new committee workspace",
      entityType: "committee",
      entityTitle: newCommittee.name,
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      committees: [newCommittee, ...this.state.committees],
      departments: [...this.state.departments, ...createdDepts],
      members: [...this.state.members, founderMember],
      invitations: [...this.state.invitations, defaultInvite],
      activityLogs: [creationLog, ...this.state.activityLogs],
    })

    return newCommittee
  }

  public updateCommittee(committeeId: string, updates: Partial<Committee>) {
    this.saveState({
      ...this.state,
      committees: this.state.committees.map((c) =>
        c.id === committeeId ? { ...c, ...updates } : c
      ),
    })
  }

  public deleteCommittee(committeeId: string) {
    this.saveState({
      ...this.state,
      committees: this.state.committees.filter((c) => c.id !== committeeId),
      departments: this.state.departments.filter((d) => d.committeeId !== committeeId),
      members: this.state.members.filter((m) => m.committeeId !== committeeId),
      tasks: this.state.tasks.filter((t) => t.committeeId !== committeeId),
      events: this.state.events.filter((e) => e.committeeId !== committeeId),
      announcements: this.state.announcements.filter((a) => a.committeeId !== committeeId),
    })
  }

  // --- Departments ---
  public getDepartments(committeeId: string): Department[] {
    return this.state.departments.filter((d) => d.committeeId === committeeId)
  }

  public createDepartment(committeeId: string, name: string, description?: string, headId?: string): Department {
    const newDept: Department = {
      id: `dept_${committeeId}_${Date.now()}`,
      committeeId,
      name,
      description,
      headId,
      createdAt: new Date().toISOString(),
    }

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: "created department",
      entityType: "department",
      entityTitle: name,
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      departments: [...this.state.departments, newDept],
      activityLogs: [log, ...this.state.activityLogs],
    })

    return newDept
  }

  public deleteDepartment(departmentId: string) {
    const dept = this.state.departments.find((d) => d.id === departmentId)
    if (!dept) return

    this.saveState({
      ...this.state,
      departments: this.state.departments.filter((d) => d.id !== departmentId),
      // remove department from members
      members: this.state.members.map((m) =>
        m.departmentId === departmentId ? { ...m, departmentId: undefined, departmentName: undefined } : m
      ),
    })
  }

  // --- Members ---
  public getMembers(committeeId: string): CommitteeMember[] {
    return this.state.members.filter((m) => m.committeeId === committeeId)
  }

  public getUserMembership(committeeId: string, userId: string = this.state.currentUser.id): CommitteeMember | undefined {
    return this.state.members.find((m) => m.committeeId === committeeId && m.userId === userId)
  }

  public inviteMember(params: {
    committeeId: string
    fullName: string
    email: string
    departmentId?: string
    role: UserRole
    title?: string
  }): CommitteeMember {
    const committee = this.getCommittee(params.committeeId)
    const department = this.state.departments.find((d) => d.id === params.departmentId)
    const newUserId = `usr_${Date.now()}`

    const newUserProfile: UserProfile = {
      id: newUserId,
      fullName: params.fullName,
      email: params.email,
      college: committee?.college,
      createdAt: new Date().toISOString(),
    }

    const newMember: CommitteeMember = {
      id: `mem_${Date.now()}`,
      committeeId: params.committeeId,
      userId: newUserId,
      departmentId: params.departmentId,
      departmentName: department?.name,
      role: params.role,
      title: params.title || (params.role === "head" ? "Department Head" : "Member"),
      status: "active",
      joinedAt: new Date().toISOString(),
      user: newUserProfile,
    }

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId: params.committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: `onboarded new member (${params.fullName}) to`,
      entityType: "member",
      entityTitle: department?.name || "General Roster",
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      members: [...this.state.members, newMember],
      activityLogs: [log, ...this.state.activityLogs],
    })

    return newMember
  }

  public removeMember(committeeId: string, memberId: string) {
    const member = this.state.members.find((m) => m.id === memberId)
    this.saveState({
      ...this.state,
      members: this.state.members.filter((m) => m.id !== memberId),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          committeeId,
          actorId: this.state.currentUser.id,
          actorName: this.state.currentUser.fullName,
          action: `removed member ${member?.user.fullName} from committee`,
          entityType: "member",
          entityTitle: member?.user.fullName || "Member",
          createdAt: new Date().toISOString(),
        },
        ...this.state.activityLogs,
      ],
    })
  }

  public updateMemberRole(committeeId: string, memberId: string, newRole: UserRole) {
    this.saveState({
      ...this.state,
      members: this.state.members.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      ),
    })
  }

  // --- Tasks ---
  public getTasks(committeeId: string): Task[] {
    return this.state.tasks.filter((t) => t.committeeId === committeeId)
  }

  public createTask(params: {
    committeeId: string
    departmentId?: string
    title: string
    description?: string
    assignedTo?: string
    priority: Task["priority"]
    dueDate?: string
  }): Task {
    const department = this.state.departments.find((d) => d.id === params.departmentId)
    const assigneeMember = this.state.members.find((m) => m.userId === params.assignedTo)

    const newTask: Task = {
      id: `tsk_${Date.now()}`,
      committeeId: params.committeeId,
      departmentId: params.departmentId,
      departmentName: department?.name,
      title: params.title,
      description: params.description,
      assignedTo: params.assignedTo,
      createdBy: this.state.currentUser.id,
      priority: params.priority,
      status: "todo",
      dueDate: params.dueDate,
      createdAt: new Date().toISOString(),
      assignee: assigneeMember?.user,
    }

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId: params.committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: `created task`,
      entityType: "task",
      entityTitle: params.title,
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      tasks: [newTask, ...this.state.tasks],
      activityLogs: [log, ...this.state.activityLogs],
    })

    return newTask
  }

  public updateTaskStatus(taskId: string, status: TaskStatus) {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (!task) return

    const isNowCompleted = status === "completed"

    const updatedTasks = this.state.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          }
        : t
    )

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId: task.committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: isNowCompleted ? "completed task" : `moved task to ${status.replace("_", " ")}`,
      entityType: "task",
      entityTitle: task.title,
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      tasks: updatedTasks,
      activityLogs: [log, ...this.state.activityLogs],
    })
  }

  public deleteTask(taskId: string) {
    this.saveState({
      ...this.state,
      tasks: this.state.tasks.filter((t) => t.id !== taskId),
    })
  }

  // --- Events ---
  public getEvents(committeeId: string): CommitteeEvent[] {
    return this.state.events.filter((e) => e.committeeId === committeeId)
  }

  public createEvent(params: {
    committeeId: string
    departmentId?: string
    title: string
    description?: string
    startTime: string
    endTime: string
    venue: string
  }): CommitteeEvent {
    const department = this.state.departments.find((d) => d.id === params.departmentId)
    const newEvent: CommitteeEvent = {
      id: `evt_${Date.now()}`,
      committeeId: params.committeeId,
      departmentId: params.departmentId,
      departmentName: department?.name,
      title: params.title,
      description: params.description,
      startTime: params.startTime,
      endTime: params.endTime,
      venue: params.venue,
      status: "upcoming",
      createdBy: this.state.currentUser.id,
      createdAt: new Date().toISOString(),
    }

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId: params.committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: "scheduled event",
      entityType: "event",
      entityTitle: params.title,
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      events: [newEvent, ...this.state.events],
      activityLogs: [log, ...this.state.activityLogs],
    })

    return newEvent
  }

  // --- Announcements ---
  public getAnnouncements(committeeId: string): Announcement[] {
    return this.state.announcements.filter((a) => a.committeeId === committeeId)
  }

  public createAnnouncement(params: {
    committeeId: string
    departmentId?: string
    title: string
    content: string
    priority: Announcement["priority"]
    audience: Announcement["audience"]
  }): Announcement {
    const department = this.state.departments.find((d) => d.id === params.departmentId)
    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      committeeId: params.committeeId,
      departmentId: params.departmentId,
      departmentName: department?.name,
      title: params.title,
      content: params.content,
      authorId: this.state.currentUser.id,
      authorName: `${this.state.currentUser.fullName}`,
      priority: params.priority,
      audience: params.audience,
      createdAt: new Date().toISOString(),
    }

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      committeeId: params.committeeId,
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action: "published announcement",
      entityType: "announcement",
      entityTitle: params.title,
      createdAt: new Date().toISOString(),
    }

    this.saveState({
      ...this.state,
      announcements: [newAnnouncement, ...this.state.announcements],
      activityLogs: [log, ...this.state.activityLogs],
    })

    return newAnnouncement
  }

  // --- Activity Logs ---
  public getActivityLogs(committeeId: string): ActivityLog[] {
    return this.state.activityLogs.filter((a) => a.committeeId === committeeId)
  }

  // --- Invitations & Tokens ---
  public getInvitations(committeeId: string): Invitation[] {
    return this.state.invitations.filter((i) => i.committeeId === committeeId)
  }

  public validateInvitationToken(tokenStr: string): Invitation | undefined {
    const clean = tokenStr.trim().toUpperCase()
    return this.state.invitations.find((i) => i.token.toUpperCase() === clean && i.status === "pending")
  }

  public acceptInvitation(tokenStr: string): Committee | undefined {
    const invite = this.validateInvitationToken(tokenStr)
    if (!invite) return undefined

    const committee = this.getCommittee(invite.committeeId)
    if (!committee) return undefined

    // Add current user to this committee if not already member
    const existing = this.getUserMembership(committee.id, this.state.currentUser.id)
    if (!existing) {
      const newMember: CommitteeMember = {
        id: `mem_${Date.now()}`,
        committeeId: committee.id,
        userId: this.state.currentUser.id,
        departmentId: invite.departmentId,
        departmentName: invite.departmentName,
        role: invite.role,
        title: invite.role === "head" ? "Department Head" : "Member",
        status: "active",
        joinedAt: new Date().toISOString(),
        user: this.state.currentUser,
      }

      const log: ActivityLog = {
        id: `act_${Date.now()}`,
        committeeId: committee.id,
        actorId: this.state.currentUser.id,
        actorName: this.state.currentUser.fullName,
        action: "joined committee via invitation token",
        entityType: "member",
        entityTitle: this.state.currentUser.fullName,
        createdAt: new Date().toISOString(),
      }

      this.saveState({
        ...this.state,
        members: [...this.state.members, newMember],
        activityLogs: [log, ...this.state.activityLogs],
      })
    }

    return committee
  }
}

// Global Singleton Instance
export const store = new Elev8edStore()

export function useStoreState(): StoreState {
  return useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => store.getState(),
    () => store.getState()
  )
}
