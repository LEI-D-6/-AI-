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
  DatePicker,
  Modal,
  Form,
  Input as AntInput,
  message,
  Descriptions,
  Divider,
  Statistic,
  Spin
} from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { medicalRecordsApi, patientApi } from '../../services/api'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { Search } = Input
const { TextArea } = AntInput

function MedicalRecords() {
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm] = Form.useForm()

  // 从API获取患者列表
  useEffect(() => {
    fetchPatients()
  }, [])

  // 从API获取病历数据
  const fetchMedicalRecords = async () => {
    setLoading(true)
    try {
      const response = await medicalRecordsApi.getRecords()
      setRecords(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('获取病历失败:', error)
      message.error('获取病历失败')
    } finally {
      setLoading(false)
    }
  }

  // 从API获取患者列表
  const fetchPatients = async () => {
    try {
      const response = await patientApi.getPatients()
      setPatients(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('获取患者列表失败:', error)
    }
  }

  // 组件挂载时获取病历数据
  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  const [searchText, setSearchText] = useState('')
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  const handleViewRecord = (record) => {
    setCurrentRecord(record)
    setViewModalVisible(true)
  }

  const handleEditRecord = (record) => {
    setCurrentRecord(record)
    editForm.setFieldsValue({
      treatment_plan: record.treatment_plan || ''
    })
    setEditModalVisible(true)
  }

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields()
      const updatedRecord = await medicalRecordsApi.updateRecord(currentRecord.id, {
        treatment_plan: values.treatment_plan
      })
      // 更新本地状态
      setRecords(records.map(record => 
        record.id === currentRecord.id ? { ...record, treatment_plan: values.treatment_plan } : record
      ))
      setEditModalVisible(false)
      message.success('治疗方案更新成功！患者端已同步。')
    } catch (error) {
      console.error('更新治疗方案失败:', error)
      message.error('更新治疗方案失败')
    }
  }

  const handleDeleteRecord = async (record) => {
    try {
      await medicalRecordsApi.deleteRecord(record.id)
      // 更新本地状态
      setRecords(records.filter(r => r.id !== record.id))
      message.success('病历删除成功！')
    } catch (error) {
      console.error('删除病历失败:', error)
      message.error('删除病历失败')
    }
  }



  const handleCreateRecord = () => {
    form.resetFields()
    setCreateModalVisible(true)
  }

  const handleCreateOk = async () => {
    try {
      const values = await form.validateFields()
      // 这里可以添加创建病历的API调用
      message.success('病历创建成功！患者端可同步查看。')
      setCreateModalVisible(false)
      // 重新获取病历列表
      fetchMedicalRecords()
    } catch (error) {
      message.error('创建失败')
    }
  }

  const filteredRecords = records.filter(record => {
    // 从患者列表中查找患者姓名
    const patient = patients.find(p => p.id === record.patient_id)
    const patientName = patient ? patient.full_name : `患者 ${record.patient_id}`
    const matchesSearch = patientName.toLowerCase().includes(searchText.toLowerCase()) ||
                          (record.diagnosis && record.diagnosis.toLowerCase().includes(searchText.toLowerCase()))
    return matchesSearch
  })

  const columns = [
    {
      title: '患者',
      key: 'patient',
      render: (_, record) => {
        const patient = patients.find(p => p.id === record.patient_id)
        const patientName = patient ? patient.full_name : `患者 ${record.patient_id}`
        return (
          <Space>
            <Avatar icon={<UserOutlined />} size="small" />
            <Text strong>{patientName}</Text>
          </Space>
        )
      },
    },
    {
      title: '就诊日期',
      dataIndex: 'visit_date',
      key: 'visit_date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <span>{date ? new Date(date).toLocaleDateString() : '-'}</span>
        </Space>
      ),
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
    },
    {
      title: '治疗方案',
      dataIndex: 'treatment_plan',
      key: 'treatment_plan',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewRecord(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditRecord(record)}>
            编辑治疗方案
          </Button>
        </Space>
      ),
    },
  ]

  // 计算今日新增和本月就诊数量
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)
  
  const todayRecords = records.filter(record => {
    const recordDate = new Date(record.created_at || record.visit_date)
    return recordDate >= today
  })
  
  const thisMonthRecords = records.filter(record => {
    const recordDate = new Date(record.created_at || record.visit_date)
    return recordDate >= firstDayOfMonth
  })
  
  const stats = [
    { title: '总病历数', value: records.length, icon: <FileTextOutlined />, color: '#1890ff' },
    { title: '今日新增', value: todayRecords.length, icon: <PlusOutlined />, color: '#52c41a' },
    { title: '本月就诊', value: thisMonthRecords.length, icon: <CalendarOutlined />, color: '#722ed1' },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>病历管理</Title>
          <Text type="secondary">管理和查看患者的病历记录</Text>
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
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

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={18}>
            <Search
              placeholder="搜索患者姓名或诊断"
              allowClear
              enterButton={<Button icon={<SearchOutlined />}>搜索</Button>}
              size="large"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreateRecord}>
              新建病历
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading} tip="加载中...">
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无病历数据' }}
          />
        </Spin>
      </Card>

      <Modal
        title="病历详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary" onClick={() => handleEditRecord(currentRecord)}>编辑治疗方案</Button>
        ]}
        width={700}
      >
        {currentRecord && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="患者姓名" span={2}>
                {(() => {
                  const patient = patients.find(p => p.id === currentRecord.patient_id)
                  return patient ? patient.full_name : `患者 ${currentRecord.patient_id}`
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="就诊日期">{currentRecord.visit_date ? new Date(currentRecord.visit_date).toLocaleDateString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="科室">{currentRecord.department}</Descriptions.Item>
              <Descriptions.Item label="诊断" span={2}>{currentRecord.diagnosis}</Descriptions.Item>
              <Descriptions.Item label="治疗方案" span={2}>{currentRecord.treatment_plan || '无'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{currentRecord.notes || '无'}</Descriptions.Item>
              {currentRecord.image_paths && currentRecord.image_paths.length > 0 && (
                <Descriptions.Item label="病历图片" span={2}>
                  <div style={{ marginTop: 12 }}>
                    {currentRecord.image_paths.map((imagePath, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <img 
                          src={`http://localhost:8000/uploads/${imagePath}`} 
                          alt={`病历图片 ${index + 1}`} 
                          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="编辑治疗方案"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="treatment_plan"
            label="治疗方案"
            rules={[{ required: true, message: '请输入治疗方案' }]}
          >
            <TextArea placeholder="请输入详细的治疗方案" rows={5} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建病历"
        open={createModalVisible}
        onOk={handleCreateOk}
        onCancel={() => setCreateModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="patientName"
            label="患者姓名"
            rules={[{ required: true, message: '请输入患者姓名' }]}
          >
            <AntInput placeholder="请输入患者姓名" />
          </Form.Item>
          <Form.Item
            name="diagnosis"
            label="诊断"
            rules={[{ required: true, message: '请输入诊断' }]}
          >
            <AntInput placeholder="请输入诊断" />
          </Form.Item>
          <Form.Item
            name="symptoms"
            label="症状"
          >
            <TextArea placeholder="请描述症状" rows={3} />
          </Form.Item>
          <Form.Item
            name="treatment"
            label="治疗方案"
          >
            <TextArea placeholder="请描述治疗方案" rows={3} />
          </Form.Item>
          <Form.Item
            name="notes"
            label="医生备注"
          >
            <TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MedicalRecords
