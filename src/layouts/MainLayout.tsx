import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Rocket, Hash, FileText, Share2, ShieldCheck, MessageCircle, Library } from 'lucide-react'

const navItems = [
  { name: '工作台', icon: LayoutDashboard, path: '/' },
  { name: '活动策划', icon: Rocket, path: '/tools/activity' },
  { name: '选题助手', icon: Hash, path: '/tools/topic' },
  { name: '文章写作', icon: FileText, path: '/tools/article' },
  { name: '小红书生成', icon: Share2, path: '/tools/xiaohongshu' },
  { name: '文章审核', icon: ShieldCheck, path: '/tools/review' },
  { name: '朋友圈优化', icon: MessageCircle, path: '/tools/moments' },
  { name: '内容库', icon: Library, path: '/library' },
]

const MainLayout = () => {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-surface/60 backdrop-blur-xl">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Media Assistant
          </h1>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground hover:bg-default-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
