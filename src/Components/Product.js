import React, { useMemo, useState } from 'react';
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
} from 'antd';
import Navbar from './Navbar';

export default function Products() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [data, setData] = useState(() => {
    // seed a few rows (client-side only). Replace with API later if needed.
    const products = [
      {
        productId: 'PRD-1001',
        product: 'Industrial Pump',
        description: 'High-pressure industrial pump for manufacturing lines.',
        quantity: 35,
      },
      {
        productId: 'PRD-1002',
        product: 'Hydraulic Valve',
        description: 'Heavy-duty valve for hydraulic control systems.',
        quantity: 120,
      },
      {
        productId: 'PRD-1003',
        product: 'CNC Spindle',
        description: 'Precision spindle for CNC machines.',
        quantity: 8,
      },
      {
        productId: 'PRD-1004',
        product: 'Bearing Set',
        description: 'Industrial bearing set for rotating assemblies.',
        quantity: 250,
      },
      {
        productId: 'PRD-1005',
        product: 'Control Panel',
        description: 'Electrical control panel for automation systems.',
        quantity: 14,
      },
    ];

    return products.map((p) => ({ key: p.productId, ...p }));
  });

  // modal/form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [editingProductId, setEditingProductId] = useState(null);
  const [form] = Form.useForm();

  const nextProductIdNumber = useMemo(() => {
    let max = 1000;
    for (const row of data) {
      const match = String(row.productId || '').match(/^PRD-(\d+)$/i);
      if (match) {
        const n = Number(match[1]);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    }
    return max + 1;
  }, [data]);

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
        row.product,
        row.description,
        String(row.quantity),
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
      product: '',
      description: '',
      quantity: 0,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingProductId(record.productId);

    form.resetFields();
    form.setFieldsValue({
      product: record.product,
      description: record.description,
      quantity: Number(record.quantity ?? 0),
    });

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        const newRow = {
          key: `PRD-${nextProductIdNumber}`,
          productId: `PRD-${nextProductIdNumber}`,
          product: values.product,
          description: values.description,
          quantity: Number(values.quantity ?? 0),
        };

        setData((prev) => [newRow, ...prev]);
        setPagination((p) => ({ ...p, current: 1 }));
        setIsModalOpen(false);
        message.success(`Added ${newRow.productId}`);
        return;
      }

      if (modalMode === 'edit') {
        if (!editingProductId) return;

        setData((prev) =>
          prev.map((row) =>
            row.productId === editingProductId
              ? {
                  ...row,
                  product: values.product,
                  description: values.description,
                  quantity: Number(values.quantity ?? 0),
                }
              : row,
          ),
        );

        setIsModalOpen(false);
        message.success(`Updated ${editingProductId}`);
      }
    } catch {
      // antd will show validation errors
    }
  };

  const handleDelete = (productId) => {
    setData((prev) => prev.filter((row) => row.productId !== productId));
    message.success(`Deleted ${productId}`);
  };

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId',
      sorter: (a, b) => String(a.productId).localeCompare(String(b.productId)),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      sorter: (a, b) => String(a.product).localeCompare(String(b.product)),
    },
    {
      title: 'Product Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) =>
        String(a.description).localeCompare(String(b.description)),
    },
    {
      title: 'Product Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      sorter: (a, b) => (a.quantity ?? 0) - (b.quantity ?? 0),
      render: (q) => Number(q ?? 0).toLocaleString('en-IN'),
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
            title="Delete this product?"
            description={`Are you sure you want to delete ${record.productId}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.productId)}
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

      <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Product</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by Product ID, Product, Description, Quantity..."
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
        />

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
          title={
            modalMode === 'add'
              ? 'Add Product'
              : `Edit Product (${editingProductId})`
          }
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmit}
          okText={modalMode === 'add' ? 'Add' : 'Save'}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Product"
              name="product"
              rules={[
                { required: true, message: 'Please enter product name.' },
                {
                  min: 2,
                  message: 'Product name must be at least 2 characters.',
                },
              ]}
            >
              <Input placeholder="e.g., Industrial Pump" />
            </Form.Item>

            <Form.Item
              label="Product Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter description.' },
                {
                  min: 3,
                  message: 'Description must be at least 3 characters.',
                },
              ]}
            >
              <Input placeholder="e.g., High-pressure industrial pump..." />
            </Form.Item>

            <Form.Item
              label="Product Quantity"
              name="quantity"
              rules={[{ required: true, message: 'Please enter quantity.' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <div style={{ fontSize: 12, color: '#667085' }}>
              Product ID will be auto-generated (e.g., PRD-{nextProductIdNumber}
              )
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
