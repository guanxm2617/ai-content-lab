import { useState } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem, Slider, Chip, Progress } from '@nextui-org/react'
import { Hash, Send, Star, ArrowRight, Bookmark, Loader2, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { callZhipu } from '../../api/zhipu'
import { prompts } from '../../prompts'
import { useContentStore } from '../../stores/ContentStore'

interface Topic {
  title: string;
  angle: string;
  effect: string;
  time: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const TopicAssistant = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const { updateStats } = useContentStore()

  const [config, setConfig] = useState({
    hotTopic: '',
    positioning: '',
    style: '',
    preference: '',
    count: 3,
  })

  const getStyleColor = () => {
    switch (config.style) {
      case 'emotional': return 'text-小红书红'
      case 'news': return 'text-微博橙'
      default: return 'text-green-500'
    }
  }

  const handleGenerate = async () => {
    if (!config.hotTopic) return
    setLoading(true)
    
    try {
      const prompt = prompts.topic(config) + "\n请严格按 JSON 格式输出数组，每个对象含: title, angle, effect, time, difficulty (easy/medium/hard)"
      const response = await callZhipu([{ role: 'user', content: prompt }])
      
      // Clean up response to get JSON
      const jsonStr = response.match(/\[.*\]/s)?.[0] || '[]'
      const data = JSON.parse(jsonStr)
      setTopics(data)
      updateStats('topic')
    } catch (error) {
      console.error('Generation failed', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Hash className={getStyleColor()} size={32} />
            公众号选题助手
          </h1>
          <p className="text-default-500 mt-2">基于热点与定位，精准捕捉流量密码。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Config */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-4">
            <CardBody className="space-y-6">
              <Input
                label="热点/话题输入"
                placeholder="例如：AI 绘画、端午节"
                value={config.hotTopic}
                onValueChange={(val) => setConfig({ ...config, hotTopic: val })}
              />
              <Input
                label="账号定位"
                placeholder="例如：职场成长、科技资讯"
                value={config.positioning}
                onValueChange={(val) => setConfig({ ...config, positioning: val })}
              />
              <Select
                label="风格选择"
                placeholder="选择风格"
                selectedKeys={config.style ? [config.style] : []}
                onSelectionChange={(keys) => setConfig({ ...config, style: Array.from(keys)[0] as string })}
              >
                <SelectItem key="humor" value="humor">幽默风趣</SelectItem>
                <SelectItem key="serious" value="serious">严谨深度</SelectItem>
                <SelectItem key="emotional" value="emotional">情感共鸣</SelectItem>
                <SelectItem key="news" value="news">资讯播报</SelectItem>
              </Select>
              
              <div className="space-y-2">
                <p className="text-sm text-default-500">生成数量: {config.count}</p>
                <Slider 
                  step={1} 
                  maxValue={10} 
                  minValue={1} 
                  value={config.count}
                  onChange={(val) => setConfig({ ...config, count: val as number })}
                />
              </div>

              <Button 
                color="success" 
                className="text-white bg-微信绿"
                fullWidth 
                size="lg" 
                onPress={handleGenerate}
                isLoading={loading}
                startContent={!loading && <Send size={20} />}
              >
                {loading ? '正在头脑风暴...' : '批量生成选题'}
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(config.count)].map((_, i) => (
                <Card key={i} className="h-[200px] flex items-center justify-center">
                  <Loader2 className="animate-spin text-default-300" size={32} />
                </Card>
              ))}
            </div>
          ) : topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic, index) => (
                <Card key={index} className="hover:border-green-500 border-2 border-transparent transition-all">
                  <CardBody className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <Chip 
                        size="sm" 
                        color={topic.difficulty === 'easy' ? 'success' : topic.difficulty === 'medium' ? 'warning' : 'danger'}
                        variant="flat"
                      >
                        {topic.difficulty === 'easy' ? '低难度' : topic.difficulty === 'medium' ? '中等难度' : '高难度'}
                      </Chip>
                      <Button size="sm" variant="light" isIconOnly><Bookmark size={18} /></Button>
                    </div>
                    
                    <h3 className="text-xl font-bold leading-tight">{topic.title}</h3>
                    <p className="text-sm text-default-600 line-clamp-2">{topic.angle}</p>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-default-400">预估爆发潜力</span>
                        <span className="text-green-600 font-bold">{topic.effect}</span>
                      </div>
                      <Progress size="sm" value={80} color="success" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-default-100 mt-2">
                      <span className="text-xs text-default-400 flex items-center gap-1">
                        <TrendingUp size={14} />
                        推荐发布：{topic.time}
                      </span>
                      <Button 
                        size="sm" 
                        color="success" 
                        variant="flat" 
                        endContent={<ArrowRight size={16} />}
                        onPress={() => navigate('/tools/article', { state: { title: topic.title } })}
                      >
                        去写文章
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-default-300 border-2 border-dashed rounded-2xl">
              <Star size={64} className="opacity-10 mb-4" />
              <p>调整左侧配置，开启你的爆款之路</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicAssistant
