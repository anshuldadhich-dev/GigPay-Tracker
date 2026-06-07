export default function ToggleSwitch({ checked, onChange, disabled = false, size = 'md' }) {
  const sizes = {
    sm: { track: 'h-5 w-9', knob: 'h-4 w-4', on: 'translate-x-4', off: 'translate-x-0.5' },
    md: { track: 'h-[26px] w-[46px]', knob: 'h-[22px] w-[22px]', on: 'translate-x-5', off: 'translate-x-0' },
  }
  const s = sizes[size] || sizes.md

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-secondary/20
        disabled:opacity-40 disabled:cursor-not-allowed
        ${s.track} ${checked ? 'bg-secondary' : 'bg-slate-200 hover:bg-slate-300'}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full bg-white
          transition-transform duration-200 ease-in-out
          ${s.knob} ${checked ? s.on : s.off}`}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.1)' }}
      />
    </button>
  )
}
