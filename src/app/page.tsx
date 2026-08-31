'use client'

import ScrollVideo from '@/components/ScrollVideo'
import Navbar from '@/components/Navbar'
import SectionOne from '@/components/SectionOne'
import SectionTwo from '@/components/SectionTwo'

export default function LandingPage() {
  return (
    <div className="force-dark relative">
      <ScrollVideo />
      <Navbar />
      <main>
        <SectionOne />
        <div aria-hidden className="h-[80vh]" />
        <SectionTwo />
      </main>
    </div>
  )
}
