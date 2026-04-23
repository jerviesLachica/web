import type { LucideIcon } from "lucide-react"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  BellIcon,
  BoxesIcon,
  CableIcon,
  DatabaseIcon,
  LayoutPanelTopIcon,
  LockKeyholeIcon,
  RadioTowerIcon,
  RouterIcon,
  ScanLineIcon,
  ServerCogIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SmartphoneIcon,
  UsersIcon,
  WavesIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SystemNodeTone = "amber" | "blue" | "emerald" | "violet" | "rose"

type SystemNode = {
  title: string
  subtitle: string
  detail: string
  icon: LucideIcon
  tone: SystemNodeTone
}

type RuntimeFlow = {
  title: string
  description: string
  steps: string[]
}

const toneClasses: Record<SystemNodeTone, string> = {
  amber: "border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]",
  blue: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  rose: "border-rose-400/30 bg-rose-400/10 text-rose-300",
}

const topRow: SystemNode[] = [
  {
    title: "Client interfaces",
    subtitle: "Admin and user pages",
    detail:
      "React Router renders the user shell and admin shell. Screens like Dashboard, Scan, Inventory, Users, Monitoring, and this Flowchart page are all client entry points.",
    icon: LayoutPanelTopIcon,
    tone: "blue",
  },
  {
    title: "State orchestration",
    subtitle: "Zustand stores",
    detail:
      "Auth, inventory, rentals, telemetry, and UI connectivity stores hold live state and distribute updates to every subscribed screen.",
    icon: RouterIcon,
    tone: "violet",
  },
  {
    title: "Service layer",
    subtitle: "Frontend domain logic",
    detail:
      "Firebase service modules translate UI actions into auth calls, Firestore transactions, realtime listeners, reminder scheduling, and code resolution.",
    icon: CableIcon,
    tone: "emerald",
  },
]

const firebaseRow: SystemNode[] = [
  {
    title: "Firebase Auth",
    subtitle: "Identity source",
    detail:
      "Handles registration, sign-in, sign-out, password reset, email verification, and authenticated session tokens used by rules.",
    icon: LockKeyholeIcon,
    tone: "amber",
  },
  {
    title: "Cloud Firestore",
    subtitle: "Operational database",
    detail:
      "Stores users, powerbanks, tags, rentals, settings, and audit logs. All critical business writes flow through here.",
    icon: DatabaseIcon,
    tone: "emerald",
  },
  {
    title: "Realtime Database",
    subtitle: "Telemetry channel",
    detail:
      "Receives live device telemetry such as online status, battery level, firmware version, last events, and last applied commands.",
    icon: RadioTowerIcon,
    tone: "violet",
  },
  {
    title: "Security rules",
    subtitle: "Enforcement layer",
    detail:
      "Firestore rules validate verified email, active user state, ownership checks, admin access, and the exact transaction shape before writes succeed.",
    icon: ShieldCheckIcon,
    tone: "rose",
  },
]

const physicalRow: SystemNode[] = [
  {
    title: "RFID and scan inputs",
    subtitle: "Manual or NFC capture",
    detail:
      "Users start from scan input. Codes are interpreted as powerbank IDs or RFID tags, then resolved into rent or return actions.",
    icon: ScanLineIcon,
    tone: "blue",
  },
  {
    title: "Powerbank devices",
    subtitle: "Physical hardware layer",
    detail:
      "Each device reflects inventory state, receives desiredAction and commandVersion updates, and reports telemetry back into the system.",
    icon: SmartphoneIcon,
    tone: "amber",
  },
  {
    title: "Rental reminder subsystem",
    subtitle: "Browser notification path",
    detail:
      "Reminder preferences and active rental data are combined on the client to schedule due-time notifications for the current user.",
    icon: BellIcon,
    tone: "violet",
  },
]

const runtimeFlows: RuntimeFlow[] = [
  {
    title: "Boot and subscription flow",
    description: "System startup from page load to a hydrated UI.",
    steps: [
      "App starts and checks Firebase environment configuration.",
      "Auth store subscribes to Firebase Auth state changes.",
      "Inventory store subscribes to Firestore powerbanks, tags, and settings.",
      "Protected routes decide whether to show setup, auth pages, user app, or admin app.",
    ],
  },
  {
    title: "Account provisioning flow",
    description: "How a newly registered identity becomes a valid application user.",
    steps: [
      "Register page creates the Firebase Auth account.",
      "ensureUserProfile creates or repairs users/{uid} in Firestore.",
      "Verification email is sent and the auth token must become verified.",
      "After refresh, the user becomes eligible for protected flows enforced by rules.",
    ],
  },
  {
    title: "Rent / return transaction flow",
    description: "Core operational path from scan to committed state.",
    steps: [
      "User scans or enters a code on the Scan page.",
      "Client resolves RFID tag → powerbank and decides rent or return branch.",
      "Firestore transaction updates user, rental, powerbank, device control, and audit log atomically.",
      "Live listeners propagate the new state to dashboards, history, admin pages, and device control logic.",
    ],
  },
  {
    title: "Telemetry feedback flow",
    description: "How the physical layer reports runtime status back to admins.",
    steps: [
      "Powerbank hardware publishes telemetry into Realtime Database.",
      "telemetry-service subscribes to /telemetry and maps records into UI-ready objects.",
      "Telemetry store updates the Monitoring page in real time.",
      "Admins correlate telemetry with Firestore inventory and audit trail data.",
    ],
  },
]

