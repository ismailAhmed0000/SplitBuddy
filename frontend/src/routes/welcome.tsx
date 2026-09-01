import { createFileRoute } from '@tanstack/react-router'
import { LandingNavbar } from '@/components/LandingNavbar'
import { LandingHero } from '@/components/LandingHero'
import { LandingFooter } from '@/components/LandingFooter'

export const Route = createFileRoute('/welcome')({
  component: WelcomePage,
})

function WelcomePage() {
  return (
    <div className="min-h-svh bg-canvas">
      <LandingNavbar />
      <LandingHero />
      <LandingFooter />
    </div>
  )
}
