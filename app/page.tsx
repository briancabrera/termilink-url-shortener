"use client"

import { AuthGuard } from "../components/auth-guard"

export default function Page() {
  return (
    <AuthGuard redirectTo="/login" lang="es">
      <div>
        <h1>Welcome!</h1>
        <p>You are authenticated.</p>
      </div>
    </AuthGuard>
  )
}
