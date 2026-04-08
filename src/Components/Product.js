import { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  message,
  Checkbox,
  Spin,
  Empty,
  Select,
  Card,
  Row,
  Col,
  Badge,
  Tag,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import Navbar from './Navbar';
import { API_BASE_URL as BASE_URL } from '../config';

const API_BASE_URL = `${BASE_URL}/api`;

const DROPDOWN_OPTIONS = {
  bagMaterial: [
    { label: 'Cotton Canvas', value: 'Cotton Canvas' },
    { label: 'Cotton Blend', value: 'Cotton Blend' },
    { label: 'Jute', value: 'Jute' },
    { label: 'Organic Cotton', value: 'Organic Cotton' },
    { label: 'Recycled Polyester', value: 'Recycled Polyester' },
    { label: 'Linen', value: 'Linen' },
  ],
  sheetGSM: [
    { label: '200', value: 200 },
    { label: '250', value: 250 },
    { label: '300', value: 300 },
    { label: '350', value: 350 },
    { label: '400', value: 400 },
    { label: '450', value: 450 },
    { label: '500', value: 500 },
  ],
  sheetColor: [
    { label: 'Natural White', value: 'Natural White' },
    { label: 'Off White', value: 'Off White' },
    { label: 'Beige', value: 'Beige' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Kraft', value: 'Kraft' },
  ],
  borderGSM: [
    { label: '50', value: 50 },
    { label: '75', value: 75 },
    { label: '90', value: 90 },
    { label: '100', value: 100 },
    { label: '120', value: 120 },
    { label: '150', value: 150 },
  ],
  borderColor: [
    { label: 'Black', value: 'Black' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'White', value: 'White' },
    { label: 'Gray', value: 'Gray' },
    { label: 'Red', value: 'Red' },
  ],
  handleType: [
    {
      label: 'Double Stitched Cotton Rope',
      value: 'Double Stitched Cotton Rope',
    },
    {
      label: 'Single Stitched Cotton Rope',
      value: 'Single Stitched Cotton Rope',
    },
    { label: 'Web Handle', value: 'Web Handle' },
    { label: 'Twisted Handle', value: 'Twisted Handle' },
    { label: 'Braided Handle', value: 'Braided Handle' },
    { label: 'Ribbon Handle', value: 'Ribbon Handle' },
  ],
  handleColor: [
    { label: 'Black', value: 'Black' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'Red', value: 'Red' },
    { label: 'White', value: 'White' },
  ],
  handleGSM: [
    { label: '100', value: 100 },
    { label: '120', value: 120 },
    { label: '150', value: 150 },
    { label: '180', value: 180 },
    { label: '200', value: 200 },
  ],
  color: [
    { label: 'White', value: 'White' },
    { label: 'Black', value: 'Black' },
    { label: 'Beige', value: 'Beige' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'Red', value: 'Red' },
    { label: 'Green', value: 'Green' },
    { label: 'Gray', value: 'Gray' },
  ],
  printingType: [
    { label: 'Screen Printing', value: 'Screen Printing' },
    { label: 'Digital Printing', value: 'Digital Printing' },
    { label: 'Flexography', value: 'Flexography' },
    { label: 'Offset Printing', value: 'Offset Printing' },
    { label: 'Embroidery', value: 'Embroidery' },
    { label: 'Stamping', value: 'Stamping' },
  ],
  printColor: [
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'Black', value: 'Black' },
    { label: 'White', value: 'White' },
    { label: 'Red', value: 'Red' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Green', value: 'Green' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Maroon', value: 'Maroon' },
  ],
};

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

export default function Products() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingProductId, setEditingProductId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      setData(products.map((p) => ({ key: p.productId, ...p })));
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      [
        row.productId,
        row.productType,
        row.bagMaterial,
        row.sheetColor,
        row.borderColor,
        row.handleColor,
        row.printingType,
        row.printColor,
        row.color,
        String(row.quantity),
        String(row.rate),
      ]
        .map((x) => String(x || '').toLowerCase())
        .join(' ')
        .includes(q),
    );
  }, [data, searchText]);

  const setFormFields = (record) => {
    form.resetFields();
    form.setFieldsValue({
      productType: record?.productType || '',
      productSize: record?.productSize ? Number(record.productSize) : null,
      bagMaterial: record?.bagMaterial || '',
      quantity: record?.quantity ? Number(record.quantity) : null,
      sheetGSM: record?.sheetGSM ? Number(record.sheetGSM) : null,
      sheetColor: record?.sheetColor || '',
      borderGSM: record?.borderGSM ? Number(record.borderGSM) : null,
      borderColor: record?.borderColor || '',
      handleType: record?.handleType || '',
      handleColor: record?.handleColor || '',
      handleGSM: record?.handleGSM ? Number(record.handleGSM) : null,
      printingType: record?.printingType || '',
      printColor: record?.printColor || '',
      color: record?.color || '',
      design: Boolean(record?.design),
      plateBlockNumber: record?.plateBlockNumber
        ? Number(record.plateBlockNumber)
        : null,
      plateAvailable: Boolean(record?.plateAvailable),
      rate: record?.rate ? Number(record.rate) : null,
    });
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormFields(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingProductId(record.productId);
    setFormFields(record);
    setIsModalOpen(true);
  };

  const openViewModal = (record) => {
    setModalMode('view');
    setEditingProductId(record.productId);
    setFormFields(record);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        sheetGSM: Number(values.sheetGSM),
        borderGSM: Number(values.borderGSM),
        handleGSM: Number(values.handleGSM),
        productSize: Number(values.productSize),
        quantity: Number(values.quantity),
        plateBlockNumber: Number(values.plateBlockNumber) || 0,
        rate: Number(values.rate),
      };

      if (modalMode === 'add') {
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const e = await response.json().catch(() => ({}));
          throw new Error(e.detail || 'Failed to create product');
        }
        const newProduct = await response.json();
        setData((prev) => [
          { key: newProduct.productId, ...newProduct },
          ...prev,
        ]);
        setPagination((p) => ({ ...p, current: 1 }));
        setIsModalOpen(false);
        message.success(`Added Product ID: ${newProduct.productId}`);
        return;
      }

      if (modalMode === 'edit') {
        if (!editingProductId) return;
        const response = await fetch(
          `${API_BASE_URL}/products/${editingProductId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) {
          const e = await response.json().catch(() => ({}));
          throw new Error(e.detail || 'Failed to update product');
        }
        const updatedProduct = await response.json();
        setData((prev) =>
          prev.map((row) =>
            row.productId === editingProductId
              ? { key: updatedProduct.productId, ...updatedProduct }
              : row,
          ),
        );
        setIsModalOpen(false);
        message.success(`Updated Product ID: ${editingProductId}`);
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      setData((prev) => prev.filter((row) => row.productId !== productId));
      message.success(`Deleted Product ID: ${productId}`);
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      sorter: (a, b) => a.productId - b.productId,
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span>
      ),
    },
    {
      title: 'Product Type',
      dataIndex: 'productType',
      key: 'productType',
      sorter: (a, b) =>
        String(a.productType).localeCompare(String(b.productType)),
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Material',
      dataIndex: 'bagMaterial',
      key: 'bagMaterial',
      sorter: (a, b) =>
        String(a.bagMaterial).localeCompare(String(b.bagMaterial)),
      render: (v) => (
        <Tag color="cyan" style={{ fontSize: 11 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'productSize',
      key: 'productSize',
      width: 80,
      align: 'right',
      sorter: (a, b) => (a.productSize ?? 0) - (b.productSize ?? 0),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.quantity ?? 0) - (b.quantity ?? 0),
      render: (q) => (
        <span style={{ fontWeight: 500 }}>
          {Number(q ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      sorter: (a, b) => String(a.color).localeCompare(String(b.color)),
      render: (v) => (
        <Tag color="geekblue" style={{ fontSize: 11 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Printing Type',
      dataIndex: 'printingType',
      key: 'printingType',
      sorter: (a, b) =>
        String(a.printingType).localeCompare(String(b.printingType)),
      render: (v) => (
        <Tag color="purple" style={{ fontSize: 11 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Rate (₹)',
      dataIndex: 'rate',
      key: 'rate',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.rate ?? 0) - (b.rate ?? 0),
      render: (rate) => (
        <span style={{ fontWeight: 700, color: '#389e0d' }}>
          ₹{Number(rate ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 190,
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
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            description={`Are you sure you want to delete Product ID ${record.productId}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.productId)}
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
        .products-table .ant-table-thead > tr > th {
          background: #1f2937 !important;
          color: #ffffff !important;
          font-weight: 600;
          font-size: 13px;
          border-bottom: none !important;
        }
        .products-table .ant-table-thead > tr > th .ant-table-column-sorter,
        .products-table .ant-table-thead > tr > th .ant-table-column-sorter-up,
        .products-table .ant-table-thead > tr > th .ant-table-column-sorter-down {
          color: rgba(255,255,255,0.85);
        }
        .products-table .table-row-light { background-color: #ffffff !important; }
        .products-table .table-row-dark  { background-color: #f8f9fc !important; }
        .products-table .ant-table-row:hover > td { background-color: #e6f4ff !important; }
        .products-table .ant-table-cell { font-size: 13px; }
        .products-table-card .ant-card-body { padding: 0 !important; }
        .product-modal .ant-modal-title { font-size: 16px; font-weight: 700; }
        .product-modal .ant-modal-footer .ant-btn-primary { border-radius: 8px; font-weight: 600; }
        .product-modal .readonly-input .ant-input,
        .product-modal .readonly-input .ant-input-number-input,
        .product-modal .readonly-input .ant-select-selector {
          background-color: #f5f5f5 !important;
          color: #1f2937 !important;
          font-weight: 500;
        }
        .ant-form-item-label > label { font-size: 12px; font-weight: 600; color: #374151; }
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
              <AppstoreOutlined style={{ color: '#fff', fontSize: 22 }} />
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
                Products
              </h1>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                Manage all bag products and specifications
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
                placeholder="Search by Product ID, Type, Material, Color, Printing Type..."
                value={searchText}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                onChange={(e) => onSearchChange(e.target.value)}
                onSearch={(value) => onSearchChange(value)}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={fetchProducts}
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
                Add Product
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ── Table ── */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#999', fontSize: 14 }}>
              Loading products...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <Empty
              description={
                <span style={{ color: '#999' }}>No products found</span>
              }
              style={{ padding: '40px 0' }}
            />
          </Card>
        ) : (
          <Card
            className="products-table-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              className="products-table"
              columns={columns}
              dataSource={filteredData}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20, 50, 100],
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total} products`,
                style: { padding: '12px 20px' },
              }}
              onChange={(newPagination) =>
                setPagination({
                  current: newPagination.current,
                  pageSize: newPagination.pageSize,
                })
              }
              scroll={{ x: 1200 }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
              }
            />
          </Card>
        )}
      </div>

      {/* ── Add / Edit / View Modal ── */}
      <Modal
        className="product-modal"
        title={
          <Space>
            {modalMode === 'add' ? (
              <>
                <PlusOutlined style={{ color: '#1677ff' }} />
                <span>Add Product</span>
              </>
            ) : modalMode === 'edit' ? (
              <>
                <EditOutlined style={{ color: '#faad14' }} />
                <span>Edit Product</span>
                <Tag color="orange">ID: {editingProductId}</Tag>
              </>
            ) : (
              <>
                <EyeOutlined style={{ color: '#1677ff' }} />
                <span>View Product</span>
                <Tag color="blue">ID: {editingProductId}</Tag>
              </>
            )}
          </Space>
        }
        open={isModalOpen}
        onCancel={closeModal}
        onOk={modalMode === 'view' ? closeModal : handleSubmit}
        okText={
          modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Save' : 'Close'
        }
        okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{
          style: {
            borderRadius: 8,
            display: modalMode === 'view' ? 'none' : 'inline-block',
          },
        }}
        centered
        width={680}
      >
        {modalMode !== 'view' && (
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
              ? '➕ Fill in the details below to add a new product.'
              : '✏️ Update the product details below.'}
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          className={modalMode === 'view' ? 'readonly-input' : ''}
        >
          <SectionBox title="Basic Information" accent="#1677ff">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Product Type"
                  name="productType"
                  rules={[
                    { required: true, message: 'Please enter product type.' },
                  ]}
                >
                  <Input
                    placeholder="e.g., Premium Shopping Bag"
                    disabled={modalMode === 'view'}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Product Size"
                  name="productSize"
                  rules={[
                    { required: true, message: 'Please enter product size.' },
                  ]}
                >
                  <InputNumber
                    min={0}
                    placeholder="e.g., 12"
                    disabled={modalMode === 'view'}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Bag Material"
                  name="bagMaterial"
                  rules={[
                    { required: true, message: 'Please select bag material.' },
                  ]}
                >
                  <Select
                    placeholder="Select bag material"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.bagMaterial}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity.' },
                  ]}
                >
                  <InputNumber
                    min={0}
                    placeholder="e.g., 5000"
                    disabled={modalMode === 'view'}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>

          <SectionBox title="Sheet Information" accent="#13c2c2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Sheet GSM"
                  name="sheetGSM"
                  rules={[
                    { required: true, message: 'Please select sheet GSM.' },
                  ]}
                >
                  <Select
                    placeholder="Select sheet GSM"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.sheetGSM}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Sheet Color"
                  name="sheetColor"
                  rules={[
                    { required: true, message: 'Please select sheet color.' },
                  ]}
                >
                  <Select
                    placeholder="Select sheet color"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.sheetColor}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>

          <SectionBox title="Border Information" accent="#722ed1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Border GSM"
                  name="borderGSM"
                  rules={[
                    { required: true, message: 'Please select border GSM.' },
                  ]}
                >
                  <Select
                    placeholder="Select border GSM"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.borderGSM}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Border Color"
                  name="borderColor"
                  rules={[
                    { required: true, message: 'Please select border color.' },
                  ]}
                >
                  <Select
                    placeholder="Select border color"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.borderColor}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>

          <SectionBox title="Handle Information" accent="#fa8c16">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Handle Type"
                  name="handleType"
                  rules={[
                    { required: true, message: 'Please select handle type.' },
                  ]}
                >
                  <Select
                    placeholder="Select handle type"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.handleType}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Handle Color"
                  name="handleColor"
                  rules={[
                    { required: true, message: 'Please select handle color.' },
                  ]}
                >
                  <Select
                    placeholder="Select handle color"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.handleColor}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Handle GSM"
                  name="handleGSM"
                  rules={[
                    { required: true, message: 'Please select handle GSM.' },
                  ]}
                >
                  <Select
                    placeholder="Select handle GSM"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.handleGSM}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>

          <SectionBox title="Printing & Colour" accent="#52c41a">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Printing Type"
                  name="printingType"
                  rules={[
                    { required: true, message: 'Please select printing type.' },
                  ]}
                >
                  <Select
                    placeholder="Select printing type"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.printingType}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Print Color"
                  name="printColor"
                  rules={[
                    { required: true, message: 'Please select print color.' },
                  ]}
                >
                  <Select
                    placeholder="Select print color"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.printColor}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Color"
                  name="color"
                  rules={[{ required: true, message: 'Please select color.' }]}
                >
                  <Select
                    placeholder="Select color"
                    disabled={modalMode === 'view'}
                    options={DROPDOWN_OPTIONS.color}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>

          <SectionBox title="Plate & Pricing" accent="#eb2f96">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Plate Block Number" name="plateBlockNumber">
                  <InputNumber
                    min={0}
                    placeholder="e.g., 1"
                    disabled={modalMode === 'view'}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Rate (₹)"
                  name="rate"
                  rules={[{ required: true, message: 'Please enter rate.' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    placeholder="e.g., 2.75"
                    disabled={modalMode === 'view'}
                    style={{ width: '100%', borderRadius: 8 }}
                    prefix="₹"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Design" name="design" valuePropName="checked">
                  <Checkbox disabled={modalMode === 'view'}>
                    Has Design
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Plate Available"
                  name="plateAvailable"
                  valuePropName="checked"
                >
                  <Checkbox disabled={modalMode === 'view'}>
                    Plate Available
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </SectionBox>
        </Form>
      </Modal>
    </div>
  );
}
