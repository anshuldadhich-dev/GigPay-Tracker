import { Construction } from 'lucide-react'
import Card from '../components/ui/Card'

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="max-w-lg mx-auto animate-fade-up">
      <Card className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
          <Construction className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-extrabold text-primary dark:text-gray-100">{title}</h2>
        <p className="text-muted dark:text-gray-400 mt-3 max-w-sm mx-auto">{description}</p>
        <span className="inline-block mt-8 text-xs font-bold text-secondary dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 px-5 py-2.5 rounded-full border border-teal-100 dark:border-teal-800/50">
          Coming Soon
        </span>
      </Card>
    </div>
  )
}
