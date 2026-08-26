import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Space,
  Avatar,
  Tag,
  Input,
  Select,
  Table,
  Badge,
  Statistic,
  Progress,
  message,
  Modal,
  Form,
  DatePicker,
  List,
  Descriptions,
  Spin
} from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { doctorPatientApi, patientApi, treatmentApi } from '../../services/api'

const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { Search } = Input

function MyPatients() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isRequestsModalVisible, setIsRequestsModalVisible] = useState(false)
  const [isPatientDetailModalVisible, setIsPatientDetailModalVisible] = useState(false)
  const [isMedicalRecordsModalVisible, setIsMedicalRecordsModalVisible] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientMedicalRecords, setPatientMedicalRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [doctorRequests, setDoctorRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [form] = Form.useForm()
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [imageScale, setImageScale] = useState(1)
  const [prevStats, setPrevStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    needsAttention: 0,
    highRisk: 0
  })
  const [statsWithChanges, setStatsWithChanges] = useState([])
  


  // 计算今日预约数量
  const calculateTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return patients.filter(patient => patient.next_appointment === today).length
  }

  // 更新统计数据并检测变化
  useEffect(() => {
    const todayAppointments = calculateTodayAppointments()
    const needsAttentionCount = patients.filter(p => p.status === 'needs_attention').length
    const highRiskCount = patients.filter(p => p.status === 'critical').length
    
    const newStats = {
      totalPatients: patients.length,
      todayAppointments,
      needsAttention: needsAttentionCount,
      highRisk: highRiskCount
    }
    
    // 检测变化并添加视觉反馈
    const statsWithChanges = [
      {
        title: '我的患者',
        value: newStats.totalPatients,
        icon: <UserOutlined />,
        color: '#1890ff',
        hasChanged: newStats.totalPatients !== prevStats.totalPatients,
        change: newStats.totalPatients - prevStats.totalPatients
      },
      {
        title: '今日预约',
        value: newStats.todayAppointments,
        icon: <CalendarOutlined />,
        color: '#52c41a',
        hasChanged: newStats.todayAppointments !== prevStats.todayAppointments,
        change: newStats.todayAppointments - prevStats.todayAppointments
      },
      {
        title: '需要关注',
        value: newStats.needsAttention,
        icon: <Badge status="warning" />,
        color: '#faad14',
        hasChanged: newStats.needsAttention !== prevStats.needsAttention,
        change: newStats.needsAttention - prevStats.needsAttention
      },
      {
        title: '高危患者',
        value: newStats.highRisk,
        icon: <Badge status="error" />,
        color: '#ff4d4f',
        hasChanged: newStats.highRisk !== prevStats.highRisk,
        change: newStats.highRisk - prevStats.highRisk
      }
    ]
    
    setStatsWithChanges(statsWithChanges)
    setPrevStats(newStats)
    
    // 重置变化状态，使动画效果只显示一段时间
    const timer = setTimeout(() => {
      setStatsWithChanges(prev => prev.map(stat => ({
        ...stat,
        hasChanged: false
      })))
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [patients, prevStats])

  // 加载患者列表
  const loadPatients = async () => {
    try {
      setLoading(true)
      const patientsData = await doctorPatientApi.getMyPatients()
      console.log('API返回的患者数据:', patientsData)
      // 确保数据格式正确
      const formattedPatients = patientsData.map(patient => ({
        id: patient.id,
        name: patient.full_name || patient.name,
        gender: patient.gender,
        age: patient.age,
        diagnosis: patient.diagnosis,
        last_visit: patient.last_visit,
        next_appointment: patient.next_appointment,
        status: patient.status,
        adherence: patient.adherence || 0,
        phone: patient.phone
      }))
      setPatients(formattedPatients)
    } catch (error) {
      console.error('加载患者列表失败:', error)
      message.error('加载患者列表失败')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  // 加载医生请求
  const loadDoctorRequests = async () => {
    try {
      setRequestsLoading(true)
      const requests = await doctorPatientApi.getDoctorRequests()
      console.log('API返回的医生请求数据:', requests)
      setDoctorRequests(requests || [])
    } catch (error) {
      console.error('加载医生请求失败:', error)
      message.error('加载请求失败')
      setDoctorRequests([])
    } finally {
      setRequestsLoading(false)
    }
  }

  // 处理医生请求
  const handleDoctorRequest = async (requestId, status) => {
    try {
      console.log('处理医生请求:', requestId, status)
      const result = await doctorPatientApi.updateDoctorRequest(requestId, status)
      console.log('处理医生请求结果:', result)
      message.success(status === 'accepted' ? '请求已接受' : '请求已拒绝')
      loadDoctorRequests()
      if (status === 'accepted') {
        console.log('接受请求后重新加载患者列表...')
        loadPatients() // 接受请求后重新加载患者列表
      }
    } catch (error) {
      console.error('处理医生请求失败:', error)
      message.error('处理请求失败')
    }
  }

  // 初始化加载患者列表和医生请求
  useEffect(() => {
    loadPatients()
    loadDoctorRequests()
  }, [])

  const handleAddPatient = () => {
    setIsAddModalVisible(true)
  }

  const handleAddPatientOk = async () => {
    form.validateFields().then(async (values) => {
      try {
        const patientData = {
          name: values.name,
          gender: values.gender,
          age: values.age,
          diagnosis: values.diagnosis,
          last_visit: values.lastVisit.format('YYYY-MM-DD'),
          next_appointment: values.nextAppointment.format('YYYY-MM-DD'),
          status: values.status,
          adherence: values.adherence || 0,
          phone: values.phone
        }
        await patientApi.createPatient(patientData)
        setIsAddModalVisible(false)
        form.resetFields()
        message.success('患者添加成功！')
        loadPatients() // 重新加载患者列表
      } catch (error) {
        console.error('添加患者失败:', error)
        message.error('添加患者失败')
      }
    }).catch(info => {
      console.error('Validation failed:', info)
    })
  }

  const handleAddPatientCancel = () => {
    setIsAddModalVisible(false)
    form.resetFields()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'green'
      case 'needs_attention': return 'gold'
      case 'critical': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'stable': return '病情稳定'
      case 'needs_attention': return '需要关注'
      case 'critical': return '高危'
      default: return '未知'
    }
  }

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setIsPatientDetailModalVisible(true)
  }

  const handleViewMedicalRecords = async (patient) => {
    setSelectedPatient(patient)
    setRecordsLoading(true)
    try {
      const response = await patientApi.getPatientMedicalRecords(patient.id)
      setPatientMedicalRecords(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('获取患者病历失败:', error)
      message.error('获取患者病历失败')
      setPatientMedicalRecords([])
    } finally {
      setRecordsLoading(false)
    }
    setIsMedicalRecordsModalVisible(true)
  }

  const handleCreateMedicalRecord = (patient) => {
    message.info(`为患者 ${patient.name} 创建病历`)
    navigate('/doctor/medical-records')
  }

  // 获取患者的用药计划
  const fetchMedicationPlans = async (patientId) => {
    try {
      const plans = await treatmentApi.getTreatmentPlans(patientId)
      setMedicationPlans(Array.isArray(plans) ? plans : [])
    } catch (error) {
      console.error('获取用药计划失败:', error)
      message.error('获取用药计划失败')
    }
  }

  // 跳转到用药计划页面
  const handleEditMedication = (patient) => {
    navigate(`/doctor/medication-plans/${patient.id}`)
  }



  // 处理图片点击
  const handleImageClick = (imagePath) => {
    setCurrentImage(imagePath)
    setImageScale(1)
    setImageModalVisible(true)
  }

  // 处理图片缩放
  const handleImageWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setImageScale(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                          patient.diagnosis?.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = !statusFilter || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      title: '患者',
      key: 'patient',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.gender === 'male' ? '男' : '女'} · {record.age}岁
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '用药依从性',
      key: 'adherence',
      render: (_, record) => (
        <Progress percent={record.adherence} size="small" />
      ),
    },
    {
      title: '上次就诊',
      dataIndex: 'last_visit',
      key: 'last_visit',
    },
    {
      title: '下次预约',
      dataIndex: 'next_appointment',
      key: 'next_appointment',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <span>{date}</span>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewPatient(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleViewMedicalRecords(record)}>
            病历
          </Button>
          <Button type="link" size="small" icon={<MedicineBoxOutlined />} onClick={() => handleEditMedication(record)}>
            修改用药计划
          </Button>
        </Space>
      ),
    },
  ]



  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>我的患者</Title>
          <Text type="secondary">管理您负责的患者，查看健康状态</Text>
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statsWithChanges.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card 
              style={{ 
                borderRadius: 8, 
                textAlign: 'center',
                transition: 'all 0.3s ease',
                transform: stat.hasChanged ? 'scale(1.05)' : 'scale(1)',
                boxShadow: stat.hasChanged ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.09)'
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color, fontSize: '28px' }}
                suffix={
                  stat.hasChanged && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                      color: stat.change > 0 ? '#52c41a' : '#ff4d4f'
                    }}>
                      {stat.change > 0 ? '+' : ''}{stat.change}
                    </span>
                  )
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索患者姓名或诊断"
              allowClear
              enterButton={<Button icon={<SearchOutlined />}>搜索</Button>}
              size="large"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: '100%' }}
              size="large"
              onChange={setStatusFilter}
              options={[
                { value: 'stable', label: '病情稳定' },
                { value: 'needs_attention', label: '需要关注' },
                { value: 'critical', label: '高危' }
              ]}
            />
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                onClick={handleAddPatient}
              >
                新增患者
              </Button>
              <Button 
                type="default" 
                size="large" 
                icon={<UserOutlined />} 
                onClick={() => setIsRequestsModalVisible(true)}
                badge={{ count: doctorRequests.filter(r => r.status === 'pending').length, offset: [0, 10] }}
              >
                患者请求
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredPatients}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      {/* 新增患者模态框 */}
      <Modal
        title="新增患者"
        open={isAddModalVisible}
        onOk={handleAddPatientOk}
        onCancel={handleAddPatientCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            gender: 'male',
            status: 'stable',
            adherence: 0
          }}
        >
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择患者性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                name="age"
                label="年龄"
                rules={[{ required: true, message: '请输入患者年龄' }]}
              >
                <Input type="number" placeholder="请输入患者年龄" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name="phone"
                label="电话"
                rules={[{ required: true, message: '请输入患者电话' }]}
              >
                <Input placeholder="请输入患者电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="diagnosis"
            label="诊断"
            rules={[{ required: true, message: '请输入患者诊断' }]}
          >
            <Input placeholder="请输入患者诊断" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                name="lastVisit"
                label="上次就诊"
                rules={[{ required: true, message: '请选择上次就诊日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name="nextAppointment"
                label="下次预约"
                rules={[{ required: true, message: '请选择下次预约日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择患者状态' }]}
              >
                <Select placeholder="请选择患者状态">
                  <Option value="stable">病情稳定</Option>
                  <Option value="needs_attention">需要关注</Option>
                  <Option value="critical">高危</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name="adherence"
                label="用药依从性"
                rules={[{ required: true, message: '请输入用药依从性' }]}
              >
                <Input type="number" min={0} max={100} placeholder="请输入用药依从性（0-100）" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 患者请求模态框 */}
      <Modal
        title="患者添加请求"
        open={isRequestsModalVisible}
        onCancel={() => setIsRequestsModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setIsRequestsModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <List
          itemLayout="vertical"
          dataSource={doctorRequests}
          loading={requestsLoading}
          renderItem={(request) => (
            <List.Item
              key={request.id}
              extra={
                request.status === 'pending' ? (
                  <Space>
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={() => handleDoctorRequest(request.id, 'accepted')}
                    >
                      接受
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleDoctorRequest(request.id, 'rejected')}
                    >
                      拒绝
                    </Button>
                  </Space>
                ) : (
                  <Tag color={request.status === 'accepted' ? 'green' : 'red'}>
                    {request.status === 'accepted' ? '已接受' : '已拒绝'}
                  </Tag>
                )
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={request.patient?.full_name || `患者 ${request.patient_id}`}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">请求时间: {new Date(request.created_at).toLocaleString()}</Text>
                    {request.patient?.email && <Text type="secondary">邮箱: {request.patient.email}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* 患者详情模态框 */}
      <Modal
        title="患者基本信息"
        open={isPatientDetailModalVisible}
        onCancel={() => setIsPatientDetailModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setIsPatientDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedPatient && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>{selectedPatient.name}</div>
            <div style={{ marginBottom: '8px' }}>
              <span>性别：</span>{selectedPatient.gender === 'male' ? '男' : '女'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>年龄：</span>{selectedPatient.age}岁
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>电话：</span>{selectedPatient.phone || '未填写'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>诊断：</span>{selectedPatient.diagnosis || '未填写'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>状态：</span>
              <Tag color={getStatusColor(selectedPatient.status)}>{getStatusText(selectedPatient.status)}</Tag>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>用药依从性：</span>
              <Progress percent={selectedPatient.adherence || 0} size="small" style={{ width: '100px', marginLeft: '8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>上次就诊：</span>{selectedPatient.last_visit || '未填写'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>下次预约：</span>{selectedPatient.next_appointment || '未填写'}
            </div>
          </div>
        )}
      </Modal>

      {/* 患者病历列表模态框 */}
      <Modal
        title={`${selectedPatient?.name || '患者'}的病历记录`}
        open={isMedicalRecordsModalVisible}
        onCancel={() => setIsMedicalRecordsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsMedicalRecordsModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Spin spinning={recordsLoading} tip="加载中...">
          <Table
            columns={[
              {
                title: '就诊日期',
                dataIndex: 'visit_date',
                key: 'visit_date',
                render: (date) => date ? new Date(date).toLocaleDateString() : '-'
              },
              {
                title: '科室',
                dataIndex: 'department',
                key: 'department'
              },
              {
                title: '诊断',
                dataIndex: 'diagnosis',
                key: 'diagnosis'
              },
              {
                title: '治疗方案',
                dataIndex: 'treatment_plan',
                key: 'treatment_plan',
                ellipsis: true
              },
              {
                title: '备注',
                dataIndex: 'notes',
                key: 'notes',
                ellipsis: true
              },
              {
                title: '图片',
                key: 'images',
                render: (_, record) => {
                  if (record.image_paths && record.image_paths.length > 0) {
                    return (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {record.image_paths.map((imagePath, index) => {
                          // 构建完整的图片URL，使用正确的端口8004
                          let fullImageUrl = imagePath
                          if (!fullImageUrl.startsWith('http')) {
                            // 确保路径以斜杠开头
                            if (!fullImageUrl.startsWith('/')) {
                              fullImageUrl = '/' + fullImageUrl
                            }
                            // 确保路径包含'uploads'前缀
                            if (!fullImageUrl.includes('/uploads/')) {
                              // 如果路径以'/medical_records'开头，添加'uploads'前缀
                              if (fullImageUrl.startsWith('/medical_records')) {
                                fullImageUrl = '/uploads' + fullImageUrl
                              } else if (!fullImageUrl.startsWith('/uploads')) {
                                // 其他情况，直接添加'uploads'前缀
                                fullImageUrl = '/uploads' + fullImageUrl
                              }
                            }
                            fullImageUrl = `http://localhost:8000${fullImageUrl}`
                          }
                          return (
                            <img
                              key={index}
                              src={fullImageUrl}
                              alt={`病历图片 ${index + 1}`}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleImageClick(fullImageUrl)}
                            />
                          )
                        })}
                      </div>
                    )
                  }
                  return '-'
                }
              }
            ]}
            dataSource={patientMedicalRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无病历记录' }}
          />
        </Spin>
      </Modal>

      {/* 图片查看模态框 */}
      <Modal
        title="病历图片"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setImageModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            overflow: 'auto',
            maxHeight: '600px',
            cursor: 'grab'
          }}
          onWheel={handleImageWheel}
        >
          <img
            src={currentImage}
            alt="放大图片"
            style={{
              transform: `scale(${imageScale})`,
              transition: 'transform 0.1s',
              objectFit: 'contain'
            }}
          />
        </div>
      </Modal>


    </div>
  )
}

export default MyPatients
