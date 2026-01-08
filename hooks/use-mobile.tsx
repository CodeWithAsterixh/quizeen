import * as React from "react"

const DEFAULT_BREAKPOINT = 768

export function useIsMobile(MOBILE_BREAKPOINT=DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = globalThis.window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(globalThis.window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(globalThis.window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [MOBILE_BREAKPOINT])

  return !!isMobile
}
