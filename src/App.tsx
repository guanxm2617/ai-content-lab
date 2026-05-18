import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Workbench from './pages/Workbench'
import ActivityAssistant from './pages/tools/ActivityAssistant'
import TopicAssistant from './pages/tools/TopicAssistant'
import ArticleAgent from './pages/tools/ArticleAgent'
import XiaohongshuGenerator from './pages/tools/XiaohongshuGenerator'
import ReviewAssistant from './pages/tools/ReviewAssistant'
import MomentsOptimizer from './pages/tools/MomentsOptimizer'
import ContentLibrary from './pages/ContentLibrary'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Workbench />} />
        <Route path="tools/activity" element={<ActivityAssistant />} />
        <Route path="tools/topic" element={<TopicAssistant />} />
        <Route path="tools/article" element={<ArticleAgent />} />
        <Route path="tools/xiaohongshu" element={<XiaohongshuGenerator />} />
        <Route path="tools/review" element={<ReviewAssistant />} />
        <Route path="tools/moments" element={<MomentsOptimizer />} />
        <Route path="library" element={<ContentLibrary />} />
      </Route>
    </Routes>
  )
}

export default App
