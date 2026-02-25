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
import { getStateOptions } from '../data/states';
import { getCityOptions } from '../data/cities';

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
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [editingPartyId, setEditingPartyId] = useState(null);

  const [form] = Form.useForm();
  const [selectedState, setSelectedState] = useState(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Get state options from data file
  const stateOptions = useMemo(() => getStateOptions(), []);

  // Get city options based on selected state
  const cityOptions = useMemo(
    () => getCityOptions(selectedState),
    [selectedState],
  );

  // Handle state change to clear city selection
  const handleStateChange = (value) => {
    setSelectedState(value);
    form.setFieldValue('city', null);
  };

  // Handle city change
  const handleCityChange = (value) => {
    form.setFieldValue('city', value);
  };

  // Email validator function
  const validateEmail = (_, value) => {
    if (!value) {
      // Email is optional, so empty is valid
      return Promise.resolve();
    }
    if (emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(
      new Error('Please enter a valid email address (e.g., user@example.com)'),
    );
  };

  // Mobile validator function
  const validateMobile = (_, value) => {
    if (!value) {
      // Mobile is optional, so empty is valid
      return Promise.resolve();
    }
    if (/^[0-9]{10}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Mobile number should be 10 digits'));
  };

  // Check if modal is in view mode (read-only)
  const isViewMode = modalMode === 'view';

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

  // Watch form state changes
  useEffect(() => {
    const unsubscribe = form.getFieldInstance('state');
  }, [form]);

  // ---------------- MODAL ----------------
  const openAddModal = async () => {
    setModalMode('add');
    setEditingPartyId(null);
    setSelectedState(null);
    form.resetFields();

    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);
    } catch (err) {
      message.error(err.message);
    }

    setIsModalOpen(true);
  };

  const openViewModal = async (record) => {
    setModalMode('view');
    setEditingPartyId(record.partyId);
    setSelectedState(record.state || null);

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
      contact_Person2: record.contact_Person2,
      mobile1: record.mobile1,
      mobile2: record.mobile2,
      email: record.email,
      address: record.address,
      city: record.city,
      state: record.state,
      pincode: record.pincode,
      agentId: record.agentId,
      orderId: record.orderId,
    });

    setIsModalOpen(true);
  };

  const openEditModal = async (record) => {
    setModalMode('edit');
    setEditingPartyId(record.partyId);
    setSelectedState(record.state || null);

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
      contact_Person2: record.contact_Person2,
      mobile1: record.mobile1,
      mobile2: record.mobile2,
      email: record.email,
      address: record.address,
      city: record.city,
      state: record.state,
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

      // Build payload without partyId (auto-generated on backend)
      const payload = {
        partyName: values.partyName,
        aliasOrCompanyName: values.aliasOrCompanyName || null,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        pincode: values.pincode || null,
        agentId: values.agentId ? parseInt(values.agentId) : null,
        contact_Person1: values.contact_Person1 || null,
        contact_Person2: values.contact_Person2 || null,
        email: values.email || null,
        mobile1: values.mobile1 || null,
        mobile2: values.mobile2 || null,
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
      } else if (modalMode === 'edit') {
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
      setSelectedState(null);
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

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedState(null);
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
        String(row.mobile2 || '')
          .toLowerCase()
          .includes(q) ||
        String(row.aliasOrCompanyName || '')
          .toLowerCase()
          .includes(q) ||
        String(row.email || '')
          .toLowerCase()
          .includes(q) ||
        String(row.city || '')
          .toLowerCase()
          .includes(q) ||
        String(row.state || '')
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

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '-';
    return String(text).length > maxLength
      ? String(text).substring(0, maxLength) + '...'
      : String(text);
  };

  // ---------------- TABLE ----------------
  const columns = [
    {
      title: 'Party ID',
      dataIndex: 'partyId',
      key: 'partyId',
      width: 80,
      sorter: (a, b) => (a.partyId || 0) - (b.partyId || 0),
      fixed: 'left',
    },
    {
      title: 'Party Name',
      dataIndex: 'partyName',
      key: 'partyName',
      width: 150,
      sorter: (a, b) =>
        String(a.partyName || '').localeCompare(String(b.partyName || '')),
      render: (text) => <span title={text}>{truncateText(text, 20)}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'aliasOrCompanyName',
      key: 'aliasOrCompanyName',
      width: 150,
      sorter: (a, b) =>
        String(a.aliasOrCompanyName || '').localeCompare(
          String(b.aliasOrCompanyName || ''),
        ),
      render: (text) => <span title={text}>{truncateText(text, 20)}</span>,
    },
    {
      title: 'Contact Person 1',
      dataIndex: 'contact_Person1',
      key: 'contact_Person1',
      width: 140,
      sorter: (a, b) =>
        String(a.contact_Person1 || '').localeCompare(
          String(b.contact_Person1 || ''),
        ),
      render: (text) => <span title={text}>{truncateText(text, 18)}</span>,
    },
    {
      title: 'Contact Person 2',
      dataIndex: 'contact_Person2',
      key: 'contact_Person2',
      width: 140,
      sorter: (a, b) =>
        String(a.contact_Person2 || '').localeCompare(
          String(b.contact_Person2 || ''),
        ),
      render: (text) => <span title={text}>{truncateText(text, 18)}</span>,
    },
    {
      title: 'Mobile 1',
      dataIndex: 'mobile1',
      key: 'mobile1',
      width: 120,
      sorter: (a, b) =>
        String(a.mobile1 || '').localeCompare(String(b.mobile1 || '')),
      render: (text) => <span title={text}>{truncateText(text, 12)}</span>,
    },
    {
      title: 'Mobile 2',
      dataIndex: 'mobile2',
      key: 'mobile2',
      width: 120,
      sorter: (a, b) =>
        String(a.mobile2 || '').localeCompare(String(b.mobile2 || '')),
      render: (text) => <span title={text}>{truncateText(text, 12)}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 160,
      sorter: (a, b) =>
        String(a.email || '').localeCompare(String(b.email || '')),
      render: (text) => <span title={text}>{truncateText(text, 25)}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 180,
      sorter: (a, b) =>
        String(a.address || '').localeCompare(String(b.address || '')),
      render: (text) => <span title={text}>{truncateText(text, 25)}</span>,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 150,
      sorter: (a, b) =>
        String(a.state || '').localeCompare(String(b.state || '')),
      render: (text) => <span title={text}>{truncateText(text, 20)}</span>,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      sorter: (a, b) =>
        String(a.city || '').localeCompare(String(b.city || '')),
      render: (text) => <span title={text}>{truncateText(text, 15)}</span>,
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      key: 'pincode',
      width: 100,
      sorter: (a, b) =>
        String(a.pincode || '').localeCompare(String(b.pincode || '')),
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      sorter: (a, b) =>
        String(a.orderId || '').localeCompare(String(b.orderId || '')),
      render: (text) => <span title={text}>{truncateText(text, 15)}</span>,
    },
    {
      title: 'Agent',
      dataIndex: 'agentName',
      key: 'agentName',
      width: 150,
      sorter: (a, b) =>
        String(a.agentName || '').localeCompare(String(b.agentName || '')),
      render: (text) => <span title={text}>{truncateText(text, 20)}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openViewModal(record)}>
            View
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Party?"
            description="Are you sure you want to delete this party?"
            onConfirm={() => handleDelete(record.partyId)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small">
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

      <div style={{ maxWidth: '100%', margin: '20px auto', padding: 16 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Party</h1>

        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Input.Search
            placeholder="Search by Party ID, Name, Company, Email, City, State, Mobile 1 or Mobile 2"
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

        <div
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
          }}
        >
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
            scroll={{ x: 2000 }}
            size="small"
          />
        </div>

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
          .ant-table-body > tr:hover > td {
            background: #f5f5f5 !important;
          }
          
          /* Styling for disabled inputs in view mode */
          .ant-input-disabled,
          .ant-input-disabled:hover,
          .ant-input-textarea-disabled {
            background-color: #f5f5f5 !important;
            color: #000000 !important;
            cursor: default;
          }
          
          .ant-input-disabled::placeholder {
            color: #000000 !important;
          }
          
          /* Styling for disabled select in view mode */
          .ant-select-disabled .ant-select-selector {
            background-color: #f5f5f5 !important;
          }
          
          .ant-select-disabled .ant-select-selector .ant-select-selection-item {
            color: #000000 !important;
          }
          
          .ant-select-disabled .ant-select-selector .ant-select-selection-placeholder {
            color: #000000 !important;
          }
        `}</style>

        <Modal
          title={
            isViewMode
              ? 'View Party'
              : modalMode === 'add'
                ? 'Add Party'
                : 'Edit Party'
          }
          open={isModalOpen}
          onCancel={handleCloseModal}
          onOk={isViewMode ? handleCloseModal : handleSubmitModal}
          okText={isViewMode ? 'Close' : 'Save'}
          confirmLoading={loading}
          width={700}
          footer={
            isViewMode
              ? [
                  <Button key="close" type="primary" onClick={handleCloseModal}>
                    Close
                  </Button>,
                ]
              : undefined
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="partyName"
              label="Party Name"
              rules={
                isViewMode
                  ? []
                  : [{ required: true, message: 'Please enter party name' }]
              }
            >
              <Input placeholder="Enter party name" disabled={isViewMode} />
            </Form.Item>

            <Form.Item
              name="aliasOrCompanyName"
              label="Alias / Company Name"
              rules={
                isViewMode
                  ? []
                  : [
                      {
                        required: true,
                        message: 'Please enter alias or company name',
                      },
                    ]
              }
            >
              <Input
                placeholder="Enter alias or company name"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item
              name="contact_Person1"
              label="Contact Person 1"
              rules={
                isViewMode
                  ? []
                  : [
                      {
                        required: true,
                        message: 'Please enter first contact person name',
                      },
                    ]
              }
            >
              <Input
                placeholder="Enter first contact person name"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item name="contact_Person2" label="Contact Person 2">
              <Input
                placeholder="Enter second contact person name (optional)"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item
              name="mobile1"
              label="Mobile 1"
              rules={
                isViewMode
                  ? []
                  : [
                      { required: true, message: 'Please enter mobile number' },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: 'Mobile number should be 10 digits',
                      },
                    ]
              }
            >
              <Input
                placeholder="Enter 10 digit mobile number"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item
              name="mobile2"
              label="Mobile 2"
              rules={isViewMode ? [] : [{ validator: validateMobile }]}
            >
              <Input
                placeholder="Enter 10 digit mobile number (optional)"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={isViewMode ? [] : [{ validator: validateEmail }]}
            >
              <Input
                type="email"
                placeholder="Enter email address (e.g., user@example.com)"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input.TextArea
                rows={2}
                placeholder="Enter complete address"
                disabled={isViewMode}
              />
            </Form.Item>

            <Form.Item name="state" label="State">
              <Select
                placeholder="Select State"
                options={stateOptions}
                showSearch
                onChange={handleStateChange}
                disabled={isViewMode}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item name="city" label="City">
              <Select
                placeholder={
                  selectedState ? 'Select City' : 'Please select a state first'
                }
                options={cityOptions}
                showSearch
                onChange={handleCityChange}
                disabled={
                  isViewMode || !selectedState || cityOptions.length === 0
                }
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item name="pincode" label="Pincode">
              <Input placeholder="Enter pincode" disabled={isViewMode} />
            </Form.Item>

            <Form.Item
              name="agentId"
              label="Agent"
              rules={
                isViewMode
                  ? []
                  : [{ required: true, message: 'Please select an agent' }]
              }
            >
              <Select
                placeholder="Select Agent"
                options={agentOptions}
                optionLabelProp="label"
                showSearch
                disabled={isViewMode}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item name="orderId" label="Order ID">
              <Input
                placeholder="Enter order ID (optional)"
                disabled={isViewMode}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
