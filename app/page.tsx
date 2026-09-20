import Link from "next/link"

const features = [
  {
    title: "Centralized Workspace",
    description: "Bring communications, onboarding, and coordination into one focused environment.",
    icon: (
      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: "Smart Onboarding",
    description: "Invite new members with structured access, automatic role mapping, and department assignments.",
    icon: (
      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    title: "Multi-Committee Sync",
    description: "Manage multiple college portfolios seamlessly without losing role context or admin permissions.",
    icon: (
      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
      </svg>
    ),
  },
  {
    title: "Structured Hierarchy",
    description: "Define departments, map internal responsibilities, and keep teams running smoothly.",
    icon: (
      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
      </svg>
    ),
  },
]

const upcoming = [
  "Task management & tracking",
  "Attendance & participation tools",
  "Automated certificate engine",
  "Seamless annual handover vaults",
  "Interactive event workflows",
  "AI admin automations",
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background ambient glows */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(57,255,20,0.04),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(120,119,198,0.06),_transparent_25%)]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
            <div>
              <p className="text-sm font-bold tracking-tight">Elev8ed</p>
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                Simplifying College Committee Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-muted-foreground/30">
              ⚡ Built exclusively for college committees
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
                One operating system for college committees.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Stop juggling chaotic chats, links, and documents. Elev8ed centralizes your department structure, member directories, and operational workflows into a single, clean workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started
              </Link>

              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
              >
                Learn more
              </Link>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 transition-all hover:bg-muted/35">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SECURE ACCESS</span>
                <p className="mt-1 text-xs font-medium">Role-aware student onboarding</p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 transition-all hover:bg-muted/35">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">STABLE STRUCTURE</span>
                <p className="mt-1 text-xs font-medium">Clear department roles & hierarchy</p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 transition-all hover:bg-muted/35">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">COORDINATION</span>
                <p className="mt-1 text-xs font-medium">All tasks & members in one place</p>
              </div>
            </div>
          </div>

          {/* Premium UI Mockup / Interactive Component */}
          <div className="relative group">
            <div className="rounded-2xl border border-border/80 bg-card/45 p-5 shadow-2xl transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-[0_0_30px_rgba(57,255,20,0.03)] backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-tight">Elev8ed Workspace</p>
                  <p className="text-[10px] text-muted-foreground">Active Committee Profile</p>
                </div>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20 animate-pulse">
                  v1.0 MVP
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border/40 bg-background/50 p-3.5 transition-all hover:border-primary/20 hover:bg-background/80">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">CORE DIRECTORY</span>
                  <p className="mt-1 text-xs text-foreground">Set up distinct departments and maintain complete operational oversight.</p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/50 p-3.5 transition-all hover:border-primary/20 hover:bg-background/80">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">ROLES & ROSTERS</span>
                  <p className="mt-1 text-xs text-foreground">Assign structural hierarchies and view member portfolios instantly.</p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/50 p-3.5 transition-all hover:border-primary/20 hover:bg-background/80">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">INVITATION FLOWS</span>
                  <p className="mt-1 text-xs text-foreground">Onboard new students effortlessly with structured invitation tokens.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-[10px] text-muted-foreground">
                  <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                    <span className="font-semibold block mb-0.5 text-foreground">Stack</span>
                    Next.js, Tailwind, Supabase
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                    <span className="font-semibold block mb-0.5 text-foreground">Host</span>
                    Deploys directly on Vercel
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing orbs */}
            <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/40 bg-card/30 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/50 hover:-translate-y-1 hover:shadow-lg backdrop-blur"
            >
              <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                {feature.icon}
              </div>
              <h2 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{feature.title}</h2>
              <p className="mt-1.5 text-xs leading-normal text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What Teams Get - Upcoming Pipeline */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-3xl border border-border/40 bg-card/35 p-6 backdrop-blur-sm lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">UPCOMING RELEASES</span>
              <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                A cleaner, smarter blueprint for campus operations.
              </h3>
              <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                Replacing fragmented groups and manual administration with custom tools developed specifically for student organizations.
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row pt-2">
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:scale-[1.02]"
                >
                  Start Now
                </Link>

                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background/50 px-4 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Member login
                </Link>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {upcoming.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/40 p-3 text-xs text-foreground transition-all hover:border-primary/10 hover:bg-background/80"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-[10px] text-muted-foreground lg:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Elev8ed · Co-Founded by Nevedhya & Dhruv</p>
          <p>Built exclusively to modernize student committee architecture.</p>
        </div>
      </footer>
    </main>
  )
}