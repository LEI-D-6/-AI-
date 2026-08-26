import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Button,
  Space,
  Avatar,
  Row,
  Col,
  Divider,
  Switch,
  Select,
  message,
  Upload,
  Modal
} from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  SaveOutlined,
  LockOutlined,
  BellOutlined,
  CameraOutlined
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function PersonalSettings() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const [activeTab, setActiveTab] = useState('basic')
  const [avatar, setAvatar] = useState(user.avatar || null)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  
  const [basicForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  
  const [notifications, setNotifications] = useState({
    medicine: true,
    bloodPressure: true,
    bloodSugar: true,
    doctor: true,
    system: false
  })

  const handleBasicInfoSubmit = async (values) => {
    try {
      message.loading({ content: '正在保存...', key: 'save' })
      
      const updatedUser = { ...user, ...values, avatar }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setTimeout(() => {
        message.success({ content: '个人信息保存成功！', key: 'save' })
      }, 500)
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handlePasswordSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    
    message.loading({ content: '正在修改密码...', key: 'password' })
    
    setTimeout(() => {
      message.success({ content: '密码修改成功！', key: 'password' })
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    }, 800)
  }

  const handleNotificationChange = (key, checked) => {
    setNotifications({ ...notifications, [key]: checked })
    message.success('设置已保存')
  }

  const handleAvatarUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newAvatar = e.target.result
      setAvatar(newAvatar)
      
      const updatedUser = { ...user, avatar: newAvatar }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      message.success('头像上传成功！')
    }
    reader.readAsDataURL(file)
    return false
  }

  const renderBasicInfo = () => (
    <Card title="基本信息">
      <Form
        form={basicForm}
        layout="vertical"
        initialValues={{
          username: user.username,
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || 'male',
          birthday: user.birthday || ''
        }}
        onFinish={handleBasicInfoSubmit}
      >
        <Row gutter={24}>
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Upload
              showUploadList={false}
              beforeUpload={handleAvatarUpload}
              accept="image/*"
            >
              <div style={{ cursor: 'pointer' }}>
                <Avatar
                  size={120}
                  icon={avatar ? null : <UserOutlined />}
                  src={avatar}
                  style={{ backgroundColor: '#1890ff', fontSize: '48px' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Button type="link" icon={<CameraOutlined />}>
                    更换头像
                  </Button>
                </div>
              </div>
            </Upload>
          </Col>
          <Col xs={24} sm={16}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="full_name"
                  label="真实姓名"
                >
                  <Input placeholder="请输入真实姓名" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="gender"
                  label="性别"
                >
                  <Select options={[
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' }
                  ]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="birthday"
                  label="出生日期"
                >
                  <Input placeholder="请输入出生日期" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="电子邮箱"
                  rules={[
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input placeholder="请输入电子邮箱" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="联系电话"
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存修改
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )

  const renderPassword = () => (
    <Card title="修改密码">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card type="inner" style={{ background: '#fafafa' }}>
          <Space>
            <LockOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <div>
              <Text strong>安全提示</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                为了您的账户安全，建议定期更换密码，并使用复杂的密码组合
              </Text>
            </div>
          </Space>
        </Card>
        <Form
          layout="vertical"
          style={{ maxWidth: 500 }}
          form={passwordForm}
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位）" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[{ required: true, message: '请确认新密码' }]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  )

  const renderNotifications = () => (
    <Card title="通知设置">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card type="inner">
          <Row justify="space-between" align="middle">
            <Space>
              <BellOutlined style={{ color: '#1890ff' }} />
              <div>
                <Text strong>用药提醒</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  按时提醒您服用药物
                </Text>
              </div>
            </Space>
            <Switch
              checked={notifications.medicine}
              onChange={(checked) => handleNotificationChange('medicine', checked)}
            />
          </Row>
        </Card>
        <Card type="inner">
          <Row justify="space-between" align="middle">
            <Space>
              <BellOutlined style={{ color: '#fa8c16' }} />
              <div>
                <Text strong>血压提醒</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  提醒您定期测量血压
                </Text>
              </div>
            </Space>
            <Switch
              checked={notifications.bloodPressure}
              onChange={(checked) => handleNotificationChange('bloodPressure', checked)}
            />
          </Row>
        </Card>
        <Card type="inner">
          <Row justify="space-between" align="middle">
            <Space>
              <BellOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong>血糖提醒</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  提醒您定期测量血糖
                </Text>
              </div>
            </Space>
            <Switch
              checked={notifications.bloodSugar}
              onChange={(checked) => handleNotificationChange('bloodSugar', checked)}
            />
          </Row>
        </Card>
        <Card type="inner">
          <Row justify="space-between" align="middle">
            <Space>
              <BellOutlined style={{ color: '#722ed1' }} />
              <div>
                <Text strong>医生通知</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  接收医生的健康建议和预约通知
                </Text>
              </div>
            </Space>
            <Switch
              checked={notifications.doctor}
              onChange={(checked) => handleNotificationChange('doctor', checked)}
            />
          </Row>
        </Card>
        <Card type="inner">
          <Row justify="space-between" align="middle">
            <Space>
              <BellOutlined style={{ color: '#8c8c8c' }} />
              <div>
                <Text strong>系统通知</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  接收系统更新和维护通知
                </Text>
              </div>
            </Space>
            <Switch
              checked={notifications.system}
              onChange={(checked) => handleNotificationChange('system', checked)}
            />
          </Row>
        </Card>
      </Space>
    </Card>
  )

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>个人设置</Title>
        <Button type="link" icon={<HomeOutlined />} onClick={() => navigate('/dashboard')}>
          返回首页
        </Button>
      </div>
      
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type={activeTab === 'basic' ? 'primary' : 'text'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
                icon={<UserOutlined />}
                onClick={() => setActiveTab('basic')}
              >
                基本信息
              </Button>
              <Button 
                type={activeTab === 'password' ? 'primary' : 'text'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
                icon={<LockOutlined />}
                onClick={() => setActiveTab('password')}
              >
                修改密码
              </Button>
              <Button 
                type={activeTab === 'notifications' ? 'primary' : 'text'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
                icon={<BellOutlined />}
                onClick={() => setActiveTab('notifications')}
              >
                通知设置
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={18}>
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'password' && renderPassword()}
          {activeTab === 'notifications' && renderNotifications()}
        </Col>
      </Row>
    </div>
  )
}

export default PersonalSettings
