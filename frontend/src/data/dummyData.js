export const user = {
  name: 'Amanda',
  email: 'amanda@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
}

export const summaryStats = [
  { id: 'rides', label: 'Total Rides', value: '248', change: '+12%', trend: 'up', icon: 'car', sparkline: [32, 38, 35, 42, 48, 52, 58], accent: 'teal' },
  { id: 'gross', label: 'Gross Earnings', value: '₹1,24,580', change: '+8.4%', trend: 'up', icon: 'wallet', sparkline: [18, 22, 20, 26, 28, 30, 32], accent: 'blue' },
  { id: 'net', label: 'Net Earnings', value: '₹98,420', change: '+6.2%', trend: 'up', icon: 'trending', sparkline: [14, 17, 16, 21, 23, 25, 28], accent: 'teal' },
  { id: 'monthly', label: 'Monthly Earnings', value: '₹32,150', change: '+14%', trend: 'up', icon: 'calendar', sparkline: [18, 22, 20, 26, 29, 32, 36], accent: 'orange' },
]

export const monthlyEarnings = [
  { month: 'Jan', earnings: 18500, rides: 42, target: 20000 },
  { month: 'Feb', earnings: 22100, rides: 51, target: 22000 },
  { month: 'Mar', earnings: 19800, rides: 46, target: 21000 },
  { month: 'Apr', earnings: 26400, rides: 58, target: 25000 },
  { month: 'May', earnings: 28900, rides: 63, target: 27000 },
  { month: 'Jun', earnings: 32150, rides: 72, target: 30000 },
]

export const chartInsights = [
  { label: 'Avg. per Ride', value: '₹447', change: '+5.2%', icon: 'trending' },
  { label: 'Best Month', value: 'June', change: '₹32,150', icon: 'star' },
  { label: 'Growth Rate', value: '+14%', change: 'vs last month', icon: 'zap' },
]

export const platformEarnings = [
  { platform: 'Uber', amount: 52400, percentage: 42, color: '#1E3A8A', rides: 104, icon: '🚗', growth: '+9%' },
  { platform: 'Ola', amount: 38200, percentage: 31, color: '#F97316', rides: 78, icon: '🛺', growth: '+6%' },
  { platform: 'Rapido', amount: 33980, percentage: 27, color: '#14B8A6', rides: 66, icon: '🏍️', growth: '+11%' },
]

// GitHub-style heatmap: 26 weeks × 7 days, level 0-4
const heatmapPattern = [
  [0,1,2,1,0,3,2],[1,2,3,2,1,2,0],[2,3,4,3,2,3,1],[1,2,3,4,3,2,1],
  [0,1,2,3,4,3,2],[1,2,1,2,3,4,3],[2,3,2,1,2,3,4],[3,4,3,2,1,2,3],
  [2,3,4,3,2,1,0],[1,2,3,4,4,3,2],[2,3,2,3,4,3,2],[1,0,1,2,3,4,3],
  [2,3,4,3,2,3,4],[3,4,3,2,3,4,3],[2,1,2,3,4,3,2],[1,2,3,4,3,2,1],
  [0,1,2,3,2,1,0],[1,2,3,4,3,2,1],[2,3,4,4,3,2,3],[3,2,3,4,3,2,1],
  [2,1,2,3,2,1,0],[1,2,3,2,3,4,3],[2,3,4,3,4,3,2],[1,2,1,2,3,4,4],
  [2,3,4,3,2,3,2],[1,2,3,4,3,2,1],
]
export const activityHeatmap = heatmapPattern
export const heatmapMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export const todaySummary = {
  rides: 4,
  earnings: '₹1,890',
  hours: '6.5h',
  bestPlatform: 'Uber',
  streak: 12,
}

export const recentRides = [
  { id: 1, platform: 'Uber', pickup: 'Koramangala 5th Block', dropoff: 'Indiranagar Metro', fare: 285, date: '2026-06-07', distance: '4.2 km', status: 'completed' },
  { id: 2, platform: 'Ola', pickup: 'MG Road', dropoff: 'Whitefield ITPL', fare: 520, date: '2026-06-07', distance: '18.5 km', status: 'completed' },
  { id: 3, platform: 'Rapido', pickup: 'HSR Layout Sector 2', dropoff: 'Electronic City Phase 1', fare: 195, date: '2026-06-06', distance: '12.1 km', status: 'completed' },
  { id: 4, platform: 'Uber', pickup: 'Jayanagar 4th Block', dropoff: 'Airport Terminal 1', fare: 890, date: '2026-06-06', distance: '38.2 km', status: 'completed' },
  { id: 5, platform: 'Ola', pickup: 'Marathahalli Bridge', dropoff: 'Bellandur', fare: 165, date: '2026-06-05', distance: '3.8 km', status: 'pending' },
  { id: 6, platform: 'Rapido', pickup: 'BTM Layout', dropoff: 'Silk Board', fare: 95, date: '2026-06-05', distance: '2.1 km', status: 'completed' },
]

export const reportHistory = [
  { id: 1, title: 'May 2026 Earnings Report', date: '2026-06-01', rides: 63, total: '₹28,900', status: 'ready' },
  { id: 2, title: 'April 2026 Earnings Report', date: '2026-05-01', rides: 58, total: '₹26,400', status: 'ready' },
  { id: 3, title: 'March 2026 Earnings Report', date: '2026-04-01', rides: 46, total: '₹19,800', status: 'ready' },
]

export const platforms = ['Uber', 'Ola', 'Rapido']

export const authStats = [
  { value: 'Free', label: 'No Cost' },
  { value: '3+', label: 'Platforms' },
  { value: 'PDF', label: 'Reports' },
]
