import type { ReactNode } from "react";
import { ListBox } from "@heroui/react";
import { useNavigate, useLocation } from "react-router-dom";
import type { Key } from "react-aria-components";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "/", label: "首页/工作台" },
    { id: "/tools/activity", label: "活动策划助手" },
    { id: "/tools/topic", label: "公众号选题助手" },
    { id: "/tools/article", label: "文章写作智能体" },
    { id: "/tools/xiaohongshu", label: "小红书图文生成器" },
    { id: "/tools/review", label: "文章审核助手" },
    { id: "/tools/moments", label: "朋友圈文案优化" },
    { id: "/library", label: "内容库" },
  ];

  const onSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys !== "all" && keys.size > 0) {
      const selectedKey = Array.from(keys)[0];
      navigate(selectedKey as string);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-divider bg-surface/60 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary">内容生产助手</h2>
        </div>
        <div className="px-2">
          <ListBox
            aria-label="Navigation"
            selectionMode="single"
            selectedKeys={new Set([location.pathname])}
            onSelectionChange={onSelectionChange}
            className="w-full"
          >
            {menuItems.map((item) => (
              <ListBox.Item
                id={item.id}
                key={item.id}
                textValue={item.label}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  location.pathname === item.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-default-100"
                }`}
              >
                {item.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
