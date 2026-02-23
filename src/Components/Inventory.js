import { useMemo, useState } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Popconfirm,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
  message,
} from 'antd';
import Navbar from './Navbar';

const CATEGORY_OPTIONS = [
  { value: 'Paper', label: 'Paper' },
  { value: 'Cloth', label: 'Cloth' },
  { value: 'Ink', label: 'Ink' },
];

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'roll', label: 'roll' },
  { value: 'ream', label: 'ream' },
  { value: 'liter', label: 'liter' },
  { value: 'pcs', label: 'pcs' },
];

function stockStatus(qty, reorderLevel) {
  if (qty <= 0) return { text: 'Out of stock', color: 'red' };
  if (qty <= reorderLevel) return { text: 'Low', color: 'orange' };
  return { text: 'In stock', color: 'green' };
}

export default function Inventory() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  const initialData = useMemo(() => {
    const paperNames = [
      'A4 Paper (80 GSM)',
      'A3 Paper (70 GSM)',
      'Kraft Paper (Brown)',
      'Glossy Photo Paper',
      'Thermal Paper Roll',
      'Cardstock Paper',
    ];

    const clothNames = [
      'Cotton Cloth (White)',
      'Polyester Cloth (Grey)',
      'Canvas Cloth',
      'Linen Cloth',
      'Silk Cloth',
      'Denim Cloth',
    ];

    const inkNames = [
      'Black Ink (Industrial)',
      'Cyan Ink (Printer Grade)',
      'Magenta Ink',
      'Yellow Ink',
      'UV Ink',
      'Solvent Ink',
    ];

    const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C'];
    const suppliers = ['PaperMart', 'TextileHub', 'InkWorks', 'Metro Supplies'];

    const rand = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const pickUnit = (category) => {
      if (category === 'Ink') return 'liter';
      if (category === 'Paper') return ['ream', 'roll', 'pcs'][rand(0, 2)];
      if (category === 'Cloth') return ['roll', 'kg'][rand(0, 1)];
      return 'pcs';
    };

    const pickName = (category, i) => {
      if (category === 'Paper') return paperNames[i % paperNames.length];
      if (category === 'Cloth') return clothNames[i % clothNames.length];
      return inkNames[i % inkNames.length];
    };

    // ✅ generate 100 rows
    return Array.from({ length: 100 }, (_, i) => {
      const idx = i + 1;
      const category = ['Paper', 'Cloth', 'Ink'][i % 3];

      const reorderLevel = rand(5, 30);
      const quantity = rand(0, 200);

      return {
        key: `inv-${idx}`,
        itemCode: `INV-${2000 + idx}`,
        itemName: `${pickName(category, i)} - SKU #${500 + (i % 50)}`,
        category,
        unit: pickUnit(category),
        quantity,
        reorderLevel,
        location: locations[i % locations.length],
        supplier: suppliers[i % suppliers.length],
      };
    });
  }, []);

  const [data, setData] = useState(initialData);

  const nextItemCodeNumber = useMemo(() => {
    let max = 2000;
    for (const row of data) {
      const match = String(row.itemCode || '').match(/^INV-(\d+)$/i);
      if (match) {
        const n = Number(match[1]);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    }
    return max + 1;
  }, [data]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingKey(null);
    form.resetFields();
    form.setFieldsValue({
      category: 'Paper',
      unit: 'pcs',
      quantity: 0,
      reorderLevel: 10,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingKey(record.key);
    form.setFieldsValue({
      itemName: record.itemName,
      category: record.category,
      unit: record.unit,
      quantity: record.quantity,
      reorderLevel: record.reorderLevel,
      location: record.location,
      supplier: record.supplier,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        const newRow = {
          key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          itemCode: `INV-${nextItemCodeNumber}`,
          itemName: values.itemName,
          category: values.category,
          unit: values.unit,
          quantity: values.quantity,
          reorderLevel: values.reorderLevel,
          location: values.location || '-',
          supplier: values.supplier || '-',
        };

        setData((prev) => [newRow, ...prev]);
        setPagination((p) => ({ ...p, current: 1 }));
        message.success('Inventory item added');
      } else {
        setData((prev) =>
          prev.map((row) =>
            row.key !== editingKey
              ? row
              : {
                  ...row,
                  itemName: values.itemName,
                  category: values.category,
                  unit: values.unit,
                  quantity: values.quantity,
                  reorderLevel: values.reorderLevel,
                  location: values.location || '-',
                  supplier: values.supplier || '-',
                },
          ),
        );
        message.success('Inventory item updated');
      }

      setIsModalOpen(false);
    } catch {
      // antd handles validation UI
    }
  };

  const handleDelete = (key) => {
    setData((prev) => prev.filter((row) => row.key !== key));
    message.success('Item deleted');
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) => {
      const haystack = [
        row.itemCode,
        row.itemName,
        row.category,
        row.location,
        row.supplier,
      ]
        .map((x) => String(x || '').toLowerCase())
        .join(' ');
      return haystack.includes(q);
    });
  }, [data, searchText]);

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      sorter: (a, b) => String(a.itemCode).localeCompare(String(b.itemCode)),
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      sorter: (a, b) => String(a.itemName).localeCompare(String(b.itemName)),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: CATEGORY_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.category === value,
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => (a.quantity ?? 0) - (b.quantity ?? 0),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      sorter: (a, b) => (a.reorderLevel ?? 0) - (b.reorderLevel ?? 0),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const { text, color } = stockStatus(
          record.quantity,
          record.reorderLevel,
        );
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => String(a.location).localeCompare(String(b.location)),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      sorter: (a, b) => String(a.supplier).localeCompare(String(b.supplier)),
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
            title="Delete this item?"
            description={`Are you sure you want to delete ${record.itemCode}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.key)}
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
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Inventory</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by item code, name, category, location, supplier..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            onSearch={(value) => handleSearchChange(value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={openAddModal}>
              Add Item
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
              `${range[0]}-${range[1]} of ${total} items`,
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
            modalMode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'
          }
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmitModal}
          okText={modalMode === 'add' ? 'Add' : 'Save'}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Item Name"
              name="itemName"
              rules={[
                { required: true, message: 'Please enter item name.' },
                { min: 2, message: 'Item name must be at least 2 characters.' },
              ]}
            >
              <Input placeholder="e.g., A4 Paper (80 GSM)" />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please select category.' }]}
            >
              <Select options={CATEGORY_OPTIONS} />
            </Form.Item>

            <Form.Item
              label="Unit"
              name="unit"
              rules={[{ required: true, message: 'Please select unit.' }]}
            >
              <Select options={UNIT_OPTIONS} />
            </Form.Item>

            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[{ required: true, message: 'Please enter quantity.' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Reorder Level"
              name="reorderLevel"
              rules={[
                { required: true, message: 'Please enter reorder level.' },
              ]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Location" name="location">
              <Input placeholder="e.g., Warehouse A" />
            </Form.Item>

            <Form.Item label="Supplier" name="supplier">
              <Input placeholder="e.g., PaperMart" />
            </Form.Item>

            <div style={{ fontSize: 12, color: '#667085' }}>
              {modalMode === 'add'
                ? `Item code will be auto-generated (e.g., INV-${nextItemCodeNumber})`
                : 'Item code cannot be changed.'}
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
