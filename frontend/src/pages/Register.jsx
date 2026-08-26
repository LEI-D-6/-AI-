import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Alert, Typography, Select } from 'antd'
import { UserOutlined, LockOutlined, MedicineBoxOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { authApi } from '../services/api'

const { Title, Text } = Typography
const { Option } = Select

function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const [form] = Form.useForm()
  
  const onFinish = async (values) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('Sending registration data:', values)
      const result = await authApi.register(values)
      console.log('Registration successful:', result)
      setSuccess('注册成功，请登录')
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      console.error('Registration error:', err)
      let errorMsg = '注册失败，请稍后重试'
      if (err.response && err.response.data) {
        errorMsg = err.response.data.detail || JSON.stringify(err.response.data)
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: 'url("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20medical%20hospital%20interior%20with%20clean%20white%20walls%20and%20medical%20equipment%2C%20professional%20healthcare%20environment&image_size=landscape_16_9")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      {/* 半透明遮罩 */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(255, 255, 255, 0.7)'
      }}></div>
      
      {/* 注册卡片 */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Card 
          style={{ 
            width: 450, 
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MedicineBoxOutlined style={{ fontSize: 40, color: '#1890ff', marginRight: 12 }} />
              <div>
                <Title level={3} style={{ margin: 0, fontSize: '24px' }}>慢性病智能管理系统</Title>
                <Text style={{ color: '#666' }}>用户注册</Text>
              </div>
            </div>
          </div>
          
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}
          
          {success && (
            <Alert message={success} type="success" showIcon style={{ marginBottom: 16 }} />
          )}
          
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名！' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码！' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true, message: '请输入邮箱！' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="电话"
              rules={[{ required: true, message: '请输入电话！' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="请输入电话" />
            </Form.Item>
            
            <Form.Item
              name="full_name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名！' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
            
            <Form.Item
              name="role"
              label="用户角色"
              rules={[{ required: true, message: '请选择用户角色！' }]}
            >
              <Select placeholder="请选择用户角色">
                <Option value="patient">患者</Option>
                <Option value="doctor">医生</Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                注册
              </Button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                已有账号？ <a href="/login">立即登录</a>
              </div>
            </Form.Item>
          </Form>
          
          {/* 版权信息 */}
          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Text style={{ color: '#999', fontSize: '12px' }}>
              Copyright © 2026 慢性病智能管理系统
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register