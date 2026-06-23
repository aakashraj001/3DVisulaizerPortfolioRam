/* Live local clock for the footer (mono). Uses the visitor's locale/timezone. */
export function startClock(): void {
  const el = document.querySelector<HTMLElement>('.clock')
  if (!el) return
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  tick()
  window.setInterval(tick, 1000 * 30)
}
