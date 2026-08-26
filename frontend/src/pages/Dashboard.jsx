import React from 'react'
import { Typography, Card, Row, Col, Statistic, Space, Avatar } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  BellOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roleText = user.role === 'admin' ? '管理员' : user.role === 'doctor' ? '医生' : '患者'
  
  const getStatistics = () => {
    if (user.role === 'admin') {
      return [
        { title: '总用户数', value: 128, icon: <UserOutlined />, color: '#1890ff' },
        { title: '患者数量', value: 95, icon: <TeamOutlined />, color: '#52c41a' },
        { title: '医生数量', value: 23, icon: <UserOutlined />, color: '#722ed1' },
        { title: '健康记录', value: 456, icon: <FileTextOutlined />, color: '#fa8c16' },
      ]
    } else if (user.role === 'doctor') {
      return [
        { title: '我的患者', value: 32, icon: <TeamOutlined />, color: '#1890ff' },
        { title: '今日预约', value: 8, icon: <CalendarOutlined />, color: '#52c41a' },
        { title: '待处理病历', value: 15, icon: <FileTextOutlined />, color: '#fa8c16' },
        { title: '完成治疗', value: 128, icon: <CheckCircleOutlined />, color: '#722ed1' },
      ]
    } else {
      return [
        { title: '健康记录', value: 24, icon: <FileTextOutlined />, color: '#1890ff' },
        { title: '待服药物', value: 3, icon: <MedicineBoxOutlined />, color: '#fa8c16' },
        { title: '体检提醒', value: 1, icon: <BellOutlined />, color: '#ff4d4f' },
        { title: '健康评分', value: 85, icon: <HeartOutlined />, color: '#52c41a' },
      ]
    }
  }
  
  const statistics = getStatistics()
  
  return (
    <div>
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Space>
          <Avatar size={64} icon={<UserOutlined />} src={user.avatar} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>欢迎回来，{user.username}！</Title>
            <Text type="secondary">您当前以 {roleText} 身份登录系统</Text>
          </div>
        </Space>
      </Card>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card style={{ borderRadius: 8, textAlign: 'center' }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color, fontSize: '28px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <Card title="系统通知" style={{ marginBottom: 24, borderRadius: 8 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
            <Space>
              <BellOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <div>
                <Text strong>系统更新通知</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>系统将于今晚22:00进行维护更新</Text>
              </div>
            </Space>
          </div>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
              <div>
                <Text strong>健康数据同步</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>您的健康数据已同步完成</Text>
              </div>
            </Space>
          </div>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
            <Space>
              <MedicineBoxOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
              <div>
                <Text strong>用药提醒</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>请记得按时服用药物</Text>
              </div>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default Dashboard
