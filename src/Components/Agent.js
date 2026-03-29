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
  Avatar,
  Tag,
  Spin,
  Descriptions,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
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

  // ── View Orders state ──
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [ordersAgent, setOrdersAgent] = useState(null);
  const [agentOrders, setAgentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState('');

  // ── View Single Order state ──
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);

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

  // ---------------- FETCH ORDERS FOR AGENT ----------------
  const openOrdersModal = useCallback(async (record) => {
    setOrdersAgent({ agentId: record.agentId, name: record.name });
    setOrdersSearch('');
    setAgentOrders([]);
    setIsOrdersModalOpen(true);
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const allOrders = await res.json();
      const filtered = allOrders.filter(
        (o) => String(o.AgentId) === String(record.agentId),
      );
      setAgentOrders(filtered);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ---------------- OPEN SINGLE ORDER ----------------
  const openViewOrderModal = (order) => {
    setSelectedOrder(order);
    setIsViewOrderModalOpen(true);
  };

  const closeViewOrderModal = () => {
    setIsViewOrderModalOpen(false);
    setSelectedOrder(null);
  };

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

  // ---------------- ORDERS MODAL FILTERED LIST ----------------
  const filteredOrders = useMemo(() => {
    const q = ordersSearch.toLowerCase();
    if (!q) return agentOrders;
    return agentOrders.filter(
      (o) =>
        String(o.OrderId ?? '')
          .toLowerCase()
          .includes(q) ||
        String(o.Party_Name ?? '')
          .toLowerCase()
          .includes(q) ||
        String(o.AliasOrCompanyName ?? '')
          .toLowerCase()
          .includes(q) ||
        String(o.Contact_Person1 ?? '')
          .toLowerCase()
          .includes(q) ||
        String(o.Contact_Person2 ?? '')
          .toLowerCase()
          .includes(q),
    );
  }, [agentOrders, ordersSearch]);

  const avatarColor = (name) => {
    const colors = [
      '#6c5ce7',
      '#0984e3',
      '#00b894',
      '#e17055',
      '#fdcb6e',
      '#e84393',
      '#00cec9',
    ];
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
  };

  // ---------------- TABLE COLUMNS ----------------
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
      width: 160,
      sorter: (a, b) =>
        String(a.mobile || '').localeCompare(String(b.mobile || '')),
    },
    {
      title: 'Aadhar Details',
      dataIndex: 'aadhar_Details',
      key: 'aadhar_Details',
      width: 180,
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
      width: 150,
      sorter: (a, b) =>
        String(a.address || '').localeCompare(String(b.address || '')),
      render: (v) =>
        v ? (
          <span
            style={{
              display: 'block',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={v}
          >
            {v}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openOrdersModal(record)}
            style={{
              borderRadius: 6,
              color: '#6c5ce7',
              borderColor: '#6c5ce7',
            }}
          >
            View Orders
          </Button>
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

  // ---------------- VIEW ORDER MODAL CONTENT ----------------
  const renderViewOrderModal = () => {
    if (!selectedOrder) return null;

    const agentName = ordersAgent?.name ?? '—';
    const partyName = selectedOrder.Party_Name ?? '—';
    const alias = selectedOrder.AliasOrCompanyName ?? '—';
    const address = selectedOrder.Address ?? '—';
    const state = selectedOrder.State ?? '—';
    const city = selectedOrder.City ?? '—';
    const pincode = selectedOrder.Pincode ?? '—';
    const contactP1 = selectedOrder.Contact_Person1 ?? '—';
    const contactP2 = selectedOrder.Contact_Person2 ?? '—';
    const mobile1 = selectedOrder.Mobile1 ? String(selectedOrder.Mobile1) : '—';
    const mobile2 = selectedOrder.Mobile2 ? String(selectedOrder.Mobile2) : '—';
    const email = selectedOrder.Email ?? '—';
    const products = Array.isArray(selectedOrder.Products)
      ? selectedOrder.Products
      : [];

    const sectionStyle = {
      background: '#f0f4ff',
      borderRadius: 10,
      padding: '10px 16px',
      marginBottom: 8,
      fontWeight: 700,
      fontSize: 14,
      color: '#1a1a2e',
    };

    const tableStyle = {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: 16,
      background: '#fff',
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid #e8e8e8',
    };

    const tdStyle = {
      padding: '10px 14px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: 13,
      color: '#555',
      width: '25%',
    };

    const tdValueStyle = {
      ...tdStyle,
      color: '#1a1a2e',
      fontWeight: 500,
    };

    return (
      <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
        {/* Party Information */}
        <div style={sectionStyle}>Party Information</div>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tdStyle}>Agent</td>
              <td style={tdValueStyle}>{agentName}</td>
              <td style={tdStyle}>Party Name</td>
              <td style={tdValueStyle}>{partyName}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Alias / Company Name</td>
              <td style={tdValueStyle}>{alias}</td>
              <td style={tdStyle}>Address</td>
              <td style={tdValueStyle}>{address}</td>
            </tr>
            <tr>
              <td style={tdStyle}>State</td>
              <td style={tdValueStyle}>{state}</td>
              <td style={tdStyle}>City</td>
              <td style={tdValueStyle}>{city}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Pincode</td>
              <td style={tdValueStyle}>{pincode}</td>
              <td style={tdStyle}></td>
              <td style={tdValueStyle}></td>
            </tr>
          </tbody>
        </table>

        {/* Contact Information */}
        <div style={sectionStyle}>Contact Information</div>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tdStyle}>Contact Person 1</td>
              <td style={tdValueStyle}>{contactP1}</td>
              <td style={tdStyle}>Contact Person 2</td>
              <td style={tdValueStyle}>{contactP2}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Mobile 1</td>
              <td style={tdValueStyle}>{mobile1}</td>
              <td style={tdStyle}>Mobile 2</td>
              <td style={tdValueStyle}>{mobile2}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Email</td>
              <td style={tdValueStyle} colSpan={3}>
                {email}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Products */}
        <div style={sectionStyle}>Products ({products.length})</div>
        {products.length === 0 ? (
          <div
            style={{
              color: '#999',
              fontSize: 13,
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            No products found.
          </div>
        ) : (
          products.map((product, index) => {
            const productType =
              product.ProductType ?? product.productType ?? '—';
            const fields = Object.entries(product).filter(
              ([key]) => !['ProductType', 'productType'].includes(key),
            );
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: 10,
                  marginBottom: 12,
                  overflow: 'hidden',
                }}
              >
                {/* Product header */}
                <div
                  style={{
                    background: '#f5f3ff',
                    padding: '8px 16px',
                    borderBottom: '1px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}
                  >
                    Product {index + 1}
                  </span>
                  <Tag
                    color="purple"
                    style={{
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 12,
                      padding: '0 10px',
                    }}
                  >
                    {productType}
                  </Tag>
                </div>
                {/* Product fields */}
                <table
                  style={{ ...tableStyle, marginBottom: 0, borderRadius: 0 }}
                >
                  <tbody>
                    {fields.reduce((rows, [key, val], i) => {
                      if (i % 2 === 0) {
                        const next = fields[i + 1];
                        rows.push(
                          <tr key={i}>
                            <td style={tdStyle}>{key}</td>
                            <td style={tdValueStyle}>
                              {val !== null && val !== undefined
                                ? String(val)
                                : '—'}
                            </td>
                            {next ? (
                              <>
                                <td style={tdStyle}>{next[0]}</td>
                                <td style={tdValueStyle}>
                                  {next[1] !== null && next[1] !== undefined
                                    ? String(next[1])
                                    : '—'}
                                </td>
                              </>
                            ) : (
                              <>
                                <td style={tdStyle}></td>
                                <td style={tdValueStyle}></td>
                              </>
                            )}
                          </tr>,
                        );
                      }
                      return rows;
                    }, [])}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    );
  };

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
        .orders-modal .ant-modal-title { font-size: 16px; font-weight: 700; }
        .view-order-modal .ant-modal-title { font-size: 16px; font-weight: 700; }
        .order-card-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          margin-bottom: 10px;
          transition: box-shadow 0.2s, border-color 0.2s;
          cursor: pointer;
        }
        .order-card-item:hover { box-shadow: 0 2px 10px rgba(108,92,231,0.18); border-color: #b39ddb; }
        .order-card-item .order-info { flex: 1; min-width: 0; }
        .order-card-item .order-party { font-weight: 700; font-size: 15px; color: #1a1a2e; }
        .order-card-item .order-meta { color: #888; font-size: 13px; margin-top: 3px; }
        .order-card-item .order-amount { color: #00b894; font-weight: 700; font-size: 14px; }
      `}</style>

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
            scroll={{ x: 1000 }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </Card>
      </div>

      {/* ── Add / Edit Agent Modal ── */}
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

      {/* ── View Orders Modal ── */}
      <Modal
        className="orders-modal"
        open={isOrdersModalOpen}
        onCancel={() => setIsOrdersModalOpen(false)}
        centered
        width={660}
        footer={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => setIsOrdersModalOpen(false)}
            style={{ borderRadius: 8 }}
          >
            Back to Agents
          </Button>,
          <Button
            key="close"
            onClick={() => setIsOrdersModalOpen(false)}
            style={{ borderRadius: 8 }}
          >
            Close
          </Button>,
        ]}
        title={
          <Space align="center">
            <FileTextOutlined style={{ color: '#6c5ce7', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Orders for {ordersAgent?.name}
            </span>
            <Tag
              color="purple"
              style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}
            >
              {filteredOrders.length}{' '}
              {filteredOrders.length === 1 ? 'order' : 'orders'}
            </Tag>
          </Space>
        }
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          placeholder="Search by Order ID, Party Name or Contact Person..."
          value={ordersSearch}
          onChange={(e) => setOrdersSearch(e.target.value)}
          allowClear
          style={{ borderRadius: 8, marginBottom: 14 }}
        />

        <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 2 }}>
          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#999',
                fontSize: 14,
              }}
            >
              No orders found for this agent.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const partyName = order.Party_Name ?? '—';
              const alias = order.AliasOrCompanyName ?? '';
              const contactP1 = order.Contact_Person1 ?? '';
              const contactP2 = order.Contact_Person2 ?? '';
              const mobile = order.Mobile1 ? String(order.Mobile1) : '';
              const totalAmount = order.TotalAmount ?? null;
              const productCount = Array.isArray(order.Products)
                ? order.Products.length
                : null;
              const orderId = order.OrderId;
              const displayName = alias || partyName;
              const contactLine = [contactP1, contactP2]
                .filter(Boolean)
                .join(' / ');

              return (
                <div
                  key={orderId}
                  className="order-card-item"
                  onClick={() => openViewOrderModal(order)} // ← click handler
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && openViewOrderModal(order)
                  }
                >
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: avatarColor(displayName),
                      fontWeight: 700,
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>

                  <div className="order-info">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span className="order-party">{displayName}</span>
                      <Tag
                        color="purple"
                        style={{
                          borderRadius: 20,
                          fontWeight: 600,
                          fontSize: 11,
                          padding: '0 8px',
                        }}
                      >
                        #{orderId}
                      </Tag>
                      {productCount !== null && (
                        <Tag
                          color="green"
                          style={{
                            borderRadius: 20,
                            fontWeight: 600,
                            fontSize: 11,
                            padding: '0 8px',
                          }}
                        >
                          {productCount}{' '}
                          {productCount === 1 ? 'product' : 'products'}
                        </Tag>
                      )}
                    </div>
                    <div className="order-meta">
                      {contactLine && <span>{contactLine}</span>}
                      {contactLine && mobile && (
                        <span style={{ margin: '0 5px' }}>·</span>
                      )}
                      {mobile && <span>{mobile}</span>}
                      {totalAmount !== null && (
                        <span
                          className="order-amount"
                          style={{ marginLeft: 10 }}
                        >
                          ₹{Number(totalAmount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual hint that the row is clickable */}
                  <EyeOutlined
                    style={{ color: '#b39ddb', fontSize: 18, flexShrink: 0 }}
                  />
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* ── View Single Order Modal ── */}
      <Modal
        className="view-order-modal"
        open={isViewOrderModalOpen}
        onCancel={closeViewOrderModal}
        centered
        width={740}
        footer={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={closeViewOrderModal}
            style={{ borderRadius: 8 }}
          >
            Back to Orders
          </Button>,
          <Button
            key="close"
            onClick={closeViewOrderModal}
            style={{ borderRadius: 8 }}
          >
            Close
          </Button>,
        ]}
        title={
          <Space align="center">
            <EyeOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>View Order</span>
            {selectedOrder && (
              <Tag
                color="blue"
                style={{
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '0 10px',
                }}
              >
                #{selectedOrder.OrderId}
              </Tag>
            )}
          </Space>
        }
      >
        {renderViewOrderModal()}
      </Modal>
    </div>
  );
}
