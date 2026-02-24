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

export default function Party() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingPartyId, setEditingPartyId] = useState(null);

  const [form] = Form.useForm();

  // ---------------- FETCH ----------------
  async function fetchParties() {
    const res = await fetch('/api/party');
    if (!res.ok) throw new Error('Failed to fetch parties');
    return res.json();
  }

  const refreshParties = async () => {
    setLoading(true);
    try {
      const parties = await fetchParties();

      const rows = parties.map((p, idx) => ({
        key: p.partyId ?? String(idx),
        ...p,
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
    refreshParties();
  }, []);

  // ---------------- MODAL ----------------
  const openAddModal = () => {
    setModalMode('add');
    setEditingPartyId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingPartyId(record.partyId);

    form.setFieldsValue({
      partyName: record.partyName,
      aliasOrCompanyName: record.aliasOrCompanyName,
      contact_Person1: record.contact_Person1,
      mobile1: record.mobile1,
      email: record.email,
      address: record.address,
      city: record.city,
      state: record.state,
      pincode: record.pincode,
      agentId: record.agentId,
    });

    setIsModalOpen(true);
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === 'add') {
        await fetch('/api/party', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Party created');
      } else {
        await fetch(`/api/party/${editingPartyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Party updated');
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
      await fetch(`/api/party/${partyId}`, { method: 'DELETE' });
      message.success('Party deleted');
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

  // ---------------- TABLE ----------------
  const columns = [
    {
      title: 'Party ID',
      dataIndex: 'partyId',
      key: 'partyId',
      sorter: (a, b) => String(a.partyId).localeCompare(String(b.partyId)),
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
      title: 'Contact Person',
      dataIndex: 'contact_Person1',
      key: 'contact_Person1',
      sorter: (a, b) =>
        String(a.contact_Person1 || '').localeCompare(
          String(b.contact_Person1 || ''),
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

      <div style={{ maxWidth: 1300, margin: '20px auto', padding: 16 }}>
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
          width={700}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="partyName"
              label="Party Name"
              rules={[{ required: true }]}
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
                { required: true },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Enter valid 10 digit mobile',
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

            <Form.Item name="state" label="State">
              <Input />
            </Form.Item>

            <Form.Item name="pincode" label="Pincode">
              <Input />
            </Form.Item>

            <Form.Item name="agentId" label="Agent ID">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
