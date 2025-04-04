"use client"
import VerificationForm from '@/components/VerificationForm'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        MahaDBT Scholarship Application
      </h1>
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">
          Step 1: Aadhaar & CAP ID Verification
        </h2>
        <VerificationForm />
      </div>
    </div>
  )
}
