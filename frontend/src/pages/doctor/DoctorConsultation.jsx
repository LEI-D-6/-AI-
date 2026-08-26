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
  Tag,
  message,
  Badge,
  Spin
} from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  SendOutlined,
  MessageOutlined,
  WechatOutlined
} from '@ant-design/icons'
import { dataStore } from '../../services/dataStore'
import { messageApi, doctorPatientApi } from '../../services/api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { TextArea } = Input

function DoctorConsultation() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [doctorId] = useState(parseInt(user.id) || 1) // 从登录信息获取医生ID，确保是整数类型
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  // 加载患者列表
  const loadPatients = async () => {
    try {
      setLoading(true)
      const patientsData = await doctorPatientApi.getMyPatients()
      console.log('API返回的患者数据:', patientsData)
      const formattedPatients = patientsData.map(patient => ({
        id: patient.id,
        name: patient.full_name || patient.name,
        diagnosis: patient.diagnosis || '未诊断',
        online: Math.random() > 0.5 // 随机生成在线状态
      }))
      setPatients(formattedPatients)
      if (formattedPatients.length > 0) {
        setSelectedPatientId(formattedPatients[0].id)
      }
    } catch (error) {
      console.error('加载患者列表失败:', error)
      message.error('加载患者列表失败')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载患者列表
  useEffect(() => {
    loadPatients()
  }, [])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    if (selectedPatientId) {
      loadMessages(selectedPatientId)
    }
  }, [selectedPatientId])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // 定期检查新消息
  useEffect(() => {
    if (!selectedPatientId) return
    
    const intervalId = setInterval(() => {
      loadMessages(selectedPatientId)
    }, 5000) // 每5秒检查一次新消息

    // 清理定时器
    return () => {
      clearInterval(intervalId)
    }
  }, [selectedPatientId])

  // 加载消息
  const loadMessages = async (patientId) => {
    try {
      // 确保使用正确的患者ID和医生ID
      const patientIdNum = patientId // 使用实际的患者ID
      const doctorIdNum = doctorId // 使用实际的医生ID
      const messages = await messageApi.getMessages(patientIdNum, doctorIdNum)
      
      // 转换消息格式以适应前端显示
      const formattedMessages = messages.map(msg => ({
        type: msg.sender_type,
        content: msg.content
      }))
      
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages)
      } else {
        // 如果没有消息，创建初始消息
        const initialMessage = {
          type: 'doctor',
          content: `您好，我是您的签约医生。请问有什么可以帮助您的？`
        }
        setMessages([initialMessage])
      }
    } catch (error) {
      // 失败时回退到本地存储
      const patientIdNum = patientId
      const doctorIdNum = doctorId
      const conversationKey = `${patientIdNum}_${doctorIdNum}`
      const savedMessages = dataStore.getMessages(conversationKey)
      if (savedMessages.length > 0) {
        setMessages(savedMessages)
      } else {
        const initialMessage = {
          type: 'doctor',
          content: `您好，我是您的签约医生。请问有什么可以帮助您的？`
        }
        dataStore.sendMessage(conversationKey, initialMessage)
        setMessages([initialMessage])
      }
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedPatientId) return

    const doctorMessage = {
      type: 'doctor',
      content: inputText
    }

    // 确保使用正确的患者ID和医生ID
    const patientIdNum = selectedPatientId // 使用实际的患者ID
    const doctorIdNum = doctorId // 使用实际的医生ID
    
    try {
      // 发送消息到后端API
      await messageApi.sendMessage({
        patient_id: patientIdNum,
        doctor_id: doctorIdNum,
        sender_type: 'doctor',
        content: inputText
      })
      
      // 重新加载消息
      await loadMessages(selectedPatientId)
      setInputText('')
      message.success('消息已发送！')
    } catch (error) {
      // 失败时回退到本地存储
      const conversationKey = `${patientIdNum}_${doctorIdNum}`
      dataStore.sendMessage(conversationKey, doctorMessage)
      const updatedMessages = dataStore.getMessages(conversationKey)
      setMessages(updatedMessages)
      setInputText('')
      message.success('消息已发送！')
    }
  }

  // 获取未读消息数
  const getUnreadCount = async (patientId) => {
    try {
      // 确保使用正确的患者ID和医生ID
      const patientIdNum = patientId // 使用实际的患者ID
      const doctorIdNum = doctorId // 使用实际的医生ID
      const response = await messageApi.getUnreadCount(patientIdNum, doctorIdNum)
      return response.unread_count
    } catch (error) {
      // 失败时回退到本地存储
      const patientIdNum = patientId
      const doctorIdNum = doctorId
      const conversationKey = `${patientIdNum}_${doctorIdNum}`
      const msgs = dataStore.getMessages(conversationKey)
      return msgs.filter(m => m.type === 'patient' && !m.read).length
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            <WechatOutlined style={{ marginRight: 8 }} />
            患者咨询
          </Title>
          <Text type="secondary">与您的患者进行在线沟通</Text>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={6}>
          <Card title="患者列表">
            <Spin spinning={loading} tip="加载患者列表中...">
              {patients.length > 0 ? (
                <List
                  dataSource={patients}
                  renderItem={(patient) => (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedPatientId === patient.id ? '#e6f7ff' : 'transparent',
                        borderRadius: 8,
                        marginBottom: 8
                      }}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text strong>{patient.name}</Text>
                            {getUnreadCount(patient.id) > 0 && (
                              <Badge count={getUnreadCount(patient.id)} color="#ff4d4f" />
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{patient.diagnosis}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">暂无患者</Text>
                </div>
              )}
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          {selectedPatientId ? (
            <Card
              title={
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <Text strong>{patients.find(p => p.id === selectedPatientId)?.name}</Text>
                </Space>
              }
            >
              <div style={{ height: 400, overflowY: 'auto', marginBottom: 16, background: '#fafafa', padding: 16, borderRadius: 8 }} ref={chatRef}>
                <List
                  dataSource={messages}
                  renderItem={(msg) => {
                    const isDoctor = msg.type === 'doctor'
                    return (
                      <List.Item style={{ 
                        justifyContent: isDoctor ? 'flex-end' : 'flex-start',
                        padding: '8px 0'
                      }}>
                        <div style={{ 
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: isDoctor ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: 8
                        }}>
                          <Avatar 
                            size="small"
                            icon={<UserOutlined />}
                            style={{ 
                              backgroundColor: isDoctor ? '#52c41a' : '#fa8c16'
                            }}
                          />
                          <div style={{ 
                            background: isDoctor ? '#95e195' : '#ffffff',
                            color: isDoctor ? '#000000' : '#000000',
                            padding: '12px 16px',
                            borderRadius: isDoctor ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            position: 'relative',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            <Text style={{ color: isDoctor ? '#000000' : '#000000' }}>{msg.content}</Text>
                          </div>
                        </div>
                      </List.Item>
                    )
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="请输入您的回复..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                >
                  发送
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 8 }}>
                <Text type="secondary">请从左侧选择一个患者开始咨询</Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default DoctorConsultation