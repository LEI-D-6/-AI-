import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Card, Row, Col, Carousel, Button, Tag, Space, Avatar } from 'antd'
import {
  ReadOutlined,
  HeartOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  EyeOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

// 健康资讯数据
const healthNews = [
  {
    id: 1,
    title: '春季养生指南：如何预防慢性疾病复发',
    summary: '春季是慢性疾病高发季节，专家为您详细解读春季养生要点，帮助您预防疾病复发，保持健康体魄。',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
    category: '养生知识',
    date: '2026-03-28',
    views: 1256
  },
  {
    id: 2,
    title: '糖尿病患者的饮食管理：科学控糖有方法',
    summary: '合理饮食是控制糖尿病的关键，本文为您介绍科学的饮食管理方法，帮助您更好地控制血糖水平。',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    category: '疾病管理',
    date: '2026-03-27',
    views: 982
  },
  {
    id: 3,
    title: '高血压患者的运动指南：安全有效的锻炼方式',
    summary: '适当的运动有助于控制血压，但高血压患者需要注意运动方式和强度，本文为您详细解读。',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    category: '运动健康',
    date: '2026-03-26',
    views: 756
  },
  {
    id: 4,
    title: '心理健康与慢性病：如何保持积极心态',
    summary: '慢性病患者常常面临心理压力，保持积极心态对疾病康复至关重要，专家为您提供心理调适建议。',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    category: '心理健康',
    date: '2026-03-25',
    views: 643
  }
]

// 快捷功能入口
const quickLinks = [
  {
    title: '健康监测',
    icon: <HeartOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    description: '实时监测您的健康指标',
    path: '/patient/monitor',
    color: '#e6f7ff'
  },
  {
    title: '健康咨询',
    icon: <TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    description: '在线咨询专业医生',
    path: '/patient/consultation',
    color: '#fff7e6'
  },
  {
    title: '我的治疗',
    icon: <FileTextOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    description: '查看您的治疗方案',
    path: '/patient/treatment',
    color: '#f6ffed'
  },
  {
    title: '智能提醒',
    icon: <BarChartOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
    description: '设置用药提醒',
    path: '/patient/reminders',
    color: '#f9f0ff'
  }
]



function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div style={{ background: '#f0f2f5' }}>
      {/* 轮播图区域 */}
      <Carousel autoplay style={{ background: '#001529' }}>
        {user.role === 'patient' ? (
          // 患者端轮播图
          [
            <div key="patient-1">
              <div style={{ 
                height: '400px', 
                background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '0 48px' }}>
                  <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
                    慢性病智能管理系统
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '20px', maxWidth: '800px', margin: '0 auto 32px' }}>
                    专业的慢性病管理平台，为您提供全方位的健康管理服务，
                    让健康触手可及
                  </Paragraph>
                  <Space size="large">
                    <Button type="primary" size="large" onClick={() => navigate('/patient/monitor')}>
                      开始健康监测
                    </Button>
                    <Button size="large" style={{ background: 'transparent', color: 'white', border: '1px solid white' }} onClick={() => navigate('/health-news')}>
                      了解更多
                    </Button>
                  </Space>
                </div>
              </div>
            </div>,
            <div key="patient-2">
              <div style={{ 
                height: '400px', 
                background: 'linear-gradient(135deg, #003a70 0%, #001529 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '0 48px' }}>
                  <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
                    科学管理 健康生活
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '20px', maxWidth: '800px', margin: '0 auto 32px' }}>
                    通过智能数据分析和专业医生指导，
                    帮助您更好地管理慢性病，提高生活质量
                  </Paragraph>
                  <Button type="primary" size="large" onClick={() => navigate('/patient/consultation')}>
                    咨询专家
                  </Button>
                </div>
              </div>
            </div>
          ]
        ) : (
          // 医生端轮播图
          [
            <div key="doctor-1">
              <div style={{ 
                height: '400px', 
                background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '0 48px' }}>
                  <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
                    慢性病智能管理系统
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '20px', maxWidth: '800px', margin: '0 auto 32px' }}>
                    专业的医疗管理平台，为您提供高效的患者管理工具，
                    提升医疗服务质量
                  </Paragraph>
                  <Space size="large">
                      <Button type="primary" size="large" onClick={() => navigate('/doctor/my-patients')}>
                        患者管理
                      </Button>
                      <Button size="large" style={{ background: 'transparent', color: 'white', border: '1px solid white' }} onClick={() => navigate('/health-news')}>
                        医学资讯
                      </Button>
                    </Space>
                </div>
              </div>
            </div>,
            <div key="doctor-2">
              <div style={{ 
                height: '400px', 
                background: 'linear-gradient(135deg, #003a70 0%, #001529 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '0 48px' }}>
                  <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
                    智能医疗 高效管理
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '20px', maxWidth: '800px', margin: '0 auto 32px' }}>
                    通过智能数据分析和自动化工具，
                    帮助您更高效地管理患者，提供精准医疗服务
                  </Paragraph>
                  <Button type="primary" size="large" onClick={() => navigate('/doctor/consultation')}>
                    患者咨询
                  </Button>
                </div>
              </div>
            </div>
          ]
        )}
      </Carousel>

      {/* 快捷功能入口 - 仅患者可见 */}
      {user.role === 'patient' && (
        <div style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <HeartOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            快捷服务
          </Title>
          <Row gutter={[24, 24]}>
            {quickLinks.map((link, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  hoverable
                  onClick={() => navigate(link.path)}
                  style={{ 
                    textAlign: 'center', 
                    height: '100%',
                    background: link.color,
                    border: 'none'
                  }}
                >
                  <div style={{ marginBottom: 16 }}>{link.icon}</div>
                  <Title level={4} style={{ marginBottom: 8 }}>{link.title}</Title>
                  <Text type="secondary">{link.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 健康资讯区域 */}
      <div style={{ padding: '48px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ margin: 0 }}>
              <ReadOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              健康资讯
            </Title>
            <Button type="link" onClick={() => navigate('/health-news')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          
          <Row gutter={[24, 24]}>
            {healthNews.map((news) => (
              <Col xs={24} md={12} key={news.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, overflow: 'hidden' }}>
                      <img
                        alt={news.title}
                        src={news.image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/health-news/${news.id}`)}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Tag color="blue">{news.category}</Tag>
                  </div>
                  <Title level={4} style={{ marginBottom: 12, fontSize: '18px' }}>{news.title}</Title>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                    {news.summary}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '13px' }}>
                    <span><CalendarOutlined style={{ marginRight: 4 }} />{news.date}</span>
                    <span><EyeOutlined style={{ marginRight: 4 }} />{news.views}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>




    </div>
  )
}

export default Home