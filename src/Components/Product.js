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
} from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from './Navbar';

const API_BASE_URL = 'http://localhost:8000/api';

// Dropdown options
const DROPDOWN_OPTIONS = {
  bagMaterial: [
    { label: 'Cotton Canvas', value: 'Cotton Canvas' },
    { label: 'Jute', value: 'Jute' },
    { label: 'Organic Cotton', value: 'Organic Cotton' },
    { label: 'Recycled Polyester', value: 'Recycled Polyester' },
    { label: 'Linen', value: 'Linen' },
  ],
  sheetGSM: [
    { label: '200', value: '200' },
    { label: '250', value: '250' },
    { label: '300', value: '300' },
    { label: '350', value: '350' },
    { label: '400', value: '400' },
    { label: '450', value: '450' },
    { label: '500', value: '500' },
  ],
  sheetColor: [
    { label: 'Natural White', value: 'Natural White' },
    { label: 'Off White', value: 'Off White' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Kraft', value: 'Kraft' },
  ],
  borderGSM: [
    { label: '50', value: '50' },
    { label: '75', value: '75' },
    { label: '90', value: '90' },
    { label: '100', value: '100' },
    { label: '120', value: '120' },
    { label: '150', value: '150' },
  ],
  borderColor: [
    { label: 'Black', value: 'Black' },
    { label: 'Brown', value: 'Brown' },
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
  ],
  handleColor: [
    { label: 'Beige', value: 'Beige' },
    { label: 'Black', value: 'Black' },
    { label: 'Brown', value: 'Brown' },
    { label: 'White', value: 'White' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'Red', value: 'Red' },
  ],
  handleGSM: [
    { label: '100', value: '100' },
    { label: '120', value: '120' },
    { label: '150', value: '150' },
    { label: '180', value: '180' },
    { label: '200', value: '200' },
  ],
  color: [
    { label: 'White', value: 'White' },
    { label: 'Black', value: 'Black' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Brown', value: 'Brown' },
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
  ],
};

export default function Products() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // modal/form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit | view
  const [editingProductId, setEditingProductId] = useState(null);
  const [form] = Form.useForm();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const products = await response.json();
      const dataWithKeys = products.map((p) => ({ key: p.productId, ...p }));
      setData(dataWithKeys);
    } catch (error) {
      message.error('Failed to load products');
      console.error(error);
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

    return data.filter((row) => {
      const haystack = [
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
        .join(' ');
      return haystack.includes(q);
    });
  }, [data, searchText]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingProductId(null);

    form.resetFields();
    form.setFieldsValue({
      productType: '',
      productSize: 0,
      bagMaterial: '',
      quantity: 0,
      sheetGSM: '',
      sheetColor: '',
      borderGSM: '',
      borderColor: '',
      handleType: '',
      handleColor: '',
      handleGSM: '',
      printingType: '',
      printColor: '',
      color: '',
      design: false,
      plateBlockNumber: 0,
      plateAvailable: false,
      rate: 0,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingProductId(record.productId);

    form.resetFields();
    form.setFieldsValue({
      productType: record.productType || '',
      productSize: Number(record.productSize ?? 0),
      bagMaterial: record.bagMaterial || '',
      quantity: Number(record.quantity ?? 0),
      sheetGSM: record.sheetGSM || '',
      sheetColor: record.sheetColor || '',
      borderGSM: record.borderGSM || '',
      borderColor: record.borderColor || '',
      handleType: record.handleType || '',
      handleColor: record.handleColor || '',
      handleGSM: record.handleGSM || '',
      printingType: record.printingType || '',
      printColor: record.printColor || '',
      color: record.color || '',
      design: record.design || false,
      plateBlockNumber: Number(record.plateBlockNumber ?? 0),
      plateAvailable: record.plateAvailable || false,
      rate: Number(record.rate ?? 0),
    });

    setIsModalOpen(true);
  };

  const openViewModal = (record) => {
    setModalMode('view');
    setEditingProductId(record.productId);

    form.resetFields();
    form.setFieldsValue({
      productType: record.productType || '',
      productSize: Number(record.productSize ?? 0),
      bagMaterial: record.bagMaterial || '',
      quantity: Number(record.quantity ?? 0),
      sheetGSM: record.sheetGSM || '',
      sheetColor: record.sheetColor || '',
      borderGSM: record.borderGSM || '',
      borderColor: record.borderColor || '',
      handleType: record.handleType || '',
      handleColor: record.handleColor || '',
      handleGSM: record.handleGSM || '',
      printingType: record.printingType || '',
      printColor: record.printColor || '',
      color: record.color || '',
      design: record.design || false,
      plateBlockNumber: Number(record.plateBlockNumber ?? 0),
      plateAvailable: record.plateAvailable || false,
      rate: Number(record.rate ?? 0),
    });

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        try {
          const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            throw new Error('Failed to create product');
          }

          const newProduct = await response.json();
          setData((prev) => [
            { key: newProduct.productId, ...newProduct },
            ...prev,
          ]);
          setPagination((p) => ({ ...p, current: 1 }));
          setIsModalOpen(false);
          message.success(`Added Product ID: ${newProduct.productId}`);
        } catch (error) {
          message.error('Failed to create product');
          console.error(error);
        }
        return;
      }

      if (modalMode === 'edit') {
        if (!editingProductId) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/products/${editingProductId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to update product');
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
        } catch (error) {
          message.error('Failed to update product');
          console.error(error);
        }
      }
    } catch {
      // antd will show validation errors
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setData((prev) => prev.filter((row) => row.productId !== productId));
      message.success(`Deleted Product ID: ${productId}`);
    } catch (error) {
      message.error('Failed to delete product');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      sorter: (a, b) => a.productId - b.productId,
    },
    {
      title: 'Product Type',
      dataIndex: 'productType',
      key: 'productType',
      sorter: (a, b) =>
        String(a.productType).localeCompare(String(b.productType)),
    },
    {
      title: 'Material',
      dataIndex: 'bagMaterial',
      key: 'bagMaterial',
      sorter: (a, b) =>
        String(a.bagMaterial).localeCompare(String(b.bagMaterial)),
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
      render: (q) => Number(q ?? 0).toLocaleString('en-IN'),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      sorter: (a, b) => String(a.color).localeCompare(String(b.color)),
    },
    {
      title: 'Printing Type',
      dataIndex: 'printingType',
      key: 'printingType',
      sorter: (a, b) =>
        String(a.printingType).localeCompare(String(b.printingType)),
    },
    {
      title: 'Rate (₹)',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.rate ?? 0) - (b.rate ?? 0),
      render: (rate) => Number(rate ?? 0).toFixed(2),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openViewModal(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
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
            <Button danger size="small" icon={<DeleteOutlined />}>
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

      <div style={{ maxWidth: 1400, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Products</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by Product ID, Type, Material, Color, Printing Type..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={(value) => onSearchChange(value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="primary" onClick={openAddModal}>
              Add Product
            </Button>
          </div>
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : filteredData.length === 0 ? (
          <Empty description="No products found" style={{ padding: '40px' }} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50, 100],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} products`,
            }}
            onChange={(newPagination) => {
              setPagination({
                current: newPagination.current,
                pageSize: newPagination.pageSize,
              });
            }}
            scroll={{ x: 1200 }}
          />
        )}

        <style>{`
          .ant-table-thead > tr > th {
            background: #1f2937 !important;
            color: #ffffff !important;
            font-weight: 600;
          }
          .ant-table-thead > tr > th .ant-table-column-sorter {
            color: rgba(255, 255, 255, 0.95);
          }
          .readonly-form-item .ant-input,
          .readonly-form-item .ant-input-number,
          .readonly-form-item .ant-select-selector {
            background-color: #f5f5f5 !important;
            color: #1f2937 !important;
            font-weight: 500;
            border-color: #d9d9d9 !important;
          }
          .readonly-form-item .ant-input::placeholder {
            color: #999 !important;
          }
          .readonly-form-item .ant-checkbox-inner {
            background-color: #f5f5f5 !important;
          }
        `}</style>

        <Modal
          title={
            modalMode === 'add'
              ? 'Add Product'
              : modalMode === 'edit'
                ? `Edit Product (ID: ${editingProductId})`
                : `View Product (ID: ${editingProductId})`
          }
          open={isModalOpen}
          onCancel={closeModal}
          onOk={modalMode === 'view' ? closeModal : handleSubmit}
          okText={
            modalMode === 'add'
              ? 'Add'
              : modalMode === 'edit'
                ? 'Save'
                : 'Close'
          }
          cancelButtonProps={{
            style: { display: modalMode === 'view' ? 'none' : 'inline-block' },
          }}
        >
          <Form
            form={form}
            layout="vertical"
            className={modalMode === 'view' ? 'readonly-form-item' : ''}
          >
            {/* Row 1 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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
                />
              </Form.Item>

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
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* Row 2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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

              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{ required: true, message: 'Please enter quantity.' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="e.g., 5000"
                  disabled={modalMode === 'view'}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* Row 3 - Sheet */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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
            </div>

            {/* Row 4 - Border */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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
            </div>

            {/* Row 5 - Handle */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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
            </div>

            {/* Row 6 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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
            </div>

            {/* Row 7 - Printing */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
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
            </div>

            {/* Row 8 - Plate */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <Form.Item
                label="Plate Block Number"
                name="plateBlockNumber"
                rules={[
                  {
                    required: true,
                    message: 'Please enter plate block number.',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="e.g., 1"
                  disabled={modalMode === 'view'}
                  style={{ width: '100%' }}
                />
              </Form.Item>

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
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* Row 9 - Booleans */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <Form.Item label="Design" name="design" valuePropName="checked">
                <Checkbox disabled={modalMode === 'view'}>Has Design</Checkbox>
              </Form.Item>

              <Form.Item
                label="Plate Available"
                name="plateAvailable"
                valuePropName="checked"
              >
                <Checkbox disabled={modalMode === 'view'}>
                  Plate Available
                </Checkbox>
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
