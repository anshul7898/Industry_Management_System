import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Popconfirm,
  Modal,
  Form,
  message,
  Card,
  Row,
  Col,
  Badge,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Navbar from './Navbar';

export default function Agent() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [form] = Form.useForm();

  // ---------------- FETCH ----------------
  async function fetchAgents() {
    const res = await fetch('/api/agents');
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  }

  const refreshAgents = useCallback(async () => {
    setLoading(true);
    try {
      const agents = await fetchAgents();
      setData(
        agents.map((a, idx) => ({ key: a.agentId ?? String(idx), ...a })),
      );
      setPagination((p) => ({ ...p, current: 1 }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

  // ---------------- INPUT VALIDATORS ----------------
  const handleNameChange = (e) => {
    form.setFieldValue('name', e.target.value.replace(/[^a-zA-Z\s]/g, ''));
  };
  const handleMobileChange = (e) => {
    form.setFieldValue(
      'mobile',
      e.target.value.replace(/[^0-9]/g, '').slice(0, 10),
    );
  };
  const handleAadharChange = (e) => {
    form.setFieldValue(
      'aadhar_Details',
      e.target.value.replace(/[^0-9]/g, '').slice(0, 12),
    );
  };

  const handleNameKeyDown = (e) => {
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ].includes(e.key)
    )
      return;
    if (
      (e.ctrlKey || e.metaKey) &&
      ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())
    )
      return;
    if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault();
  };

  const handleNumberKeyDown = (e) => {
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ].includes(e.key)
    )
      return;
    if (
      (e.ctrlKey || e.metaKey) &&
      ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())
    )
      return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const handleNamePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted !== pasted.replace(/[^a-zA-Z\s]/g, '')) e.preventDefault();
  };

  const handleNumberPaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted !== pasted.replace(/[^0-9]/g, '')) e.preventDefault();
  };

  // ---------------- MODAL ----------------
  const openAddModal = () => {
    setModalMode('add');
    setEditingAgentId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingAgentId(record.agentId);
    form.setFieldsValue({
      name: record.name,
      mobile: record.mobile,
      address: record.address,
      aadhar_Details: record.aadhar_Details,
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        name: values.name,
        mobile: values.mobile,
        aadhar_Details: values.aadhar_Details,
        address: values.address,
      };

      if (modalMode === 'add') {
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.detail || 'Failed to create agent');
        }
        message.success('Agent created successfully');
      } else {
        const res = await fetch(`/api/agents/${editingAgentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.detail || 'Failed to update agent');
        }
        message.success('Agent updated successfully');
      }

      setIsModalOpen(false);
      await refreshAgents();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || 'Failed to delete agent');
      }
      message.success('Agent deleted successfully');
      await refreshAgents();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SEARCH ----------------
  const filteredData = useMemo(() => {
    const q = searchText.toLowerCase();
    if (!q) return data;
    return data.filter(
      (row) =>
        String(row.agentId).toLowerCase().includes(q) ||
        String(row.name || '')
          .toLowerCase()
          .includes(q) ||
        String(row.mobile || '')
          .toLowerCase()
          .includes(q),
    );
  }, [data, searchText]);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  // ---------------- TABLE ----------------
  const columns = [
    {
      title: 'Agent ID',
      dataIndex: 'agentId',
      key: 'agentId',
      width: 120,
      sorter: (a, b) => (a.agentId || 0) - (b.agentId || 0),
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) =>
        String(a.name || '').localeCompare(String(b.name || '')),
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 180,
      sorter: (a, b) =>
        String(a.mobile || '').localeCompare(String(b.mobile || '')),
    },
    {
      title: 'Aadhar Details',
      dataIndex: 'aadhar_Details',
      key: 'aadhar_Details',
      width: 200,
      sorter: (a, b) =>
        String(a.aadhar_Details || '').localeCompare(
          String(b.aadhar_Details || ''),
        ),
      render: (v) =>
        v ? (
          <span style={{ color: '#595959', fontFamily: 'monospace' }}>{v}</span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      // no fixed width — stretches to fill remaining space
      sorter: (a, b) =>
        String(a.address || '').localeCompare(String(b.address || '')),
      render: (v) => v || '-',
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            onConfirm={() => handleDelete(record.agentId)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: 6 }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', background: '#f4f6fb', minHeight: '100vh' }}>
      <Navbar />

      <style>{`
        .agents-table .ant-table-thead > tr > th {
          background: #1f2937 !important;
          color: #ffffff !important;
          font-weight: 600;
          font-size: 13px;
          border-bottom: none !important;
        }
        .agents-table .ant-table-thead > tr > th .ant-table-column-sorter,
        .agents-table .ant-table-thead > tr > th .ant-table-column-sorter-up,
        .agents-table .ant-table-thead > tr > th .ant-table-column-sorter-down {
          color: rgba(255,255,255,0.85);
        }
        .agents-table .table-row-light { background-color: #ffffff !important; }
        .agents-table .table-row-dark  { background-color: #f8f9fc !important; }
        .agents-table .ant-table-row:hover > td { background-color: #e6f4ff !important; }
        .agents-table .ant-table-cell { font-size: 13px; }
        .agents-table-card .ant-card-body { padding: 0 !important; }
        .agent-modal .ant-modal-title { font-size: 16px; font-weight: 700; }
        .agent-modal .ant-modal-footer .ant-btn-primary { border-radius: 8px; font-weight: 600; }
        .ant-form-item-label > label { font-size: 12px; font-weight: 600; color: #374151; }
      `}</style>

      {/* ── maxWidth raised to 1440 to match Order/Party/Product pages ── */}
      <div style={{ maxWidth: 1440, margin: '24px auto', padding: '0 20px' }}>
        {/* ── Page Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: 14,
            boxShadow: '0 4px 16px rgba(31,41,55,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserOutlined style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <div>
              <h1
                style={{
                  color: '#fff',
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Agents
              </h1>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                Manage all sales agents
              </span>
            </div>
          </div>
          <Badge
            count={filteredData.length}
            style={{
              backgroundColor: '#52c41a',
              fontSize: 13,
              fontWeight: 700,
            }}
            overflowCount={9999}
            showZero
          />
        </div>

        {/* ── Toolbar ── */}
        <Card
          style={{
            borderRadius: 12,
            marginBottom: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
          bodyStyle={{ padding: '14px 20px' }}
        >
          <Row gutter={12} align="middle">
            <Col flex="auto">
              <Input.Search
                allowClear
                size="large"
                placeholder="Search by Agent ID, Name, or Mobile"
                value={searchText}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={refreshAgents}
                disabled={loading}
                style={{ borderRadius: 8 }}
              >
                Refresh
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Add Agent
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ── Table ── */}
        <Card
          className="agents-table-card"
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            className="agents-table"
            loading={loading}
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total} agents`,
              style: { padding: '12px 20px' },
            }}
            onChange={(newPagination) =>
              setPagination({
                current: newPagination.current,
                pageSize: newPagination.pageSize,
              })
            }
            scroll={{ x: 900 }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </Card>
      </div>

      {/* ── Modal ── */}
      <Modal
        className="agent-modal"
        title={
          <Space>
            {modalMode === 'add' ? (
              <>
                <PlusOutlined style={{ color: '#1677ff' }} />
                <span>Add Agent</span>
              </>
            ) : (
              <>
                <EditOutlined style={{ color: '#faad14' }} />
                <span>Edit Agent</span>
              </>
            )}
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmitModal}
        okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        confirmLoading={loading}
        centered
        width={520}
      >
        <div
          style={{
            marginBottom: 20,
            padding: '10px 14px',
            background: 'linear-gradient(90deg,#e6f7ff,#f0f9ff)',
            borderRadius: 8,
            border: '1px solid #91d5ff',
            fontSize: 13,
            color: '#0050b3',
          }}
        >
          {modalMode === 'add'
            ? '➕ Fill in the details below to register a new agent.'
            : "✏️ Update the agent's details below."}
        </div>
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter agent name' }]}
          >
            <Input
              placeholder="Enter name (letters and spaces only)"
              onChange={handleNameChange}
              onKeyDown={handleNameKeyDown}
              onPaste={handleNamePaste}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="Mobile Number"
            rules={[
              { required: true, message: 'Please enter mobile number' },
              {
                pattern: /^[0-9]{10}$/,
                message: 'Mobile number should be of 10 digits',
              },
            ]}
          >
            <Input
              placeholder="Enter 10-digit mobile number"
              onChange={handleMobileChange}
              onKeyDown={handleNumberKeyDown}
              onPaste={handleNumberPaste}
              maxLength={10}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="aadhar_Details"
            label="Aadhar Details"
            rules={[
              {
                pattern: /^[0-9]{12}$/,
                message: 'Aadhar Number should be of 12 digits',
              },
            ]}
          >
            <Input
              placeholder="Enter 12-digit Aadhar number"
              onChange={handleAadharChange}
              onKeyDown={handleNumberKeyDown}
              onPaste={handleNumberPaste}
              maxLength={12}
              style={{ borderRadius: 8, fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input.TextArea
              rows={3}
              placeholder="Enter full address"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
