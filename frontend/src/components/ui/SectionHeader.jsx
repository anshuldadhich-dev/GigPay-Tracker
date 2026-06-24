export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h3 className="text-lg font-bold text-primary dark:text-gray-100 tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-muted dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
