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
  Card,
  Row,
  Col,
  Badge,
  Tag,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Navbar from './Navbar';
import { API_BASE_URL } from '../config';
import { getStateOptions } from '../data/states';
import { getCityOptions } from '../data/cities';

// ── Reusable section box for the modal form ───────────────────────
const SectionBox = ({ title, children, accent = '#1677ff' }) => (
  <div
    style={{
      marginBottom: 20,
      borderRadius: 10,
      border: '1px solid #e8eaf0',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}
  >
    <div
      style={{
        padding: '10px 16px',
        background: `linear-gradient(90deg, ${accent}18 0%, #f8f9ff 100%)`,
        borderBottom: `2px solid ${accent}30`,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>
        {title}
      </span>
    </div>
    <div style={{ padding: '16px 16px 4px' }}>{children}</div>
  </div>
);

export default function Party() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingPartyId, setEditingPartyId] = useState(null);
  const [form] = Form.useForm();
  const [selectedState, setSelectedState] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const stateOptions = useMemo(() => getStateOptions(), []);
  const cityOptions = useMemo(
    () => getCityOptions(selectedState),
    [selectedState],
  );
  const isViewMode = modalMode === 'view';

  const handleStateChange = (value) => {
    setSelectedState(value);
    form.setFieldValue('city', null);
  };
  const handleCityChange = (value) => {
    form.setFieldValue('city', value);
  };

  const handleAlphabetsOnlyInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
  };
  const handleNumbersOnlyInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };
  const handlePincodeInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
  };
  const handleMobileInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
  };

  const validatePincode = (_, value) => {
    if (!value) return Promise.resolve();
    return /^[0-9]{6}$/.test(value)
      ? Promise.resolve()
      : Promise.reject(new Error('Pincode should be exactly 6 digits'));
  };
  const validateEmail = (_, value) => {
    if (!value) return Promise.resolve();
    return emailRegex.test(value)
      ? Promise.resolve()
      : Promise.reject(
          new Error(
            'Please enter a valid email address (e.g., user@example.com)',
          ),
        );
  };
  const validateMobile = (_, value) => {
    if (!value) return Promise.resolve();
    return /^[0-9]{10}$/.test(value)
      ? Promise.resolve()
      : Promise.reject(new Error('Mobile number should be 10 digits'));
  };

  // ── NEW: Order ID must be numeric only ──────────────────────────
  const validateOrderId = (_, value) => {
    if (!value) return Promise.resolve();
    return /^[0-9]+$/.test(String(value))
      ? Promise.resolve()
      : Promise.reject(new Error('Order ID must contain numbers only'));
  };

  // ---------------- FETCH ----------------
  const isActiveRecord = (record) =>
    record?.deleted !== true && String(record?.deleted).toLowerCase() !== 'true';

  const fetchParties = async () => {
    const res = await fetch(`${API_BASE_URL}/api/party`);
    if (!res.ok) throw new Error('Failed to fetch parties');
    const parties = await res.json();
    return (Array.isArray(parties) ? parties : []).filter(isActiveRecord);
  };
  const fetchAgents = async () => {
    const res = await fetch(`${API_BASE_URL}/api/agents/lightweight`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    const agents = await res.json();
    return (Array.isArray(agents) ? agents : []).filter(isActiveRecord);
  };
  const fetchOrders = async () => {
    const res = await fetch(`${API_BASE_URL}/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const orders = await res.json();
    return (Array.isArray(orders) ? orders : []).filter(isActiveRecord);
  };

  const normalizeField = (value) => String(value || '').trim().toLowerCase();

  const showDuplicatePartyModal = () => {
    Modal.warning({
      title: 'Duplicate party',
      content: (
        <div>
          <p>
            A party with the same Party Name, City and Mobile already exists.
          </p>
          <p>Please update at least one of these fields to continue.</p>
        </div>
      ),
      centered: true,
      okText: 'OK',
    });
  };

  const showDeleteBlockedModal = (orderIds) => {
    Modal.error({
      title: 'Cannot delete party',
      content: (
        <div>
          <p>
            This party has associated orders and cannot be deleted.
          </p>
          <p>
            <strong>Order ID{orderIds.length > 1 ? 's' : ''}:</strong>{' '}
            {orderIds.join(', ')}
          </p>
        </div>
      ),
      centered: true,
      okText: 'Close',
      closable: true,
    });
  };

  const isDuplicateParty = (values) => {
    const partyName = normalizeField(values.partyName);
    const city = normalizeField(values.city);
    const mobile1 = normalizeField(values.mobile1);

    if (!partyName || !city || !mobile1) return false;

    return data.some((party) => {
      if (!party) return false;
      if (modalMode === 'edit' && String(party.partyId) === String(editingPartyId)) {
        return false;
      }
      return (
        normalizeField(party.partyName) === partyName &&
        normalizeField(party.city) === city &&
        normalizeField(party.mobile1) === mobile1
      );
    });
  };

  const refreshParties = async () => {
    setLoading(true);
    try {
      const [parties, agentsData] = await Promise.all([
        fetchParties(),
        fetchAgents(),
      ]);
      setAgents(agentsData);
      setData(
        parties.filter(isActiveRecord).map((p, idx) => {
          const agent = agentsData.find((a) => a.agentId === p.agentId);
          return {
            key: p.partyId ?? String(idx),
            ...p,
            agentName: agent ? agent.name : '',
          };
        }),
      );
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
  const setFormValues = (record) => {
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
  };

  const openAddModal = async () => {
    setModalMode('add');
    setEditingPartyId(null);
    setSelectedState(null);
    form.resetFields();
    try {
      setAgents(await fetchAgents());
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
      setAgents(await fetchAgents());
    } catch (err) {
      message.error(err.message);
    }
    setFormValues(record);
    setIsModalOpen(true);
  };

  const openEditModal = async (record) => {
    setModalMode('edit');
    setEditingPartyId(record.partyId);
    setSelectedState(record.state || null);
    try {
      setAgents(await fetchAgents());
    } catch (err) {
      message.error(err.message);
    }
    setFormValues(record);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      if (isDuplicateParty(values)) {
        showDuplicatePartyModal();
        return;
      }
      setLoading(true);
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
        const res = await fetch(`${API_BASE_URL}/api/party`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.text();
          throw new Error(e || 'Failed to create party');
        }
        message.success('Party created successfully');
      } else if (modalMode === 'edit') {
        const res = await fetch(`${API_BASE_URL}/api/party/${editingPartyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.text();
          throw new Error(e || 'Failed to update party');
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

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      const orders = await fetchOrders();
      const matchingOrders = orders.filter((order) => {
        const partyName = String(record.partyName || '').trim().toLowerCase();
        const orderPartyName = String(order.Party_Name || order.PartyName || '').trim().toLowerCase();
        return partyName && orderPartyName === partyName;
      });

      if (matchingOrders.length > 0) {
        const orderIds = matchingOrders
          .map((order) => order.OrderId ?? order.orderId ?? order.id)
          .filter((id) => id !== undefined && id !== null);
        showDeleteBlockedModal(orderIds.length > 0 ? orderIds : ['Unknown']);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/party/${record.partyId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete party');
      message.success('Party deleted successfully');
      await refreshParties();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedState(null);
  };

  // ---------------- SEARCH ----------------
  const filteredData = useMemo(() => {
    const q = searchText.toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      [
        row.partyId,
        row.partyName,
        row.mobile1,
        row.mobile2,
        row.aliasOrCompanyName,
        row.email,
        row.city,
        row.state,
        row.agentName, // ✅ Added: search by agent name
      ].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, searchText]);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const agentOptions = agents.map((a) => ({ label: a.name, value: a.agentId }));

  const truncateText = (text, maxLength = 20) => {
    if (!text) return '-';
    return String(text).length > maxLength
      ? String(text).substring(0, maxLength) + '…'
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
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span>
      ),
    },
    {
      title: 'Party Name',
      dataIndex: 'partyName',
      key: 'partyName',
      width: 150,
      sorter: (a, b) =>
        String(a.partyName || '').localeCompare(String(b.partyName || '')),
      render: (text) => (
        <span title={text} style={{ fontWeight: 500 }}>
          {truncateText(text, 20)}
        </span>
      ),
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
      render: (text) => (
        <span title={text} style={{ color: '#595959' }}>
          {truncateText(text, 25)}
        </span>
      ),
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
      render: (text) =>
        text ? (
          <Tag color="geekblue" style={{ fontSize: 11 }}>
            {truncateText(text, 20)}
          </Tag>
        ) : (
          '-'
        ),
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
      render: (v) =>
        v ? <span style={{ fontFamily: 'monospace' }}>{v}</span> : '-',
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      sorter: (a, b) =>
        String(a.orderId || '').localeCompare(String(b.orderId || '')),
      render: (text) =>
        text ? (
          <Tag color="cyan" style={{ fontSize: 11 }}>
            {truncateText(text, 15)}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Agent',
      dataIndex: 'agentName',
      key: 'agentName',
      width: 150,
      sorter: (a, b) =>
        String(a.agentName || '').localeCompare(String(b.agentName || '')),
      render: (text) =>
        text ? (
          <Tag color="blue" style={{ fontSize: 11, fontWeight: 500 }}>
            {truncateText(text, 20)}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 210,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openViewModal(record)}
            style={{ borderRadius: 6 }}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Party?"
            description="Are you sure you want to delete this party?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
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
        .parties-table .ant-table-thead > tr > th {
          background: #1f2937 !important;
          color: #ffffff !important;
          font-weight: 600;
          font-size: 13px;
          border-bottom: none !important;
        }
        .parties-table .ant-table-thead > tr > th .ant-table-column-sorter,
        .parties-table .ant-table-thead > tr > th .ant-table-column-sorter-up,
        .parties-table .ant-table-thead > tr > th .ant-table-column-sorter-down {
          color: rgba(255,255,255,0.85);
        }
        .parties-table .table-row-light { background-color: #ffffff !important; }
        .parties-table .table-row-dark  { background-color: #f8f9fc !important; }
        .parties-table .ant-table-row:hover > td { background-color: #e6f4ff !important; }
        .parties-table .ant-table-cell { font-size: 13px; }
        .parties-table-card .ant-card-body { padding: 0 !important; }
        .party-modal .ant-modal-title { font-size: 16px; font-weight: 700; }
        .party-modal .ant-modal-footer .ant-btn-primary { border-radius: 8px; font-weight: 600; }
        .ant-input-disabled, .ant-input-disabled:hover { background-color: #f5f5f5 !important; color: #1f2937 !important; cursor: default; }
        .ant-select-disabled .ant-select-selector { background-color: #f5f5f5 !important; }
        .ant-select-disabled .ant-select-selector .ant-select-selection-item { color: #1f2937 !important; }
        .ant-form-item-label > label { font-size: 12px; font-weight: 600; color: #374151; }
      `}</style>

      <div style={{ maxWidth: '100%', margin: '24px auto', padding: '0 20px' }}>
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
              <TeamOutlined style={{ color: '#fff', fontSize: 22 }} />
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
                Parties
              </h1>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                Manage customers and business parties
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
                placeholder="Search by Party ID, Name, Company, Email, City, State, Mobile 1, Mobile 2 or Agent" // ✅ Updated placeholder
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
                onClick={refreshParties}
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
                Add Party
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ── Table ── */}
        <Card
          className="parties-table-card"
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            className="parties-table"
            loading={loading}
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total} parties`,
              style: { padding: '12px 20px' },
            }}
            onChange={(newPagination) =>
              setPagination({
                current: newPagination.current,
                pageSize: newPagination.pageSize,
              })
            }
            scroll={{ x: 2000 }}
            size="small"
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </Card>
      </div>

      {/* ── Add / Edit / View Modal ── */}
      <Modal
        className="party-modal"
        title={
          <Space>
            {isViewMode ? (
              <>
                <EyeOutlined style={{ color: '#1677ff' }} />
                <span>View Party</span>
              </>
            ) : modalMode === 'add' ? (
              <>
                <PlusOutlined style={{ color: '#1677ff' }} />
                <span>Add Party</span>
              </>
            ) : (
              <>
                <EditOutlined style={{ color: '#faad14' }} />
                <span>Edit Party</span>
              </>
            )}
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={isViewMode ? handleCloseModal : handleSubmitModal}
        okText={isViewMode ? 'Close' : 'Save'}
        okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        confirmLoading={loading}
        width={720}
        centered
        footer={
          isViewMode
            ? [
                <Button
                  key="close"
                  type="primary"
                  onClick={handleCloseModal}
                  style={{ borderRadius: 8 }}
                >
                  Close
                </Button>,
              ]
            : undefined
        }
      >
        {!isViewMode && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              background:
                modalMode === 'add'
                  ? 'linear-gradient(90deg,#e6f7ff,#f0f9ff)'
                  : 'linear-gradient(90deg,#fffbe6,#fff9e6)',
              borderRadius: 8,
              border: `1px solid ${modalMode === 'add' ? '#91d5ff' : '#ffe58f'}`,
              fontSize: 13,
              color: modalMode === 'add' ? '#0050b3' : '#874d00',
            }}
          >
            {modalMode === 'add'
              ? '➕ Fill in the details below to register a new party.'
              : "✏️ Update the party's details below."}
          </div>
        )}

        <Form form={form} layout="vertical">
          <SectionBox title="Party Information" accent="#1677ff">
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="partyName"
                  label="Party Name"
                  rules={
                    isViewMode
                      ? []
                      : [
                          {
                            required: true,
                            message: 'Please enter party name',
                          },
                        ]
                  }
                >
                  <Input
                    placeholder="Enter party name"
                    disabled={isViewMode}
                    onInput={handleAlphabetsOnlyInput}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="aliasOrCompanyName"
                  label="Alias / Company Name"
                  rules={isViewMode ? [] : []}
                >
                  <Input
                    placeholder="Enter alias or company name"
                    disabled={isViewMode}
                    onInput={handleAlphabetsOnlyInput}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label="Address">
              <Input.TextArea
                rows={2}
                placeholder="Enter complete address"
                disabled={isViewMode}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={
                    isViewMode
                      ? []
                      : [
                          {
                            required: true,
                            message: 'Please select a state',
                          },
                        ]
                  }
                >
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
              </Col>
              <Col span={8}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={
                    isViewMode
                      ? []
                      : [
                          {
                            required: true,
                            message: 'Please select a city',
                          },
                        ]
                  }
                >
                  <Select
                    placeholder={
                      selectedState
                        ? 'Select City'
                        : 'Please select a state first'
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
              </Col>
              <Col span={8}>
                <Form.Item
                  name="pincode"
                  label="Pincode"
                  rules={isViewMode ? [] : [{ validator: validatePincode }]}
                >
                  <Input
                    placeholder="6-digit pincode"
                    disabled={isViewMode}
                    onInput={handlePincodeInput}
                    maxLength={6}
                    style={{ borderRadius: 8, fontFamily: 'monospace' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="agentId"
                  label="Agent"
                  rules={
                    isViewMode
                      ? []
                      : [
                          {
                            required: true,
                            message: 'Please select an agent',
                          },
                        ]
                  }
                >
                  <Select
                    placeholder="Select Agent"
                    options={agentOptions}
                    showSearch
                    disabled={isViewMode}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                {/* ── Order ID: numbers only ── */}
                <Form.Item
                  name="orderId"
                  label="Order ID"
                  rules={isViewMode ? [] : [{ validator: validateOrderId }]}
                >
                  <Input
                    placeholder="Enter numeric order ID (optional)"
                    disabled={isViewMode || modalMode === 'edit'}
                    onInput={handleNumbersOnlyInput}
                    style={{ borderRadius: 8, fontFamily: 'monospace' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>

          <SectionBox title="Contact Information" accent="#13c2c2">
            <Row gutter={12}>
              <Col span={12}>
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
                    onInput={handleAlphabetsOnlyInput}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contact_Person2" label="Contact Person 2">
                  <Input
                    placeholder="Second contact person (optional)"
                    disabled={isViewMode}
                    onInput={handleAlphabetsOnlyInput}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  name="mobile1"
                  label="Mobile 1"
                  rules={
                    isViewMode
                      ? []
                      : [
                          {
                            required: true,
                            message: 'Please enter mobile number',
                          },
                          {
                            pattern: /^[0-9]{10}$/,
                            message: 'Mobile number should be 10 digits',
                          },
                        ]
                  }
                >
                  <Input
                    placeholder="10-digit mobile"
                    disabled={isViewMode}
                    onInput={handleMobileInput}
                    maxLength={10}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="mobile2"
                  label="Mobile 2"
                  rules={isViewMode ? [] : [{ validator: validateMobile }]}
                >
                  <Input
                    placeholder="10-digit mobile (optional)"
                    disabled={isViewMode}
                    onInput={handleMobileInput}
                    maxLength={10}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={isViewMode ? [] : [{ validator: validateEmail }]}
                >
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    disabled={isViewMode}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>
        </Form>
      </Modal>
    </div>
  );
}
