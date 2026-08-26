import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  List,
  Avatar,
  Tabs,
  Tag,
  message,
  Spin,
  Modal
} from 'antd'
import {
  HomeOutlined,
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { dataStore } from '../../services/dataStore'
import { aiApi, authApi, messageApi, doctorPatientApi } from '../../services/api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

function HealthConsultation() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ai')
  const [inputText, setInputText] = useState('')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [patientId, setPatientId] = useState(null) // 从用户信息动态获取患者ID
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  console.log('Patient user info:', user)
  console.log('Patient ID:', patientId)
  
  // 清除旧的本地存储数据
  const clearOldStorage = () => {
    // 清除旧的消息存储
    const patientIdNum = patientId
    if (patientIdNum) {
      localStorage.removeItem(`ai_messages_${patientIdNum}`)
      localStorage.removeItem(`doctor_messages_${patientIdNum}`)
      console.log('已清除旧的消息存储')
    }
    // 清除dataStore中的会话数据
    const conversations = localStorage.getItem('conversations')
    if (conversations) {
      localStorage.removeItem('conversations')
      console.log('已清除旧的会话数据')
    }
  }

  // 检查登录状态并自动登录
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token || !user.id) {
        // 尝试自动登录
        setIsLoggingIn(true)
        try {
          const result = await authApi.login({ username: 'patientlisi', password: 'password123' })
          localStorage.setItem('token', result.access_token)
          
          // 从token中解码用户信息
          const tokenPayload = JSON.parse(atob(result.access_token.split('.')[1]))
          const userInfo = {
            id: parseInt(tokenPayload.sub),
            username: tokenPayload.username,
            role: tokenPayload.role
          }
          localStorage.setItem('user', JSON.stringify(userInfo))
          setUser(userInfo)
          setPatientId(parseInt(tokenPayload.sub))
          message.success('自动登录成功')
        } catch (error) {
          console.error('自动登录失败:', error)
          message.error('登录失败，请重新登录')
          navigate('/login')
        } finally {
          setIsLoggingIn(false)
        }
      } else {
        // 已登录状态，设置patientId
        setPatientId(parseInt(user.id))
      }
    }
    
    checkLoginStatus()
  }, [navigate, user.id])

  // 组件加载时清除旧的存储数据
  useEffect(() => {
    if (patientId) {
      clearOldStorage()
    }
  }, [patientId])
  
  const mockDoctors = [
    {
      id: 1,
      name: '张医生',
      title: '心内科主任医师',
      hospital: '市第一人民医院',
      online: true,
      avatar: null
    },
    {
      id: 2,
      name: '李医生',
      title: '内分泌科副主任医师',
      hospital: '市第一人民医院',
      online: false,
      avatar: null
    }
  ]
  
  const [doctors, setDoctors] = useState([])
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [doctorRequests, setDoctorRequests] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [aiMessages, setAiMessages] = useState([
    {
      id: Date.now() + Math.random(),
      type: 'ai',
      content: '您好！我是您的AI健康助手。请问有什么可以帮助您的？'
    }
  ])
  const [doctorMessages, setDoctorMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [addDoctorModalVisible, setAddDoctorModalVisible] = useState(false)
  const [selectedDoctorToAdd, setSelectedDoctorToAdd] = useState(null)
  const aiChatRef = useRef(null)
  const doctorChatRef = useRef(null)

  const mockFaqs = [
    {
      id: 1,
      question: '高血压患者日常饮食需要注意什么？',
      answer: '高血压患者饮食应注意：1. 低盐饮食，每日钠摄入不超过5克；2. 多吃新鲜蔬果；3. 控制体重；4. 戒烟限酒；5. 适量运动。'
    },
    {
      id: 2,
      question: '血糖高可以吃水果吗？',
      answer: '可以，但要选择低GI（血糖生成指数）水果，如苹果、柚子、草莓等，建议在两餐之间食用，每次量不宜过多。'
    },
    {
      id: 3,
      question: '如何正确测量血压？',
      answer: '测量血压前应休息5-10分钟，保持安静，坐位测量，手臂与心脏同高，每次测量2-3次取平均值。'
    },
    {
      id: 4,
      question: '糖尿病患者运动有什么注意事项？',
      answer: '建议选择有氧运动如散步、游泳等，每周150分钟以上，避免空腹运动，运动前后监测血糖，随身携带糖果以防低血糖。'
    }
  ]

  // 加载医生消息
  const loadDoctorMessages = async () => {
    if (!selectedDoctor) return
    
    try {
      const patientIdNum = patientId // 使用实际的患者ID
      const doctorIdNum = selectedDoctor.id // 使用当前选择的医生ID
      console.log('Patient loading messages from API:', patientIdNum, doctorIdNum)
      const messages = await messageApi.getMessages(patientIdNum, doctorIdNum)
      console.log('API返回的消息:', messages)
      
      // 转换消息格式以适应前端显示
      const formattedMessages = messages.map(msg => ({
        type: msg.sender_type,
        content: msg.content
      }))
      
      if (formattedMessages.length > 0) {
        setDoctorMessages(formattedMessages)
      } else {
        // 如果没有消息，创建初始消息
        const initialMessage = {
          type: 'doctor',
          content: `您好，我是您的医生${selectedDoctor.name}。请问有什么可以帮助您的？`
        }
        setDoctorMessages([initialMessage])
      }
    } catch (error) {
      console.error('加载消息失败:', error)
      // 失败时回退到本地存储
      const patientIdNum = patientId
      const doctorIdNum = selectedDoctor.id
      const conversationKey = `${patientIdNum}_${doctorIdNum}`
      const savedMessages = dataStore.getMessages(conversationKey)
      if (savedMessages.length > 0) {
        setDoctorMessages(savedMessages)
      } else {
        const initialMessage = {
          type: 'doctor',
          content: `您好，我是您的医生${selectedDoctor.name}。请问有什么可以帮助您的？`
        }
        dataStore.sendMessage(conversationKey, initialMessage)
        setDoctorMessages([initialMessage])
      }
    }
  }

  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorMessages()
    }
  }, [selectedDoctor, patientId])

  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight
    }
    if (doctorChatRef.current) {
      doctorChatRef.current.scrollTop = doctorChatRef.current.scrollHeight
    }
  }, [aiMessages, doctorMessages])

  // 加载医生列表
  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true)
      const doctorsList = await doctorPatientApi.getMyDoctors()
      // 转换医生格式，确保与前端期望的格式一致
      const formattedDoctors = doctorsList.map(item => ({
        id: item.doctor.id,
        full_name: item.doctor.full_name,
        username: item.doctor.username,
        email: item.doctor.email
      }))
      setDoctors(formattedDoctors)
      if (formattedDoctors.length > 0 && !selectedDoctor) {
        setSelectedDoctor(formattedDoctors[0])
      }
    } catch (error) {
      console.error('加载医生列表失败:', error)
      // 失败时使用模拟数据
      setDoctors(mockDoctors)
      if (mockDoctors.length > 0 && !selectedDoctor) {
        setSelectedDoctor(mockDoctors[0])
      }
    } finally {
      setDoctorsLoading(false)
    }
  }

  // 加载医生请求
  const loadDoctorRequests = async () => {
    try {
      const requests = await doctorPatientApi.getDoctorRequests()
      setDoctorRequests(requests)
    } catch (error) {
      console.error('加载医生请求失败:', error)
    }
  }

  // 加载未添加的医生列表
  const loadAvailableDoctors = async () => {
    try {
      setDoctorsLoading(true)
      const doctorsList = await doctorPatientApi.getDoctors()
      setAvailableDoctors(doctorsList)
    } catch (error) {
      console.error('加载未添加医生列表失败:', error)
      message.error('加载医生列表失败')
    } finally {
      setDoctorsLoading(false)
    }
  }

  // 发送添加医生请求
  const sendDoctorRequest = async (doctorId) => {
    try {
      await doctorPatientApi.sendDoctorRequest(doctorId)
      message.success('添加医生请求已发送，等待医生确认')
      loadDoctorRequests()
      loadDoctors() // 重新加载已添加的医生列表
    } catch (error) {
      console.error('发送添加医生请求失败:', error)
      message.error('发送请求失败，请稍后重试')
    }
  }

  // 定期检查新消息
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadDoctorMessages()
    }, 5000) // 每5秒检查一次新消息

    // 清理定时器
    return () => {
      clearInterval(intervalId)
    }
  }, [patientId])

  // 初始化加载医生列表和请求
  useEffect(() => {
    loadDoctors()
    loadDoctorRequests()
  }, [])

  const sendAiMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now() + Math.random(),
      type: 'user',
      content: inputText
    }

    setAiMessages([...aiMessages, userMessage])
    setInputText('')
    setLoading(true)

    try {
      // 调用后端的健康问答API
      console.log('发送AI问题:', inputText)
      
      // 尝试发送请求
      let data
      try {
        data = await aiApi.healthQA(inputText)
      } catch (error) {
        // 如果是认证错误，尝试重新登录
        if (error.response && error.response.status === 401) {
          console.log('认证令牌过期，尝试重新登录...')
          const result = await authApi.login({ username: 'patient', password: 'password123' })
          localStorage.setItem('token', result.access_token)
          
          // 重新发送请求
          data = await aiApi.healthQA(inputText)
        } else {
          throw error
        }
      }
      
      console.log('API响应数据:', data)
      
      if (data.answer) {
        const aiResponse = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: data.answer
        }
        setAiMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error('API响应格式不正确')
      }
    } catch (error) {
      console.error('AI API调用失败:', error)
      const errorMessage = error.response?.data?.detail || error.message || '未知错误'
      
      const errorResponse = {
        id: Date.now() + Math.random(),
        type: 'ai',
        content: `抱歉，AI服务暂时不可用，请稍后再试。错误信息: ${errorMessage}`
      }
      setAiMessages(prev => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const sendDoctorMessage = async () => {
    if (!inputText.trim() || !selectedDoctor) return

    const userMessage = {
      type: 'patient',
      content: inputText
    }

    // 确保使用正确的患者ID和医生ID
    const patientIdNum = patientId // 使用实际的患者ID
    const doctorIdNum = selectedDoctor.id // 使用当前选择的医生ID
    
    try {
      // 发送消息到后端API
      console.log('Patient sending message to API:', patientIdNum, doctorIdNum, inputText)
      await messageApi.sendMessage({
        patient_id: patientIdNum,
        doctor_id: doctorIdNum,
        sender_type: 'patient',
        content: inputText
      })
      
      // 重新加载消息
      await loadDoctorMessages()
      setInputText('')
      message.success('消息已发送！医生会尽快回复您。')
    } catch (error) {
      console.error('发送消息失败:', error)
      // 失败时回退到本地存储
      const conversationKey = `${patientIdNum}_${doctorIdNum}`
      dataStore.sendMessage(conversationKey, userMessage)
      const updatedMessages = dataStore.getMessages(conversationKey)
      setDoctorMessages(updatedMessages)
      setInputText('')
      message.success('消息已发送！医生会尽快回复您。')
    }
  }

  const handleFaqClick = (faq) => {
    setInputText(faq.question)
    if (activeTab === 'ai') {
      sendAiMessage()
    }
  }

  return (
    <div style={{ background: 'transparent' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
            <QuestionCircleOutlined style={{ marginRight: 12 }} />
            健康咨询
          </Title>
          <Text type="secondary">专业的健康咨询服务，为您的健康保驾护航</Text>
        </div>

        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={6}>
            <Card 
              title="我的医生" 
              style={{ 
                marginBottom: 24, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: 12,
                overflow: 'hidden'
              }}
              headStyle={{ backgroundColor: '#f0f8ff' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={async () => {
                  await loadAvailableDoctors()
                  setAddDoctorModalVisible(true)
                }}
                style={{ 
                  marginBottom: 20, 
                  width: '100%',
                  borderRadius: 8,
                  height: 40
                }}
                ghost
              >
                添加医生
              </Button>
              <List
                itemLayout="horizontal"
                dataSource={doctors}
                loading={doctorsLoading}
                renderItem={(doctor) => (
                  <List.Item 
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedDoctor?.id === doctor.id ? '#e6f7ff' : 'transparent',
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginBottom: 8,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDoctor?.id !== doctor.id) {
                        e.currentTarget.style.backgroundColor = '#f0f8ff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDoctor?.id !== doctor.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{
                            backgroundColor: selectedDoctor?.id === doctor.id ? '#1890ff' : '#f0f0f0',
                            color: selectedDoctor?.id === doctor.id ? '#fff' : '#666'
                          }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 500, fontSize: '14px' }}>{doctor.full_name || doctor.name}</span>
                          {selectedDoctor?.id === doctor.id && (
                            <Tag color="blue" size="small" style={{ borderRadius: 10 }}>当前选择</Tag>
                          )}
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>{doctor.username}</Text>
                          <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 2 }}>{doctor.email}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
              {doctors.length === 0 && !doctorsLoading && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
                  <UserOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div style={{ fontSize: '14px' }}>暂无医生，请添加医生</div>
                </div>
              )}
            </Card>

            <Card 
              title="常见问题" 
              style={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: 12,
                overflow: 'hidden'
              }}
              headStyle={{ backgroundColor: '#f6ffed' }}
            >
              <div style={{ padding: '8px 0' }}>
                {mockFaqs.map((faq, index) => (
                  <div 
                    key={faq.id}
                    style={{
                      padding: '12px 16px',
                      marginBottom: index < mockFaqs.length - 1 ? 8 : 0,
                      backgroundColor: '#fafafa',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                    onClick={() => handleFaqClick(faq)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <QuestionCircleOutlined style={{ 
                        fontSize: '12px', 
                        color: '#1890ff', 
                        marginRight: 8, 
                        flexShrink: 0 
                      }} />
                      <Text style={{ fontSize: '13px', lineHeight: 1.4 }} ellipsis>
                        {faq.question}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={18}>
            <Card 
              style={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'ai',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
                        <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <span style={{ fontWeight: 500 }}>AI健康助手</span>
                      </div>
                    ),
                  },
                  {
                    key: 'doctor',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
                        <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        <span style={{ fontWeight: 500 }}>医生咨询</span>
                      </div>
                    ),
                  },
                ]}
                style={{ marginBottom: 20 }}
                tabBarStyle={{ borderRadius: 8, overflow: 'hidden' }}
                activeTabStyle={{ backgroundColor: '#f0f8ff' }}
              />

              <div 
                style={{ 
                  height: 500, 
                  overflowY: 'auto', 
                  marginBottom: 20,
                  padding: '16px',
                  background: '#fafafa',
                  borderRadius: 8
                }} 
                ref={activeTab === 'ai' ? aiChatRef : doctorChatRef}
              >
                <List
                  dataSource={activeTab === 'ai' ? aiMessages : doctorMessages}
                  renderItem={(msg) => {
                    const isUser = msg.type === 'user' || msg.type === 'patient'
                    return (
                      <List.Item 
                        style={{ 
                          justifyContent: isUser ? 'flex-end' : 'flex-start',
                          padding: '12px 0'
                        }}
                      >
                        <div style={{ 
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: isUser ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: 12
                        }}>
                          <Avatar 
                            size="small"
                            icon={msg.type === 'ai' ? <RobotOutlined /> : 
                                  msg.type === 'doctor' ? <UserOutlined /> : <UserOutlined />}
                            style={{ 
                              backgroundColor: msg.type === 'ai' ? '#1890ff' : 
                                           msg.type === 'doctor' ? '#52c41a' : '#fa8c16',
                              color: '#fff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <div style={{ 
                            background: isUser ? '#e6f7ff' : '#ffffff',
                            color: '#333',
                            padding: '16px 20px',
                            borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            position: 'relative',
                            animation: 'fadeIn 0.3s ease'
                          }}>
                            <Text style={{ lineHeight: 1.5 }}>{msg.content}</Text>
                          </div>
                        </div>
                      </List.Item>
                    )
                  }}
                />
                {loading && (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spin size="small" />
                    <Text type="secondary" style={{ marginLeft: 12 }}>AI正在思考...</Text>
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: 12,
                padding: '0 16px 16px'
              }}>
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      activeTab === 'ai' ? sendAiMessage() : sendDoctorMessage()
                    }
                  }}
                  placeholder="请输入您的问题..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ 
                    flex: 1,
                    borderRadius: 8,
                    borderColor: '#d9d9d9',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1890ff'
                    e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d9d9d9'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    activeTab === 'ai' ? sendAiMessage() : sendDoctorMessage()
                  }}
                  disabled={loading || !inputText.trim()}
                  style={{
                    height: 'auto',
                    alignSelf: 'flex-end',
                    padding: '0 24px',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
                  }}
                >
                  发送
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 添加医生模态框 */}
        <Modal
          title="添加医生"
          open={addDoctorModalVisible}
          onCancel={() => setAddDoctorModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setAddDoctorModalVisible(false)}>
              取消
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={() => {
                if (selectedDoctorToAdd) {
                  sendDoctorRequest(selectedDoctorToAdd.id)
                  setAddDoctorModalVisible(false)
                }
              }}
              disabled={!selectedDoctorToAdd}
            >
              发送请求
            </Button>
          ]}
          width={600}
          style={{ borderRadius: 12 }}
        >
          <List
            itemLayout="horizontal"
            dataSource={availableDoctors}
            loading={doctorsLoading}
            renderItem={(doctor) => (
              <List.Item 
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedDoctorToAdd?.id === doctor.id ? '#e6f7ff' : 'transparent',
                  borderRadius: 8,
                  padding: '16px',
                  marginBottom: 8,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedDoctorToAdd?.id !== doctor.id) {
                    e.currentTarget.style.backgroundColor = '#f0f8ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDoctorToAdd?.id !== doctor.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
                onClick={() => setSelectedDoctorToAdd(doctor)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{
                        backgroundColor: selectedDoctorToAdd?.id === doctor.id ? '#1890ff' : '#f0f0f0',
                        color: selectedDoctorToAdd?.id === doctor.id ? '#fff' : '#666'
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{doctor.full_name || doctor.name}</span>
                      {selectedDoctorToAdd?.id === doctor.id && (
                        <Tag color="blue" size="small" style={{ borderRadius: 10 }}>已选择</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>{doctor.username}</Text>
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 2 }}>{doctor.email}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          {availableDoctors.length === 0 && !doctorsLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <UserOutlined style={{ fontSize: 32, marginBottom: 12 }} />
              <div style={{ fontSize: '14px' }}>暂无可用医生</div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default HealthConsultation
