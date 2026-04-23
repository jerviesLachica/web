import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRightIcon, CheckIcon, QrCodeIcon, BatteryChargingIcon, BellIcon } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore, useCurrentUser } from "@/stores/auth-store"
import { completeUserOnboarding } from "@/services/firebase/data-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const steps = [
  {
    icon: QrCodeIcon,
    title: "Scan to rent",
    description: "Open the scan page, tap or enter a code, and unlock an available powerbank in a few seconds.",
  },
  {
    icon: BatteryChargingIcon,
    title: "Track active use",
    description: "Your dashboard shows the current rental, due time, and how long you have been using the device.",
  },
  {
    icon: BellIcon,
    title: "Stay ahead of due time",
    description: "Turn on reminders in your profile so the app warns you before your rental becomes overdue.",
  },
]

export function TutorialPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const markOnboardingCompleted = useAuthStore((state) => state.markOnboardingCompleted)
  const [currentStep, setCurrentStep] = useState(0)
  const [finishing, setFinishing] = useState(false)

  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep])

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStep((value) => value + 1)
      return
    }

    if (!user) {
      navigate("/app", { replace: true })
      return
    }

    setFinishing(true)
    try {
      await completeUserOnboarding(user.id)
      markOnboardingCompleted()
      toast.success("Tutorial completed")
      navigate("/app", { replace: true })
    } catch {
      toast.error("Failed to finish tutorial")
    } finally {
      setFinishing(false)
    }
  }

  const Icon = step.icon

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl items-center justify-center px-4 py-8 text-white">
      <Card className="w-full overflow-hidden border-white/10 bg-black/25 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-white/6" />
        <div className="absolute left-0 top-0 h-1 bg-[#ffd166] transition-all duration-500" style={{ width: `${progress}%` }} />

        <CardHeader className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#ffd166]">Quick tutorial</p>
              <CardTitle className="mt-3 text-3xl font-semibold text-white">Welcome to Sunsaver</CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                A one-time walkthrough for new users. After you finish it once, it will never appear again on future logins.
              </CardDescription>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/55">
              Step {currentStep + 1} / {steps.length}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-4">
            {steps.map((item, index) => {
              const StepIcon = item.icon
              const active = index === currentStep
              const done = index < currentStep

              return (
                <div
                  key={item.title}
                  className={[
                    "rounded-[24px] border p-4 transition-all",
                    active
                      ? "border-[#ffd166]/45 bg-[#ffd166]/10"
                      : "border-white/10 bg-white/[0.03]",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={[
                        "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                        done || active ? "bg-[#ffd166] text-black" : "bg-white/6 text-white/50",
                      ].join(" ")}
                    >
                      {done ? <CheckIcon className="size-4" /> : <StepIcon className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/48">{item.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="mb-6 flex size-14 items-center justify-center rounded-3xl bg-[#ffd166]/14 text-[#ffd166]">
              <Icon className="size-6" />
            </div>
            <h2 className="text-3xl font-semibold text-white">{step.title}</h2>
            <p className="mt-4 text-base leading-8 text-white/60">{step.description}</p>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Why this matters</p>
              <p className="mt-3 text-sm leading-7 text-white/58">
                This short flow helps first-time users understand the core actions before they start renting. After completion, your account is marked as onboarded and the tutorial stays out of the way.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/8"
                  onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
                >
                  Back
                </Button>
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={finishing}
                className="rounded-2xl bg-[#ffd166] text-black hover:bg-[#ffe08e]"
              >
                <span>
                  {isLastStep ? (finishing ? "Finishing..." : "Finish tutorial") : "Next"}
                </span>
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
