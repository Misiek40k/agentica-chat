import { useRef, useEffect } from 'react'

export function useAutoScroll<T>(dependency: T) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef<boolean>(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isAtBottomRef.current) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [dependency])

  return { scrollRef, isAtBottom: isAtBottomRef }
}