const dataContracts = [
  {
    title: "users/{uid}",
    text: "Application profile mirrored from Firebase Auth and required for access control, onboarding, preferences, and rental ownership.",
    icon: UsersIcon,
  },
  {
    title: "powerbanks + tags",
    text: "Inventory definitions and RFID relationships used to bind physical devices to scan actions and admin management.",
    icon: BoxesIcon,
  },
  {
    title: "rentals + auditLogs",
    text: "Transactional history and event trace that record borrow/return operations and support admin oversight.",
    icon: WavesIcon,
  },
  {
    title: "settings + telemetry",
    text: "System configuration in Firestore and live operational feedback in Realtime Database.",
    icon: Settings2Icon,
  },
]

function SystemNodeCard({ node }: { node: SystemNode }) {
  const Icon = node.icon

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">{node.subtitle}</p>
          <h3 className="mt-3 text-lg font-semibold text-white">{node.title}</h3>
        </div>
        <div
          className={[
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border",
            toneClasses[node.tone],
          ].join(" ")}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-white/60">{node.detail}</p>
    </div>
  )
}

function HorizontalConnector() {
  return (
    <div className="hidden items-center gap-2 px-1 text-white/26 xl:flex">
      <div className="h-px w-7 bg-white/12" />
      <ArrowRightIcon className="size-4" />
      <div className="h-px w-7 bg-white/12" />
    </div>
  )
}

export function FlowchartPage() {
  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">System Flow Flowchart</h1>
        <p className="max-w-4xl text-white/55">
          System-level flow of Sunsaver showing how client modules, stores, Firebase
          services, rules, transactional data, telemetry, and physical devices work together.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.04] text-white">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>High-level architecture map</CardTitle>
            <CardDescription className="max-w-3xl text-white/50">
              Read top to bottom as a system pipeline: interface layer → state and services →
              Firebase core → physical/feedback layer. This is not a user journey map anymore;
              it is the runtime system flow.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
              Client runtime
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
              Firebase core
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
              Physical layer
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80">
              Feedback loops
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
                Layer 1 · Client execution
              </h2>
              <span className="text-xs uppercase tracking-[0.24em] text-white/34">
                React app
              </span>
            </div>
            <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {topRow.map((node, index) => (
                <>
                  <SystemNodeCard key={node.title} node={node} />
                  {index < topRow.length - 1 && <HorizontalConnector />}
                </>
              ))}
            </div>
          </div>

          <div className="flex justify-center text-white/26">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-xs uppercase tracking-[0.24em]">
              <ArrowDownIcon className="size-4" />
              Requests and subscriptions flow into backend services
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
                Layer 2 · Firebase platform
              </h2>
              <span className="text-xs uppercase tracking-[0.24em] text-white/34">
                Auth + databases + policy
              </span>
            </div>
            <div className="grid gap-4 xl:grid-cols-4">
              {firebaseRow.map((node) => (
                <SystemNodeCard key={node.title} node={node} />
              ))}
            </div>
          </div>

          <div className="flex justify-center text-white/26">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-xs uppercase tracking-[0.24em]">
              <ArrowDownIcon className="size-4" />
              Commands go outward and telemetry comes back inward
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
                Layer 3 · Physical and feedback loop
              </h2>
              <span className="text-xs uppercase tracking-[0.24em] text-white/34">
                Scan, devices, notifications
              </span>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {physicalRow.map((node) => (
                <SystemNodeCard key={node.title} node={node} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-white/[0.04] text-white">
          <CardHeader>
            <CardTitle>Runtime system flows</CardTitle>
            <CardDescription className="text-white/50">
              The most important system paths executed continuously by the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {runtimeFlows.map((flow) => (
              <div key={flow.title} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
                <h3 className="text-base font-semibold text-white">{flow.title}</h3>
                <p className="mt-2 text-sm text-white/54">{flow.description}</p>
                <div className="mt-4 space-y-3">
                  {flow.steps.map((step, index) => (
                    <div key={step} className="flex gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-semibold text-white/82">
                        {index + 1}
                      </div>
                      <p className="pt-0.5 text-sm leading-7 text-white/62">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] text-white">
          <CardHeader>
            <CardTitle>Core data contracts</CardTitle>
            <CardDescription className="text-white/50">
              The entities that hold the whole system together.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataContracts.map((contract) => {
              const Icon = contract.icon

              return (
                <div key={contract.title} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/72">
                      <Icon className="size-4" />
                    </div>
                    <p className="text-sm font-semibold text-white">{contract.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/58">{contract.text}</p>
                </div>
              )
            })}

            <div className="rounded-[24px] border border-[#ffd166]/20 bg-[#ffd166]/8 p-5">
              <div className="flex items-center gap-3 text-[#ffd166]">
                <ServerCogIcon className="size-4" />
                <p className="text-sm font-semibold">System invariant</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Every successful rental path depends on a valid authenticated user, a synced
                Firestore user profile, a rule-compliant transaction, and realtime propagation back
                into stores and UI. Break one link and the system rejects or stalls the operation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
