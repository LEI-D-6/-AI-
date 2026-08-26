import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Typography, Avatar, Dropdown, Menu, Button } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  HeartOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  BellOutlined,
  WechatOutlined,
  ReadOutlined,
  SafetyOutlined,
  MedicineBoxTwoTone
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Text } = Typography

function MainLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }
  
  const roleText = user.role === 'admin' ? '管理员' : user.role === 'doctor' ? '医生' : '患者'
  
  const userMenuItems = [
    {
      key: '1',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/patient/settings'),
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true,
    },
  ]
  
  const getTopMenuItems = () => {
    // 确保用户对象存在
    if (!user || !user.role) {
      return [
        {
          key: '/home',
          icon: <HomeOutlined />,
          label: '首页',
          onClick: () => navigate('/home'),
        },
        {
          key: '/health-news',
          icon: <ReadOutlined />,
          label: '健康资讯',
          onClick: () => navigate('/health-news'),
        },
      ]
    }
    
    const baseItems = [
      {
        key: '/home',
        icon: <HomeOutlined />,
        label: '首页',
        onClick: () => navigate('/home'),
      },
      {
        key: '/health-news',
        icon: <ReadOutlined />,
        label: '健康资讯',
        onClick: () => navigate('/health-news'),
      },
    ]
    
    if (user.role === 'admin') {
      return [
        ...baseItems,
        {
          key: '/dashboard',
          icon: <BarChartOutlined />,
          label: '数据统计',
          onClick: () => navigate('/dashboard'),
        },
        {
          key: '/patients',
          icon: <TeamOutlined />,
          label: '患者管理',
          onClick: () => navigate('/patients'),
        },
        {
          key: '/users',
          icon: <UserOutlined />,
          label: '用户管理',
          onClick: () => navigate('/users'),
        },
      ]
    } else if (user.role === 'doctor') {
      return [
        ...baseItems,

        {
          key: '/doctor/my-patients',
          icon: <TeamOutlined />,
          label: '我的患者',
          onClick: () => navigate('/doctor/my-patients'),
        },
        {
          key: '/doctor/consultation',
          icon: <WechatOutlined />,
          label: '患者咨询',
          onClick: () => navigate('/doctor/consultation'),
        },
        {
          key: '/doctor/medical-records',
          icon: <FileTextOutlined />,
          label: '病历管理',
          onClick: () => navigate('/doctor/medical-records'),
        },
      ]
    } else {
      return [
        ...baseItems,
        {
          key: '/patient/monitor',
          icon: <HeartOutlined />,
          label: '健康监测',
          onClick: () => navigate('/patient/monitor'),
        },
        {
          key: '/patient/consultation',
          icon: <QuestionCircleOutlined />,
          label: '健康咨询',
          onClick: () => navigate('/patient/consultation'),
        },
        {
          key: '/patient/treatment',
          icon: <MedicineBoxOutlined />,
          label: '我的治疗',
          onClick: () => navigate('/patient/treatment'),
        },
        {
          key: '/patient/reminders',
          icon: <BellOutlined />,
          label: '智能提醒',
          onClick: () => navigate('/patient/reminders'),
        },
        {
          key: '/patient/medical-records',
          icon: <FileTextOutlined />,
          label: '病历记录',
          onClick: () => navigate('/patient/medical-records'),
        },
      ]
    }
  }
  
  const topMenuItems = getTopMenuItems()
  const selectedKey = location.pathname || '/home'
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: '#001529',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        height: 64
      }}>
        {/* Logo和标题 */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <MedicineBoxTwoTone style={{ fontSize: 32, marginRight: 12 }} twoToneColor="#1890ff" />
          <div>
            <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
              慢性病智能管理系统
            </Text>
          </div>
        </div>
        
        {/* 顶部导航菜单 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginLeft: 48 }}>
          <Menu
            mode="horizontal"
            theme="dark"
            selectedKeys={[selectedKey]}
            items={topMenuItems}
            style={{ 
              backgroundColor: 'transparent', 
              borderBottom: 'none',
              flex: 1
            }}
          />
        </div>
        
        {/* 用户信息 */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <Dropdown menu={{ items: userMenuItems }}>
            <div style={{ cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
              <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
              <div style={{ marginLeft: 12, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: 'white', fontSize: '14px' }}>{user.username}</Text>
                  <Text type="secondary" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>{roleText}</Text>
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      {/* 主内容区域 */}
      <Content style={{ 
        marginTop: 64,
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
        backgroundImage: `url('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20health%20background%20with%20soft%20blue%20and%20green%20colors%2C%20abstract%20medical%20symbols%2C%20peaceful%20and%20clean%20design&image_size=landscape_16_9')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(240, 242, 245, 0.85)',
          zIndex: 0
        }}></div>
        <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
          {children}
        </div>
      </Content>
      
      {/* 页脚 */}
      <Footer style={{ 
        textAlign: 'center', 
        background: '#001529', 
        padding: '24px 48px',
        color: 'rgba(255,255,255,0.65)'
      }}>
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>慢性病智能管理系统</Text>
        </div>
        <div>
          <Text style={{ color: 'rgba(255,255,255,0.45)' }}>© 2026 慢性病智能管理系统 版权所有</Text>
        </div>
      </Footer>
    </Layout>
  )
}

export default MainLayout