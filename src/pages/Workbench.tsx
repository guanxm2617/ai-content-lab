import { Card, CardBody, CardHeader, Button, Progress, Divider } from '@nextui-org/react'
import { LayoutDashboard, Rocket, Hash, FileText, Share2, ShieldCheck, MessageCircle, BarChart3, Clock, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useContentStore } from '../stores/ContentStore'

const tools = [
  { id: 'activity', name: '活动策划', icon: Rocket, color: 'text-blue-500', bgColor: 'bg-blue-50', path: '/tools/activity', desc: '全案策划方案生成' },
  { id: 'topic', name: '选题助手', icon: Hash, color: 'text-微信绿', bgColor: 'bg-green-50', path: '/tools/topic', desc: '爆款选题批量建议' },
  { id: 'article', name: '文章写作', icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-50', path: '/tools/article', desc: 'AI 智能辅助写作' },
  { id: 'xiaohongshu', name: '小红书生成', icon: Share2, color: 'text-小红书红', bgColor: 'bg-red-50', path: '/tools/xiaohongshu', desc: '种草文案与标题' },
  { id: 'review', name: '文章审核', icon: ShieldCheck, color: 'text-yellow-600', bgColor: 'bg-yellow-50', path: '/tools/review', desc: '合规性与逻辑检测' },
  { id: 'moments', name: '朋友圈优化', icon: MessageCircle, color: 'text-微信绿', bgColor: 'bg-green-50', path: '/tools/moments', desc: '社交动态互动优化' },
  { id: 'analysis', name: '传播分析', icon: BarChart3, color: 'text-微博橙', bgColor: 'bg-orange-50', path: '/tools/analysis', desc: '内容传播效果预估' },
]

const Workbench = () => {
  const navigate = useNavigate()
  const { stats, library } = useContentStore()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">早安，内容创作者</h1>
          <p className="text-default-500 mt-1">今天想创作点什么？AI 已准备好为你助力。</p>
        </div>
        <div className="flex gap-3">
          <Button 
            color="primary" 
            variant="flat" 
            startContent={<Rocket size={18} />}
            onPress={() => navigate('/tools/activity')}
          >
            快速策划
          </Button>
          <Button 
            color="secondary" 
            variant="shadow" 
            startContent={<FileText size={18} />}
            onPress={() => navigate('/tools/article')}
          >
            开始写作
          </Button>
        </div>
      </section>

      {/* Data Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-none shadow-none">
          <CardBody className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-default-500">本月生成数</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalGenerated}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
            <Progress size="sm" value={75} className="mt-4" color="primary" />
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-none shadow-none">
          <CardBody className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-default-500">预估曝光量</p>
                <h3 className="text-3xl font-bold mt-2">{stats.estimatedExposure.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <BarChart3 className="text-green-600" size={24} />
              </div>
            </div>
            <Progress size="sm" value={60} className="mt-4" color="success" />
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-none shadow-none">
          <CardBody className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-default-500">活跃度评分</p>
                <h3 className="text-3xl font-bold mt-2">8.5</h3>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Star className="text-orange-600" size={24} />
              </div>
            </div>
            <Progress size="sm" value={85} className="mt-4" color="warning" />
          </CardBody>
        </Card>
      </section>

      {/* Tool Matrix */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard size={20} className="text-primary" />
            工具矩阵
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              isPressable 
              onPress={() => navigate(tool.path)}
              className="hover:scale-105 transition-transform"
            >
              <CardBody className="p-6 flex flex-col items-center text-center">
                <div className={`p-3 rounded-2xl mb-3 ${tool.bgColor} ${tool.color}`}>
                  <tool.icon size={28} />
                </div>
                <p className="font-bold text-sm">{tool.name}</p>
                <p className="text-[10px] text-default-400 mt-1 line-clamp-1">{tool.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Used */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              最近生成
            </h2>
            <Button size="sm" variant="light" onPress={() => navigate('/library')}>查看全部</Button>
          </div>
          <Card>
            <CardBody className="p-0">
              {library.length > 0 ? (
                <div className="divide-y divide-default-100">
                  {library.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-4 hover:bg-default-50 flex justify-between items-center group">
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-default-400 mt-1">
                          {new Date(item.timestamp).toLocaleString()} · {item.toolId}
                        </p>
                      </div>
                      <Button size="sm" variant="flat" isIconOnly className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-default-400">
                  暂无生成记录，开启你的创作之旅吧
                </div>
              )}
            </CardBody>
          </Card>
        </section>

        {/* Case Studies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star size={20} className="text-warning" />
              优秀案例
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Card shadow="sm" className="bg-default-50 border-none">
              <CardHeader className="flex gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Rocket className="text-white" size={18} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md">“春日野餐”全平台策划</p>
                  <p className="text-small text-default-500">曝光量 50k+ · 互动率 12%</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-small text-default-600">
                  该策划方案成功结合了当下露营热点，通过跨平台联动实现了流量的最大化爆发...
                </p>
              </CardBody>
            </Card>
            <Card shadow="sm" className="bg-default-50 border-none">
              <CardHeader className="flex gap-3">
                <div className="p-2 bg-pink-500 rounded-lg">
                  <Share2 className="text-white" size={18} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md">护肤品测评小红书爆款</p>
                  <p className="text-small text-default-500">收藏 5k+ · 评论 1.2k</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-small text-default-600">
                  标题采用“抓人眼球”法，正文深度契合小红书用户的阅读偏好...
                </p>
              </CardBody>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Workbench
