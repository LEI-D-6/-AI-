import React, { useState, useEffect } from 'react'
import { Typography, Card, Modal, Descriptions, Divider, Tag, Progress, Button, Row, Col, Space, message } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons'
import { treatmentApi } from '../../services/api'

const { Title, Text } = Typography

function MyTreatment() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [plans, setPlans] = useState([])
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)

  // 加载治疗方案
  const loadTreatmentPlans = async () => {
    try {
      const patientId = user.id || 1
      const plans = await treatmentApi.getTreatmentPlans(patientId)
      
      // 转换数据格式以匹配前端显示需求
      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        patientName: user.username || '患者',
        patientId: patientId,
        diagnosis: '慢性病管理', // 暂时使用通用诊断
        medications: [
          {
            name: plan.medication_name,
            dosage: plan.dosage,
            frequency: plan.frequency,
            time: '' // 时间信息需要从频率中推断或单独添加
          }
        ],
        lifestyleAdvice: plan.instructions || '请按照医生建议用药',
        status: plan.status,
        createdBy: '张医生', // 具体医生姓名
        createdAt: plan.created_at ? new Date(plan.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }))
      
      setPlans(formattedPlans)
    } catch (error) {
      console.error('获取治疗方案失败:', error)
      message.error('获取治疗方案失败')
      setPlans([])
    }
  }

  // 初始加载和用户变化时加载
  useEffect(() => {
    loadTreatmentPlans()
  }, [user])

  // 定期检查治疗方案变化
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadTreatmentPlans()
    }, 5000) // 每5秒检查一次

    return () => clearInterval(intervalId)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'needs_adjustment': return 'gold'
      case 'completed': return 'blue'
      case 'discontinued': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '进行中'
      case 'needs_adjustment': return '需调整'
      case 'completed': return '已完成'
      case 'discontinued': return '已终止'
      default: return '未知'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleOutlined />
      case 'needs_adjustment': return <ClockCircleOutlined />
      case 'completed': return <CheckCircleOutlined />
      case 'discontinued': return <StopOutlined />
      default: return null
    }
  }

  const handleViewPlan = (plan) => {
    setCurrentPlan(plan)
    setViewModalVisible(true)
  }

  return (
    <div style={{ background: 'transparent', padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>我的治疗方案</Title>
        <Text type="secondary">查看医生为您制定的治疗方案</Text>
      </Card>
      <Card>
        <Text>治疗方案数量：{plans.length}</Text>
        {plans.map(plan => (
          <div 
            key={plan.id} 
            style={{ 
              marginTop: 16, 
              padding: 16, 
              border: '1px solid #e8e8e8', 
              borderRadius: 4, 
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => handleViewPlan(plan)}
          >
            <Space>
              <Text strong>{plan.diagnosis}</Text>
              <Tag color={getStatusColor(plan.status)} icon={getStatusIcon(plan.status)}>
                {getStatusText(plan.status)}
              </Tag>
            </Space>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">制定医生：{plan.createdBy}</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">制定日期：{plan.createdAt}</Text>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        title="治疗方案详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>关闭</Button>
        ]}
        width={700}
      >
        {currentPlan && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>{currentPlan.diagnosis}</div>
            <div style={{ marginBottom: '8px' }}>
              <span>制定医生：</span>{currentPlan.createdBy}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>制定日期：</span>{currentPlan.createdAt}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span>状态：</span>
              <Tag color={getStatusColor(currentPlan.status)} icon={getStatusIcon(currentPlan.status)}>
                {getStatusText(currentPlan.status)}
              </Tag>
            </div>

            <Divider />
            <div>
              <Title level={5}>药物治疗</Title>
              {currentPlan.medications.map((med, index) => (
                <div key={index} style={{ marginBottom: 12, padding: 12, border: '1px solid #e8e8e8', borderRadius: 4 }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Text strong>{med.name}</Text>
                    </Col>
                    <Col span={4}>
                      <Tag color="blue">{med.dosage}</Tag>
                    </Col>
                    <Col span={6}>
                      <Tag color="green">{med.frequency}</Tag>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">{med.time}</Text>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Divider />
            <div>
              <Title level={5}>生活方式建议</Title>
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                <Text>{currentPlan.lifestyleAdvice}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyTreatment