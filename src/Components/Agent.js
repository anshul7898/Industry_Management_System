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
      setPagination((p) => ({ ...p, current: 1 }));
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
      sorter: (a, b) => String(a.agentId).localeCompare(String(b.agentId)),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) =>
        String(a.name || '').localeCompare(String(b.name || '')),
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobile',
      key: 'mobile',
      sorter: (a, b) =>
        String(a.mobile || '').localeCompare(String(b.mobile || '')),
    },
    {
      title: 'Aadhar Details',
      dataIndex: 'aadhar_Details',
      key: 'aadhar_Details',
      sorter: (a, b) =>
        String(a.aadhar_Details || '').localeCompare(
          String(b.aadhar_Details || ''),
        ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      sorter: (a, b) =>
        String(a.address || '').localeCompare(String(b.address || '')),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="middle" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            onConfirm={() => handleDelete(record.agentId)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="middle">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '20px auto', padding: 16 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Agent</h1>

        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Input.Search
            placeholder="Search by Agent ID, Name, or Mobile"
            allowClear
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
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
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} agents`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            });
          }}
        />

        {/* Dark Header Styling (Same as Accounts) */}
        <style>{`
          .ant-table-thead > tr > th {
            background: #1f2937 !important;
            color: #ffffff !important;
            font-weight: 600;
          }
          .ant-table-thead > tr > th .ant-table-column-sorter {
            color: rgba(255, 255, 255, 0.95);
          }
        `}</style>

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
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Mobile number should be of 10 digits',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="aadhar_Details"
              label="Aadhar Details"
              rules={[
                { required: true },
                {
                  pattern: /^[0-9]{12}$/,
                  message: 'Aadhar Number should be of 12 digits',
                },
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
