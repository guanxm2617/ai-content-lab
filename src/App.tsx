import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import ActivityHelper from "./pages/ActivityHelper";
import TopicHelper from "./pages/TopicHelper";
import ArticleAgent from "./pages/ArticleAgent";
import XhsGenerator from "./pages/XhsGenerator";
import ReviewHelper from "./pages/ReviewHelper";
import MomentsOptimizer from "./pages/MomentsOptimizer";
import Library from "./pages/Library";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools/activity" element={<ActivityHelper />} />
        <Route path="/tools/topic" element={<TopicHelper />} />
        <Route path="/tools/article" element={<ArticleAgent />} />
        <Route path="/tools/xiaohongshu" element={<XhsGenerator />} />
        <Route path="/tools/review" element={<ReviewHelper />} />
        <Route path="/tools/moments" element={<MomentsOptimizer />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
