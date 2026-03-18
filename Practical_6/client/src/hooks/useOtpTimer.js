import { useEffect, useMemo, useRef, useState } from 'react'

export function useOtpTimer(expiresAt) {
  const intervalRef = useRef(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!expiresAt) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => setNow(Date.now()), 250)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [expiresAt])

  const msLeft = useMemo(() => {
    if (!expiresAt) return 0
    const end = new Date(expiresAt).getTime()
    return Math.max(0, end - now)
  }, [expiresAt, now])

  const secondsLeft = Math.ceil(msLeft / 1000)

  return { msLeft, secondsLeft, expired: msLeft <= 0 }
}
