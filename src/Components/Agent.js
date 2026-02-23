import { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Popconfirm,
  Modal,
  Form,
  message,
} from 'antd';
import Navbar from './Navbar';

export default function Agent() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

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

  const refreshAgents = async () => {
    setLoading(true);
    try {
      const agents = await fetchAgents();

      const rows = agents.map((a, idx) => ({
        key: a.agentId ?? String(idx),
        ...a,
      }));

      setData(rows);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAgents();
  }, []);

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

      if (modalMode === 'add') {
        await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        message.success('Agent created');
      } else {
        await fetch(`/api/agents/${editingAgentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        message.success('Agent updated');
      }

      setIsModalOpen(false);
      await refreshAgents();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId) => {
    try {
      setLoading(true);
      await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      message.success('Agent deleted');
      await refreshAgents();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TABLE ----------------
  const columns = [
    {
      title: 'Agent ID',
      dataIndex: 'agentId',
      key: 'agentId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Aadhar Details',
      dataIndex: 'aadhar_Details',
      key: 'aadhar_Details',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this agent?"
            onConfirm={() => handleDelete(record.agentId)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '20px auto', padding: 16 }}>
        <h1 style={{ textAlign: 'center' }}>Agent</h1>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Search by Agent ID, Name, or Mobile"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={refreshAgents}>Refresh</Button>
            <Button type="primary" onClick={openAddModal}>
              Add Agent
            </Button>
          </div>
        </Space>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={pagination}
          onChange={(p) => setPagination(p)}
        />

        <Modal
          title={modalMode === 'add' ? 'Add Agent' : 'Edit Agent'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSubmitModal}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              name="mobile"
              label="Mobile Number"
              rules={[
                { required: true },
                { pattern: /^[0-9]{10}$/, message: 'Enter 10 digit number' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="aadhar_Details"
              label="Aadhar Details"
              rules={[
                { required: true },
                { pattern: /^[0-9]{12}$/, message: 'Enter 12 digit number' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
