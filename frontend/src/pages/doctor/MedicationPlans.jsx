import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Spin
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { treatmentApi, patientApi } from '../../services/api'

const { Title, Text } = Typography
const { TextArea } = Input

function MedicationPlans() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  
  const [patient, setPatient] = useState(null)
  const [medicationPlans, setMedicationPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [editingPlan, setEditingPlan] = useState(null)

  // 加载患者信息
  const loadPatientInfo = async () => {
    try {
      const patientData = await patientApi.getPatient(patientId)
      setPatient(patientData)
    } catch (error) {
      console.error('获取患者信息失败:', error)
      message.error('获取患者信息失败')
    }
  }

  // 加载患者的用药计划
  const loadMedicationPlans = async () => {
    try {
      setLoading(true)
      const plans = await treatmentApi.getTreatmentPlans(patientId)
      setMedicationPlans(Array.isArray(plans) ? plans : [])
    } catch (error) {
      console.error('获取用药计划失败:', error)
      message.error('获取用药计划失败')
      setMedicationPlans([])
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载数据
  useEffect(() => {
    loadPatientInfo()
    loadMedicationPlans()
  }, [patientId])

  // 处理添加用药计划
  const handleAddPlan = () => {
    form.resetFields()
    setAddModalVisible(true)
  }

  // 保存用药计划
  const handleAddPlanOk = async () => {
    try {
      const values = await form.validateFields()
      
      const newPlan = {
        patient_id: patientId,
        ...values
      }
      
      await treatmentApi.createTreatmentPlan(newPlan)
      setAddModalVisible(false)
      message.success('用药计划添加成功！患者端已同步。')
      loadMedicationPlans() // 重新加载用药计划
    } catch (error) {
      console.error('添加用药计划失败:', error)
      message.error('添加用药计划失败')
    }
  }

  // 处理删除用药计划
  const handleDeletePlan = async (planId) => {
    try {
      await treatmentApi.deleteTreatmentPlan(planId)
      message.success('用药计划删除成功！')
      loadMedicationPlans() // 重新加载用药计划
    } catch (error) {
      console.error('删除用药计划失败:', error)
      message.error('删除用药计划失败')
    }
  }

  // 处理编辑用药计划
  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    editForm.setFieldsValue(plan)
    setEditModalVisible(true)
  }

  // 保存编辑的用药计划
  const handleEditPlanOk = async () => {
    try {
      const values = await editForm.validateFields()
      
      await treatmentApi.updateTreatmentPlan(editingPlan.id, values)
      setEditModalVisible(false)
      message.success('用药计划编辑成功！患者端已同步。')
      loadMedicationPlans() // 重新加载用药计划
    } catch (error) {
      console.error('编辑用药计划失败:', error)
      message.error('编辑用药计划失败')
    }
  }

  // 判断用药计划状态
  const getPlanStatus = (plan) => {
    // 这里可以根据实际的时间逻辑判断状态
    // 暂时简单返回状态
    return plan.status || 'active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'completed': return 'blue'
      case 'stopped': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '正常进行'
      case 'completed': return '已结束'
      case 'stopped': return '已停止'
      default: return '未知'
    }
  }

  const columns = [
    {
      title: '药品名称',
      dataIndex: 'medication_name',
      key: 'medication_name',
    },
    {
      title: '剂量',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: '用药频率',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: '用药疗程',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const status = getPlanStatus(record)
        return (
          <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditPlan(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePlan(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/doctor/my-patients')} style={{ marginRight: 16 }}>
                返回
              </Button>
              <Title level={3} style={{ margin: 0 }}>用药计划管理</Title>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPlan}>
              添加用药计划
            </Button>
          </div>
          <Text type="secondary">
            患者: {patient?.full_name || '加载中...'}
          </Text>
        </Space>
      </Card>

      <Card>
        <Spin spinning={loading} tip="加载中...">
          <Table
            columns={columns}
            dataSource={medicationPlans}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无用药计划数据' }}
          />
        </Spin>
      </Card>

      {/* 添加用药计划模态框 */}
      <Modal
        title="添加用药计划"
        open={addModalVisible}
        onOk={handleAddPlanOk}
        onCancel={() => setAddModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="medication_name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="请输入药品名称" />
          </Form.Item>
          <Form.Item
            name="dosage"
            label="剂量"
            rules={[{ required: true, message: '请输入剂量' }]}
          >
            <Input placeholder="请输入剂量，如：5mg" />
          </Form.Item>
          <Form.Item
            name="frequency"
            label="用药频率"
            rules={[{ required: true, message: '请输入用药频率' }]}
          >
            <Input placeholder="请输入用药频率，如：每日3次" />
          </Form.Item>
          <Form.Item
            name="duration"
            label="用药疗程"
            rules={[{ required: true, message: '请输入用药疗程' }]}
          >
            <Input placeholder="请输入用药疗程，如：7天" />
          </Form.Item>
          <Form.Item
            name="instructions"
            label="用药说明"
          >
            <TextArea placeholder="请输入用药说明和注意事项" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用药计划模态框 */}
      <Modal
        title="编辑用药计划"
        open={editModalVisible}
        onOk={handleEditPlanOk}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="medication_name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="请输入药品名称" />
          </Form.Item>
          <Form.Item
            name="dosage"
            label="剂量"
            rules={[{ required: true, message: '请输入剂量' }]}
          >
            <Input placeholder="请输入剂量，如：5mg" />
          </Form.Item>
          <Form.Item
            name="frequency"
            label="用药频率"
            rules={[{ required: true, message: '请输入用药频率' }]}
          >
            <Input placeholder="请输入用药频率，如：每日3次" />
          </Form.Item>
          <Form.Item
            name="duration"
            label="用药疗程"
            rules={[{ required: true, message: '请输入用药疗程' }]}
          >
            <Input placeholder="请输入用药疗程，如：7天" />
          </Form.Item>
          <Form.Item
            name="instructions"
            label="用药说明"
          >
            <TextArea placeholder="请输入用药说明和注意事项" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MedicationPlans