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
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [editingAgentId, setEditingAgentId] = useState(null);

  const [form] = Form.useForm();

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch agents (${res.status}): ${text}`);
    }
    const agents = await res.json();
    return Array.isArray(agents) ? agents : [];
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
      message.error(err?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAgents();
  }, []);

  const compareText = (a, b, field) =>
    String(a?.[field] ?? '').localeCompare(String(b?.[field] ?? ''));

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
      mobileNumber: record.mobileNumber,
      address: record.address,
      aadharDetails: record.aadharDetails,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleAdd = async (values) => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to create agent (${res.status}): ${text}`);
    }

    return res.json().catch(() => null);
  };

  const handleUpdate = async (agentId, values) => {
    const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to update agent (${res.status}): ${text}`);
    }

    return res.json().catch(() => null);
  };

  const handleDelete = async (agentId) => {
    const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to delete agent (${res.status}): ${text}`);
    }
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === 'add') {
        const created = await handleAdd(values);
        message.success(
          created?.agentId ? `Created ${created.agentId}` : 'Agent created',
        );

        setIsModalOpen(false);
        setPagination((p) => ({ ...p, current: 1 }));
        await refreshAgents();
        return;
      }

      if (modalMode === 'edit') {
        if (!editingAgentId) throw new Error('Missing agentId for update.');

        const updated = await handleUpdate(editingAgentId, values);
        message.success(
          updated?.agentId ? `Updated ${updated.agentId}` : 'Agent updated',
        );

        setIsModalOpen(false);
        await refreshAgents();
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Agent ID',
      dataIndex: 'agentId',
      key: 'agentId',
      sorter: (a, b) => compareText(a, b, 'agentId'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => compareText(a, b, 'name'),
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      sorter: (a, b) => compareText(a, b, 'mobileNumber'),
    },
    {
      title: 'Aadhar Details',
      dataIndex: 'aadharDetails',
      key: 'aadharDetails',
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
            description={`Are you sure you want to delete ${record.agentId}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                setLoading(true);
                await handleDelete(record.agentId);
                message.success(`Deleted ${record.agentId}`);
                await refreshAgents();
              } catch (err) {
                message.error(err?.message || 'Failed to delete agent');
              } finally {
                setLoading(false);
              }
            }}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) => {
      const id = String(row.agentId || '').toLowerCase();
      const name = String(row.name || '').toLowerCase();
      const mobile = String(row.mobileNumber || '').toLowerCase();
      return id.includes(q) || name.includes(q) || mobile.includes(q);
    });
  }, [data, searchText]);

  const onSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  return (
    <div style={{ width: '100%' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Agent</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by Agent ID, Name, or Mobile"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={refreshAgents} disabled={loading}>
              Refresh
            </Button>
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
            pageSizeOptions: [5, 10, 20, 50],
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            });
          }}
        />

        <Modal
          title={modalMode === 'add' ? 'Add Agent' : 'Edit Agent'}
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmitModal}
          okText={modalMode === 'add' ? 'Add' : 'Save'}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter name.' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mobile Number"
              name="mobileNumber"
              rules={[
                { required: true, message: 'Please enter mobile number.' },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Enter valid 10 digit mobile number.',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Aadhar Details"
              name="aadharDetails"
              rules={[
                { required: true, message: 'Please enter Aadhar number.' },
                {
                  pattern: /^[0-9]{12}$/,
                  message: 'Enter valid 12 digit Aadhar number.',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Please enter address.' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
