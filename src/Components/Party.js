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
  Select,
} from 'antd';
import Navbar from './Navbar';

export default function Party() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingPartyId, setEditingPartyId] = useState(null);

  const [form] = Form.useForm();

  // ---------------- FETCH ----------------
  const fetchParties = async () => {
    const res = await fetch('/api/party');
    if (!res.ok) throw new Error('Failed to fetch parties');
    return res.json();
  };

  const fetchAgents = async () => {
    const res = await fetch('/api/agents/lightweight');
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  };

  const refreshParties = async () => {
    setLoading(true);
    try {
      const [parties, agentsData] = await Promise.all([
        fetchParties(),
        fetchAgents(),
      ]);

      setAgents(agentsData);

      const rows = parties.map((p, idx) => {
        const agent = agentsData.find((a) => a.agentId === p.agentId);
        return {
          key: p.partyId ?? String(idx),
          ...p,
          agentName: agent ? agent.name : '',
        };
      });

      setData(rows);
      setPagination((p) => ({ ...p, current: 1 }));
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshParties();
  }, []);

  // ---------------- MODAL ----------------
  const openAddModal = async () => {
    setModalMode('add');
    setEditingPartyId(null);
    form.resetFields();

    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);
    } catch (err) {
      message.error(err.message);
    }

    setIsModalOpen(true);
  };

  const openEditModal = async (record) => {
    setModalMode('edit');
    setEditingPartyId(record.partyId);

    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);
    } catch (err) {
      message.error(err.message);
    }

    form.setFieldsValue({
      partyName: record.partyName,
      aliasOrCompanyName: record.aliasOrCompanyName,
      contact_Person1: record.contact_Person1,
      mobile1: record.mobile1,
      email: record.email,
      address: record.address,
      city: record.city,
      pincode: record.pincode,
      agentId: record.agentId,
      orderId: record.orderId,
    });

    setIsModalOpen(true);
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Build payload exactly as the Party Pydantic model expects
      const payload = {
        partyId:
          modalMode === 'add' ? parseInt(values.partyId) : editingPartyId,
        partyName: values.partyName,
        aliasOrCompanyName: values.aliasOrCompanyName || null,
        address: values.address || null,
        city: values.city || null,
        pincode: values.pincode || null,
        agentId: values.agentId ? parseInt(values.agentId) : null,
        contact_Person1: values.contact_Person1 || null,
        email: values.email || null,
        mobile1: values.mobile1 || null,
        orderId: values.orderId || null,
      };

      if (modalMode === 'add') {
        const res = await fetch('/api/party', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(errorData || 'Failed to create party');
        }

        message.success('Party created successfully');
      } else {
        const res = await fetch(`/api/party/${editingPartyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(errorData || 'Failed to update party');
        }

        message.success('Party updated successfully');
      }

      setIsModalOpen(false);
      await refreshParties();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partyId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/party/${partyId}`, { method: 'DELETE' });

      if (!res.ok) {
        throw new Error('Failed to delete party');
      }

      message.success('Party deleted successfully');
      await refreshParties();
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
        String(row.partyId).toLowerCase().includes(q) ||
        String(row.partyName || '')
          .toLowerCase()
          .includes(q) ||
        String(row.mobile1 || '')
          .toLowerCase()
          .includes(q) ||
        String(row.aliasOrCompanyName || '')
          .toLowerCase()
          .includes(q),
    );
  }, [data, searchText]);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  // Build agent dropdown options
  const agentOptions = agents.map((agent) => ({
    label: agent.name,
    value: agent.agentId,
  }));

  // ---------------- TABLE ----------------
  const columns = [
    {
      title: 'Party ID',
      dataIndex: 'partyId',
      key: 'partyId',
      sorter: (a, b) => (a.partyId || 0) - (b.partyId || 0),
    },
    {
      title: 'Party Name',
      dataIndex: 'partyName',
      key: 'partyName',
      sorter: (a, b) =>
        String(a.partyName || '').localeCompare(String(b.partyName || '')),
    },
    {
      title: 'Company',
      dataIndex: 'aliasOrCompanyName',
      key: 'aliasOrCompanyName',
      sorter: (a, b) =>
        String(a.aliasOrCompanyName || '').localeCompare(
          String(b.aliasOrCompanyName || ''),
        ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile1',
      key: 'mobile1',
      sorter: (a, b) =>
        String(a.mobile1 || '').localeCompare(String(b.mobile1 || '')),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      sorter: (a, b) =>
        String(a.city || '').localeCompare(String(b.city || '')),
    },
    {
      title: 'Agent',
      dataIndex: 'agentName',
      key: 'agentName',
      sorter: (a, b) =>
        String(a.agentName || '').localeCompare(String(b.agentName || '')),
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
            title="Are you sure you want to delete this party?"
            onConfirm={() => handleDelete(record.partyId)}
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
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Party</h1>

        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Input.Search
            placeholder="Search by Party ID, Name, Company or Mobile"
            allowClear
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={refreshParties}>Refresh</Button>
            <Button type="primary" onClick={openAddModal}>
              Add Party
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
              `${range[0]}-${range[1]} of ${total} parties`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            });
          }}
        />

        {/* Dark Header Styling */}
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
          title={modalMode === 'add' ? 'Add Party' : 'Edit Party'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSubmitModal}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            {modalMode === 'add' && (
              <Form.Item
                name="partyId"
                label="Party ID"
                rules={[
                  { required: true, message: 'Please enter party ID' },
                  {
                    pattern: /^[0-9]+$/,
                    message: 'Party ID must be a number',
                  },
                ]}
              >
                <Input placeholder="Enter unique party ID" />
              </Form.Item>
            )}

            <Form.Item
              name="partyName"
              label="Party Name"
              rules={[{ required: true, message: 'Please enter party name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="aliasOrCompanyName" label="Alias / Company Name">
              <Input />
            </Form.Item>

            <Form.Item name="contact_Person1" label="Contact Person">
              <Input />
            </Form.Item>

            <Form.Item
              name="mobile1"
              label="Mobile"
              rules={[
                { required: true, message: 'Please enter mobile number' },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Mobile number should be 10 digits',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input type="email" />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item name="city" label="City">
              <Input />
            </Form.Item>

            <Form.Item name="pincode" label="Pincode">
              <Input />
            </Form.Item>

            <Form.Item
              name="agentId"
              label="Agent"
              rules={[{ required: true, message: 'Please select an agent' }]}
            >
              <Select
                placeholder="Select Agent"
                options={agentOptions}
                optionLabelProp="label"
              />
            </Form.Item>

            <Form.Item name="orderId" label="Order ID">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
