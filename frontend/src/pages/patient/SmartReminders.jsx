import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  List,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Checkbox,
  Switch,
  message,
  Statistic,
  Badge,
  Dropdown,
  Menu
} from 'antd'
import {
  HomeOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { Option } = Select

function SmartReminders() {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [reminderType, setReminderType] = useState('medication')
  const [editingReminder, setEditingReminder] = useState(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [currentTime, setCurrentTime] = useState(new Date())
  // 从localStorage加载提醒数据，如果没有则使用默认数据
  const [reminders, setReminders] = useState(() => {
    const savedReminders = localStorage.getItem('smart_reminders')
    if (savedReminders) {
      try {
        return JSON.parse(savedReminders)
      } catch (error) {
        console.error('解析提醒数据失败:', error)
      }
    }
    // 默认提醒数据
    return [
      {
        id: 1,
        type: 'medication',
        title: '服用降压药',
        time: '08:00',
        date: '每天',
        status: 'pending',
        description: '硝苯地平缓释片，1片',
        isRepeat: true
      },
      {
        id: 2,
        type: 'medication',
        title: '服用降糖药',
        time: '12:00',
        date: '每天',
        status: 'completed',
        description: '二甲双胍，1片',
        isRepeat: true
      },
      {
        id: 3,
        type: 'checkup',
        title: '年度体检',
        time: '09:00',
        date: '2024-02-20',
        status: 'upcoming',
        description: '市第一人民医院',
        isRepeat: false
      },
      {
        id: 4,
        type: 'task',
        title: '散步30分钟',
        time: '18:00',
        date: '每天',
        status: 'pending',
        description: '健康运动任务',
        isRepeat: true
      },
      {
        id: 5,
        type: 'checkup',
        title: '复查',
        time: '14:00',
        date: '2024-03-15',
        status: 'upcoming',
        description: '心内科，张医生',
        isRepeat: false
      }
    ]
  })

  const handleAddReminder = () => {
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const newReminder = {
        id: Date.now(),
        type: values.type,
        title: values.title,
        time: values.time ? values.time.format('HH:mm') : '08:00',
        date: values.date ? values.date.format('YYYY-MM-DD') : '每天',
        status: 'pending',
        description: values.description || '',
        isRepeat: values.repeat || false // 添加重复提醒标记
      }
      setReminders(prev => {
        const updatedReminders = [...prev, newReminder]
        // 保存到localStorage
        localStorage.setItem('smart_reminders', JSON.stringify(updatedReminders))
        return updatedReminders
      })
      message.success('提醒添加成功！')
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Failed to add reminder:', error)
      message.error('添加失败')
    }
  }

  const handleComplete = (id) => {
    setReminders(prev => {
      const updatedReminders = prev.map(item => 
        item.id === id ? { ...item, status: 'completed' } : item
      )
      // 保存到localStorage
      localStorage.setItem('smart_reminders', JSON.stringify(updatedReminders))
      return updatedReminders
    })
    message.success('已完成！')
  }

  // 检查是否应该显示完成按钮（当前时间 >= 提醒时间）
  const shouldShowCompleteButton = (reminder) => {
    if (reminder.status !== 'pending') return false
    
    const now = currentTime
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // 解析提醒时间
    const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number)
    
    // 判断当前时间是否 >= 提醒时间
    if (currentHour > reminderHour) {
      return true
    } else if (currentHour === reminderHour && currentMinute >= reminderMinute) {
      return true
    }
    
    return false
  }

  // 获取提醒状态文本
  const getReminderStatusText = (reminder) => {
    if (reminder.status === 'completed') return '已完成'
    if (reminder.status === 'upcoming') return '即将到来'
    
    if (shouldShowCompleteButton(reminder)) {
      return '待完成'
    } else {
      return '未开始'
    }
  }

  // 获取提醒状态颜色
  const getReminderStatusColor = (reminder) => {
    if (reminder.status === 'completed') return 'success'
    if (reminder.status === 'upcoming') return 'default'
    
    if (shouldShowCompleteButton(reminder)) {
      return 'processing'
    } else {
      return 'warning'
    }
  }

  // 检查并重置已完成的重复提醒
  const checkAndResetReminders = () => {
    setReminders(prev => {
      const now = new Date()
      const updatedReminders = prev.map(item => {
        // 只处理标记为重复且已完成的提醒
        if (item.isRepeat && item.status === 'completed') {
          // 检查是否已经过了一天（对于每天重复的提醒）
          // 这里简化处理，只要时间已经过了提醒时间，就重置为待完成
          const [reminderHour, reminderMinute] = item.time.split(':').map(Number)
          const currentHour = now.getHours()
          const currentMinute = now.getMinutes()
          
          // 如果当前时间已经过了提醒时间，重置为待完成
          if (currentHour > reminderHour || (currentHour === reminderHour && currentMinute >= reminderMinute)) {
            return { ...item, status: 'pending' }
          }
        }
        return item
      })
      
      // 检查是否有变化，如果有则保存到localStorage
      const hasChanges = JSON.stringify(updatedReminders) !== JSON.stringify(prev)
      if (hasChanges) {
        localStorage.setItem('smart_reminders', JSON.stringify(updatedReminders))
      }
      
      return updatedReminders
    })
  }

  // 设置定时器每分钟更新当前时间并检查提醒
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      checkAndResetReminders()
    }, 60000) // 每分钟更新一次

    return () => clearInterval(timer)
  }, [])

  const handleDelete = (id) => {
    setReminders(prev => {
      const updatedReminders = prev.filter(item => item.id !== id)
      // 保存到localStorage
      localStorage.setItem('smart_reminders', JSON.stringify(updatedReminders))
      return updatedReminders
    })
    message.success('已删除！')
  }

  const handleEdit = (item) => {
    setEditingReminder(item)
    editForm.setFieldsValue({
      type: item.type,
      title: item.title,
      description: item.description
    })
    setEditModalVisible(true)
  }

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields()
      setReminders(prev => {
        const updatedReminders = prev.map(item => 
          item.id === editingReminder.id 
            ? { 
                ...item, 
                type: values.type,
                title: values.title,
                description: values.description || ''
              }
            : item
        )
        // 保存到localStorage
        localStorage.setItem('smart_reminders', JSON.stringify(updatedReminders))
        return updatedReminders
      })
      message.success('修改成功！')
      setEditModalVisible(false)
      editForm.resetFields()
    } catch (error) {
      console.error('Failed to edit reminder:', error)
      message.error('修改失败')
    }
  }

  const getMenuItems = (item) => {
    const items = []
    items.push({
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => handleEdit(item)
    })
    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(item.id)
    })
    return items
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'medication': return <MedicineBoxOutlined />
      case 'checkup': return <CalendarOutlined />
      case 'task': return <CheckCircleOutlined />
      default: return <BellOutlined />
    }
  }

  const getTypeColor = (type) => {
    switch(type) {
      case 'medication': return 'blue'
      case 'checkup': return 'orange'
      case 'task': return 'green'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'processing'
      case 'completed': return 'success'
      case 'upcoming': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return '待完成'
      case 'completed': return '已完成'
      case 'upcoming': return '即将到来'
      default: return ''
    }
  }

  const pendingCount = reminders.filter(r => r.status === 'pending' && shouldShowCompleteButton(r)).length
  const completedCount = reminders.filter(r => r.status === 'completed').length
  const upcomingCount = reminders.filter(r => r.status === 'upcoming' || (r.status === 'pending' && !shouldShowCompleteButton(r))).length

  return (
    <div style={{ background: 'transparent' }}>
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0 }}>
              <BellOutlined style={{ marginRight: 8 }} />
              智能提醒
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddReminder}>
              添加提醒
            </Button>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="待完成"
                  value={pendingCount}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="已完成"
                  value={completedCount}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="即将到来"
                  value={upcomingCount}
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="提醒列表">
            <List
              itemLayout="horizontal"
              dataSource={reminders}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    shouldShowCompleteButton(item) && (
                      <Button type="primary" size="small" onClick={() => handleComplete(item.id)}>
                        完成
                      </Button>
                    ),
                    <Dropdown 
                      menu={{ items: getMenuItems(item) }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge status={getReminderStatusColor(item)}>
                        <div style={{ 
                          fontSize: 24, 
                          color: getTypeColor(item.type) === 'blue' ? '#1890ff' : 
                                 getTypeColor(item.type) === 'green' ? '#52c41a' : '#fa8c16'
                        }}>
                          {getTypeIcon(item.type)}
                        </div>
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
                        <Tag color={getTypeColor(item.type)}>
                          {item.type === 'medication' ? '用药' : item.type === 'checkup' ? '体检' : '任务'}
                        </Tag>
                        <Tag color={getReminderStatusColor(item)}>
                          {getReminderStatusText(item)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">{item.description}</Text>
                        <Space>
                          <ClockCircleOutlined />
                          <Text>{item.time}</Text>
                          <CalendarOutlined />
                          <Text>{item.date}</Text>
                          {item.status === 'pending' && !shouldShowCompleteButton(item) && (
                            <Tag color="orange">将在 {item.time} 开始</Tag>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>

      <Modal
        title="添加提醒"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="提醒类型"
            rules={[{ required: true, message: '请选择提醒类型' }]}
          >
            <Select onChange={setReminderType}>
              <Option value="medication">用药提醒</Option>
              <Option value="checkup">体检提醒</Option>
              <Option value="task">健康任务</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="提醒标题"
            rules={[{ required: true, message: '请输入提醒标题' }]}
          >
            <Input placeholder={reminderType === 'medication' ? '例如：服用降压药' : 
                           reminderType === 'checkup' ? '例如：年度体检' : '例如：散步30分钟'} />
          </Form.Item>
          <Form.Item
            name="description"
            label="详细说明"
          >
            <Input.TextArea placeholder="请输入详细说明" rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="时间"
                rules={[{ required: true, message: '请选择时间' }]}
              >
                <TimePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="repeat" valuePropName="checked" label="重复提醒">
            <Checkbox>每天重复</Checkbox>
          </Form.Item>
          {reminderType === 'medication' && (
            <>
              <Form.Item
                name="dosage"
                label="剂量"
              >
                <Input placeholder="例如：1片" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="启用提醒"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑提醒"
        open={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setEditModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="type"
            label="提醒类型"
            rules={[{ required: true, message: '请选择提醒类型' }]}
          >
            <Select>
              <Option value="medication">用药提醒</Option>
              <Option value="checkup">体检提醒</Option>
              <Option value="task">健康任务</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="提醒标题"
            rules={[{ required: true, message: '请输入提醒标题' }]}
          >
            <Input placeholder="请输入提醒标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="详细说明"
          >
            <Input.TextArea placeholder="请输入详细说明" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SmartReminders
