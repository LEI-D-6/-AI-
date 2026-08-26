import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { UserOutlined, HomeOutlined, TeamOutlined, FileTextOutlined, LineChartOutlined, RobotOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const { Header, Sider, Content } = Layout

function MainLayout() {
  const navigate = useNavigate()
  
  // TODO: 从状态管理中获取用户信息和权限
  // TODO: 实现动态菜单生成
  
  const handleLogout = () => {
    // TODO: 实现登出逻辑
    // 1. 清除本地存储的token
    // 2. 重定向到登录页
    navigate('/login')
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="site-layout-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div className="logo">慢性病智能管理系统</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button type="text" icon={<UserOutlined />}>用户</Button>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            登出
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: 'dashboard',
                icon: <HomeOutlined />,
                label: '首页',
                onClick: () => navigate('/dashboard')
              },
              {
                key: 'patients',
                icon: <TeamOutlined />,
                label: '患者管理',
                onClick: () => navigate('/patients')
              },
              {
                key: 'medical-records',
                icon: <FileTextOutlined />,
                label: '病历管理',
                onClick: () => navigate('/medical-records')
              },
              {
                key: 'health-data',
                icon: <LineChartOutlined />,
                label: '健康数据',
                onClick: () => navigate('/health-data')
              },
              {
                key: 'ai-services',
                icon: <RobotOutlined />,
                label: 'AI服务',
                onClick: () => navigate('/ai-services')
              },
              {
                key: 'profile',
                icon: <SettingOutlined />,
                label: '个人设置',
                onClick: () => navigate('/profile')
              }
            ]}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default MainLayout