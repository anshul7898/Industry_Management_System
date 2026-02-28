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
  InputNumber,
  Select,
  Checkbox,
  Descriptions,
} from 'antd';
import Navbar from './Navbar';

// DROPDOWN OPTIONS - MUST match backend VALID_* sets exactly
const DROPDOWN_OPTIONS = {
  productTypes: [
    { label: 'Shopping Bag', value: 'Shopping Bag' },
    { label: 'Grocery Bag', value: 'Grocery Bag' },
    { label: 'Provisions Bag', value: 'Provisions Bag' },
  ],
  bagMaterials: [
    { label: 'Cotton Canvas', value: 'Cotton Canvas' },
    { label: 'Cotton Blend', value: 'Cotton Blend' },
    { label: 'Jute', value: 'Jute' },
    { label: 'Organic Cotton', value: 'Organic Cotton' },
    { label: 'Recycled Polyester', value: 'Recycled Polyester' },
    { label: 'Linen', value: 'Linen' },
  ],
  handleTypes: [
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
  printingTypes: [
    { label: 'Screen Printing', value: 'Screen Printing' },
    { label: 'Digital Printing', value: 'Digital Printing' },
    { label: 'Flexography', value: 'Flexography' },
    { label: 'Offset Printing', value: 'Offset Printing' },
    { label: 'Embroidery', value: 'Embroidery' },
    { label: 'Stamping', value: 'Stamping' },
  ],
  sheetColors: [
    { label: 'Natural White', value: 'Natural White' },
    { label: 'Off White', value: 'Off White' },
    { label: 'Beige', value: 'Beige' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Kraft', value: 'Kraft' },
  ],
  borderColors: [
    { label: 'Black', value: 'Black' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'White', value: 'White' },
    { label: 'Gray', value: 'Gray' },
    { label: 'Red', value: 'Red' },
  ],
  handleColors: [
    { label: 'Beige', value: 'Beige' },
    { label: 'Black', value: 'Black' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'Red', value: 'Red' },
    { label: 'White', value: 'White' },
  ],
  colors: [
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
  printColors: [
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
  sheetGSMs: [
    { label: '200', value: 200 },
    { label: '250', value: 250 },
    { label: '300', value: 300 },
    { label: '350', value: 350 },
    { label: '400', value: 400 },
    { label: '450', value: 450 },
    { label: '500', value: 500 },
  ],
  borderGSMs: [
    { label: '50', value: 50 },
    { label: '75', value: 75 },
    { label: '90', value: 90 },
    { label: '100', value: 100 },
    { label: '120', value: 120 },
    { label: '150', value: 150 },
  ],
  handleGSMs: [
    { label: '100', value: 100 },
    { label: '120', value: 120 },
    { label: '150', value: 150 },
    { label: '180', value: 180 },
    { label: '200', value: 200 },
  ],
};

export default function Order() {
  const [searchText, setSearchText] = useState('');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  const [form] = Form.useForm();

  async function fetchOrders() {
    const res = await fetch('/api/orders');
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch orders (${res.status}): ${text}`);
    }
    const orders = await res.json();
    return Array.isArray(orders) ? orders : [];
  }

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const orders = await fetchOrders();

      const rows = orders.map((o, idx) => ({
        key: o.OrderId ?? String(idx),
        ...o,
      }));

      setData(rows);
    } catch (err) {
      message.error(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const orders = await fetchOrders();
        if (cancelled) return;

        const rows = orders.map((o, idx) => ({
          key: o.OrderId ?? String(idx),
          ...o,
        }));

        setData(rows);
      } catch (err) {
        if (!cancelled) message.error(err?.message || 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const compareText = (a, b, field) =>
    String(a?.[field] ?? '').localeCompare(String(b?.[field] ?? ''));

  const compareNumber = (a, b, field) => {
    const aVal = Number(a?.[field] ?? 0);
    const bVal = Number(b?.[field] ?? 0);
    return aVal - bVal;
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingOrderId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingOrderId(record.OrderId);

    form.setFieldsValue({
      AgentId: record.AgentId,
      Party_Name: record.Party_Name,
      AliasOrCompanyName: record.AliasOrCompanyName,
      Address: record.Address,
      City: record.City,
      State: record.State,
      Pincode: record.Pincode,
      Contact_Person1: record.Contact_Person1,
      Contact_Person2: record.Contact_Person2,
      Mobile1: record.Mobile1,
      Mobile2: record.Mobile2,
      Email: record.Email,
      ProductType: record.ProductType,
      ProductId: record.ProductId,
      ProductSize: record.ProductSize,
      BagMaterial: record.BagMaterial,
      Quantity: record.Quantity,
      SheetGSM: record.SheetGSM,
      SheetColor: record.SheetColor,
      BorderGSM: record.BorderGSM,
      BorderColor: record.BorderColor,
      HandleType: record.HandleType,
      HandleColor: record.HandleColor,
      HandleGSM: record.HandleGSM,
      PrintingType: record.PrintingType,
      PrintColor: record.PrintColor,
      Color: record.Color,
      Design: record.Design,
      PlateBlockNumber: record.PlateBlockNumber,
      PlateAvailable: record.PlateAvailable,
      Rate: record.Rate,
      TotalAmount: record.TotalAmount,
    });

    setIsModalOpen(true);
  };

  const openViewModal = (record) => {
    setViewingOrder(record);
    setViewModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingOrder(null);
  };

  const handleAdd = async (values) => {
    const payload = {
      AgentId: values.AgentId,
      Party_Name: values.Party_Name,
      AliasOrCompanyName: values.AliasOrCompanyName,
      Address: values.Address,
      City: values.City,
      State: values.State,
      Pincode: values.Pincode,
      Contact_Person1: values.Contact_Person1,
      Contact_Person2: values.Contact_Person2 || null,
      Mobile1: values.Mobile1,
      Mobile2: values.Mobile2 || null,
      Email: values.Email,
      ProductType: values.ProductType,
      ProductId: values.ProductId,
      ProductSize: values.ProductSize,
      BagMaterial: values.BagMaterial,
      Quantity: values.Quantity,
      SheetGSM: Number(values.SheetGSM),
      SheetColor: values.SheetColor,
      BorderGSM: Number(values.BorderGSM),
      BorderColor: values.BorderColor,
      HandleType: values.HandleType,
      HandleColor: values.HandleColor,
      HandleGSM: Number(values.HandleGSM),
      PrintingType: values.PrintingType,
      PrintColor: values.PrintColor,
      Color: values.Color,
      Design: values.Design || false,
      PlateBlockNumber: values.PlateBlockNumber || null,
      PlateAvailable: values.PlateAvailable || false,
      Rate: values.Rate,
      TotalAmount: values.TotalAmount,
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to create order (${res.status}): ${text}`);
    }

    return res.json().catch(() => null);
  };

  const handleUpdate = async (orderId, values) => {
    const payload = {
      AgentId: values.AgentId,
      Party_Name: values.Party_Name,
      AliasOrCompanyName: values.AliasOrCompanyName,
      Address: values.Address,
      City: values.City,
      State: values.State,
      Pincode: values.Pincode,
      Contact_Person1: values.Contact_Person1,
      Contact_Person2: values.Contact_Person2 || null,
      Mobile1: values.Mobile1,
      Mobile2: values.Mobile2 || null,
      Email: values.Email,
      ProductType: values.ProductType,
      ProductId: values.ProductId,
      ProductSize: values.ProductSize,
      BagMaterial: values.BagMaterial,
      Quantity: values.Quantity,
      SheetGSM: Number(values.SheetGSM),
      SheetColor: values.SheetColor,
      BorderGSM: Number(values.BorderGSM),
      BorderColor: values.BorderColor,
      HandleType: values.HandleType,
      HandleColor: values.HandleColor,
      HandleGSM: Number(values.HandleGSM),
      PrintingType: values.PrintingType,
      PrintColor: values.PrintColor,
      Color: values.Color,
      Design: values.Design || false,
      PlateBlockNumber: values.PlateBlockNumber || null,
      PlateAvailable: values.PlateAvailable || false,
      Rate: values.Rate,
      TotalAmount: values.TotalAmount,
    };

    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to update order (${res.status}): ${text}`);
    }

    return res.json().catch(() => null);
  };

  const handleDelete = async (orderId) => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to delete order (${res.status}): ${text}`);
    }
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === 'add') {
        const created = await handleAdd(values);
        message.success(
          created?.OrderId ? `Created ${created.OrderId}` : 'Order created',
        );

        setIsModalOpen(false);
        setPagination((p) => ({ ...p, current: 1 }));
        await refreshOrders();
        return;
      }

      if (modalMode === 'edit') {
        if (!editingOrderId) throw new Error('Missing OrderId for update.');

        const updated = await handleUpdate(editingOrderId, values);
        message.success(
          updated?.OrderId ? `Updated ${updated.OrderId}` : 'Order updated',
        );

        setIsModalOpen(false);
        await refreshOrders();
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'OrderId',
      key: 'OrderId',
      width: 120,
      sorter: (a, b) => compareText(a, b, 'OrderId'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Agent ID',
      dataIndex: 'AgentId',
      key: 'AgentId',
      width: 100,
      sorter: (a, b) => compareNumber(a, b, 'AgentId'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Party Name',
      dataIndex: 'Party_Name',
      key: 'Party_Name',
      width: 150,
      sorter: (a, b) => compareText(a, b, 'Party_Name'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Contact Person 1',
      dataIndex: 'Contact_Person1',
      key: 'Contact_Person1',
      width: 140,
      sorter: (a, b) => compareText(a, b, 'Contact_Person1'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Mobile 1',
      dataIndex: 'Mobile1',
      key: 'Mobile1',
      width: 120,
      sorter: (a, b) => compareNumber(a, b, 'Mobile1'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
      width: 150,
      sorter: (a, b) => compareText(a, b, 'Email'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Product Type',
      dataIndex: 'ProductType',
      key: 'ProductType',
      width: 130,
      sorter: (a, b) => compareText(a, b, 'ProductType'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Quantity',
      dataIndex: 'Quantity',
      key: 'Quantity',
      width: 100,
      sorter: (a, b) => compareNumber(a, b, 'Quantity'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Rate',
      dataIndex: 'Rate',
      key: 'Rate',
      width: 100,
      sorter: (a, b) => compareNumber(a, b, 'Rate'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Total Amount',
      dataIndex: 'TotalAmount',
      key: 'TotalAmount',
      width: 120,
      sorter: (a, b) => compareNumber(a, b, 'TotalAmount'),
      sortDirections: ['ascend', 'descend'],
      render: (text) => `₹${Number(text || 0).toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => openViewModal(record)}
          >
            View
          </Button>

          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete this order?"
            description={`Are you sure you want to delete ${record.OrderId}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                setLoading(true);
                await handleDelete(record.OrderId);
                message.success(`Deleted ${record.OrderId}`);
                await refreshOrders();
              } catch (err) {
                message.error(err?.message || 'Failed to delete order');
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
      const orderId = String(row.OrderId || '').toLowerCase();
      const party = String(row.Party_Name || '').toLowerCase();
      const contact = String(row.Contact_Person1 || '').toLowerCase();
      const email = String(row.Email || '').toLowerCase();
      return (
        orderId.includes(q) ||
        party.includes(q) ||
        contact.includes(q) ||
        email.includes(q)
      );
    });
  }, [data, searchText]);

  const onSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  return (
    <div style={{ width: '100%' }}>
      <Navbar />

      <div style={{ maxWidth: 1400, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Orders</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by Order ID, Party Name, Contact Person, or Email"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={(value) => onSearchChange(value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={refreshOrders} disabled={loading}>
              Refresh
            </Button>
            <Button type="primary" onClick={openAddModal}>
              Add Order
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
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            });
          }}
          scroll={{ x: 1500 }}
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
          .ant-table-thead > tr > th .ant-table-column-sorter-up,
          .ant-table-thead > tr > th .ant-table-column-sorter-down {
            color: rgba(255, 255, 255, 0.95);
          }
        `}</style>

        {/* View Order Modal */}
        <Modal
          title={`View Order - ${viewingOrder?.OrderId || ''}`}
          open={viewModalOpen}
          onCancel={closeViewModal}
          footer={[
            <Button key="close" type="primary" onClick={closeViewModal}>
              Close
            </Button>,
          ]}
          width={900}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {viewingOrder && (
            <div>
              {/* Party Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Party Information
                </h3>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Agent ID">
                    {viewingOrder.AgentId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Party Name">
                    {viewingOrder.Party_Name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Alias / Company Name">
                    {viewingOrder.AliasOrCompanyName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {viewingOrder.Address}
                  </Descriptions.Item>
                  <Descriptions.Item label="City">
                    {viewingOrder.City}
                  </Descriptions.Item>
                  <Descriptions.Item label="State">
                    {viewingOrder.State}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pincode">
                    {viewingOrder.Pincode}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Contact Information
                </h3>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Contact Person 1">
                    {viewingOrder.Contact_Person1}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact Person 2">
                    {viewingOrder.Contact_Person2 || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mobile 1">
                    {viewingOrder.Mobile1}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mobile 2">
                    {viewingOrder.Mobile2 || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email" span={2}>
                    {viewingOrder.Email}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Product Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Product Information
                </h3>
                <Descriptions bordered size="small" column={3}>
                  <Descriptions.Item label="Product Type">
                    {viewingOrder.ProductType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Product ID">
                    {viewingOrder.ProductId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Product Size">
                    {viewingOrder.ProductSize}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bag Material">
                    {viewingOrder.BagMaterial}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quantity">
                    {viewingOrder.Quantity}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Sheet Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Sheet Information
                </h3>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Sheet GSM">
                    {viewingOrder.SheetGSM}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sheet Color">
                    {viewingOrder.SheetColor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Border GSM">
                    {viewingOrder.BorderGSM}
                  </Descriptions.Item>
                  <Descriptions.Item label="Border Color">
                    {viewingOrder.BorderColor}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Handle Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Handle Information
                </h3>
                <Descriptions bordered size="small" column={3}>
                  <Descriptions.Item label="Handle Type">
                    {viewingOrder.HandleType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Handle Color">
                    {viewingOrder.HandleColor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Handle GSM">
                    {viewingOrder.HandleGSM}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Printing Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Printing Information
                </h3>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Printing Type">
                    {viewingOrder.PrintingType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Print Color">
                    {viewingOrder.PrintColor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Color">
                    {viewingOrder.Color}
                  </Descriptions.Item>
                  <Descriptions.Item label="Design">
                    {viewingOrder.Design ? 'Yes' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Plate Available">
                    {viewingOrder.PlateAvailable ? 'Yes' : 'No'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Plate Block Number">
                    {viewingOrder.PlateBlockNumber || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Pricing Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Pricing Information
                </h3>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Rate">
                    ₹{Number(viewingOrder.Rate || 0).toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Amount">
                    ₹{Number(viewingOrder.TotalAmount || 0).toFixed(2)}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Order Modal */}
        <Modal
          title={modalMode === 'add' ? 'Add Order' : 'Edit Order'}
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmitModal}
          okText={modalMode === 'add' ? 'Add' : 'Save'}
          confirmLoading={loading}
          width={900}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          <Form form={form} layout="vertical">
            {/* Party Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Party Information</h3>

              <Form.Item
                label="Agent ID"
                name="AgentId"
                rules={[{ required: true, message: 'Please enter Agent ID.' }]}
              >
                <InputNumber
                  placeholder="e.g., 101"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="Party Name"
                name="Party_Name"
                rules={[
                  { required: true, message: 'Please enter Party Name.' },
                ]}
              >
                <Input placeholder="e.g., ABC Packaging Solutions" />
              </Form.Item>

              <Form.Item
                label="Alias / Company Name"
                name="AliasOrCompanyName"
                rules={[
                  {
                    required: true,
                    message: 'Please enter Alias or Company Name.',
                  },
                ]}
              >
                <Input placeholder="e.g., ABC Pack" />
              </Form.Item>

              <Form.Item
                label="Address"
                name="Address"
                rules={[{ required: true, message: 'Please enter Address.' }]}
              >
                <Input placeholder="e.g., Plot 123, Industrial Area" />
              </Form.Item>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="City"
                  name="City"
                  rules={[{ required: true, message: 'Please enter City.' }]}
                >
                  <Input placeholder="e.g., Mumbai" />
                </Form.Item>

                <Form.Item
                  label="State"
                  name="State"
                  rules={[{ required: true, message: 'Please enter State.' }]}
                >
                  <Input placeholder="e.g., Maharashtra" />
                </Form.Item>

                <Form.Item
                  label="Pincode"
                  name="Pincode"
                  rules={[
                    { required: true, message: 'Please enter Pincode.' },
                    {
                      pattern: /^\d{6}$/,
                      message: 'Pincode must be 6 digits.',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 400001"
                    maxLength={6}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Contact Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Contact Information</h3>

              <Form.Item
                label="Contact Person 1"
                name="Contact_Person1"
                rules={[
                  { required: true, message: 'Please enter Contact Person 1.' },
                ]}
              >
                <Input placeholder="e.g., Rajesh Kumar" />
              </Form.Item>

              <Form.Item
                label="Contact Person 2 (Optional)"
                name="Contact_Person2"
              >
                <Input placeholder="e.g., Priya Sharma" />
              </Form.Item>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Mobile 1"
                  name="Mobile1"
                  rules={[
                    { required: true, message: 'Please enter Mobile 1.' },
                    {
                      pattern: /^\d{10}$/,
                      message: 'Mobile must be 10 digits.',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 9876543210"
                    maxLength={10}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="Mobile 2 (Optional)"
                  name="Mobile2"
                  rules={[
                    {
                      pattern: /^(\d{10})?$/,
                      message: 'Mobile must be 10 digits.',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 9876543211"
                    maxLength={10}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Email"
                name="Email"
                rules={[
                  { required: true, message: 'Please enter Email.' },
                  { type: 'email', message: 'Please enter a valid email.' },
                ]}
              >
                <Input placeholder="e.g., rajesh@abcpack.com" />
              </Form.Item>
            </div>

            {/* Product Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Product Information</h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Product Type"
                  name="ProductType"
                  rules={[
                    { required: true, message: 'Please select Product Type.' },
                  ]}
                >
                  <Select
                    placeholder="Select Product Type"
                    options={DROPDOWN_OPTIONS.productTypes}
                  />
                </Form.Item>

                <Form.Item
                  label="Product ID"
                  name="ProductId"
                  rules={[
                    { required: true, message: 'Please enter Product ID.' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 1001"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="Product Size"
                  name="ProductSize"
                  rules={[
                    { required: true, message: 'Please enter Product Size.' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 14"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Bag Material"
                  name="BagMaterial"
                  rules={[
                    { required: true, message: 'Please select Bag Material.' },
                  ]}
                >
                  <Select
                    placeholder="Select Bag Material"
                    options={DROPDOWN_OPTIONS.bagMaterials}
                  />
                </Form.Item>

                <Form.Item
                  label="Quantity"
                  name="Quantity"
                  rules={[
                    { required: true, message: 'Please enter Quantity.' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 5000"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Sheet Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Sheet Information</h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Sheet GSM"
                  name="SheetGSM"
                  rules={[
                    { required: true, message: 'Please select Sheet GSM.' },
                  ]}
                >
                  <Select
                    placeholder="Select Sheet GSM"
                    options={DROPDOWN_OPTIONS.sheetGSMs}
                  />
                </Form.Item>

                <Form.Item
                  label="Sheet Color"
                  name="SheetColor"
                  rules={[
                    { required: true, message: 'Please select Sheet Color.' },
                  ]}
                >
                  <Select
                    placeholder="Select Sheet Color"
                    options={DROPDOWN_OPTIONS.sheetColors}
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Border GSM"
                  name="BorderGSM"
                  rules={[
                    { required: true, message: 'Please select Border GSM.' },
                  ]}
                >
                  <Select
                    placeholder="Select Border GSM"
                    options={DROPDOWN_OPTIONS.borderGSMs}
                  />
                </Form.Item>

                <Form.Item
                  label="Border Color"
                  name="BorderColor"
                  rules={[
                    { required: true, message: 'Please select Border Color.' },
                  ]}
                >
                  <Select
                    placeholder="Select Border Color"
                    options={DROPDOWN_OPTIONS.borderColors}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Handle Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Handle Information</h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Handle Type"
                  name="HandleType"
                  rules={[
                    { required: true, message: 'Please select Handle Type.' },
                  ]}
                >
                  <Select
                    placeholder="Select Handle Type"
                    options={DROPDOWN_OPTIONS.handleTypes}
                  />
                </Form.Item>

                <Form.Item
                  label="Handle Color"
                  name="HandleColor"
                  rules={[
                    { required: true, message: 'Please select Handle Color.' },
                  ]}
                >
                  <Select
                    placeholder="Select Handle Color"
                    options={DROPDOWN_OPTIONS.handleColors}
                  />
                </Form.Item>

                <Form.Item
                  label="Handle GSM"
                  name="HandleGSM"
                  rules={[
                    { required: true, message: 'Please select Handle GSM.' },
                  ]}
                >
                  <Select
                    placeholder="Select Handle GSM"
                    options={DROPDOWN_OPTIONS.handleGSMs}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Printing Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Printing Information</h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Printing Type"
                  name="PrintingType"
                  rules={[
                    { required: true, message: 'Please select Printing Type.' },
                  ]}
                >
                  <Select
                    placeholder="Select Printing Type"
                    options={DROPDOWN_OPTIONS.printingTypes}
                  />
                </Form.Item>

                <Form.Item
                  label="Print Color"
                  name="PrintColor"
                  rules={[
                    { required: true, message: 'Please select Print Color.' },
                  ]}
                >
                  <Select
                    placeholder="Select Print Color"
                    options={DROPDOWN_OPTIONS.printColors}
                  />
                </Form.Item>

                <Form.Item
                  label="Color"
                  name="Color"
                  rules={[{ required: true, message: 'Please select Color.' }]}
                >
                  <Select
                    placeholder="Select Color"
                    options={DROPDOWN_OPTIONS.colors}
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item label="Design" name="Design" valuePropName="checked">
                  <Checkbox>Has Custom Design</Checkbox>
                </Form.Item>

                <Form.Item
                  label="Plate Available"
                  name="PlateAvailable"
                  valuePropName="checked"
                >
                  <Checkbox>Plate Available</Checkbox>
                </Form.Item>
              </div>

              <Form.Item label="Plate Block Number" name="PlateBlockNumber">
                <InputNumber
                  placeholder="e.g., 2001"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            {/* Pricing Information */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Pricing Information</h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Form.Item
                  label="Rate"
                  name="Rate"
                  rules={[{ required: true, message: 'Please enter Rate.' }]}
                >
                  <InputNumber
                    placeholder="e.g., 45.50"
                    step={0.01}
                    style={{ width: '100%' }}
                    precision={2}
                  />
                </Form.Item>

                <Form.Item
                  label="Total Amount"
                  name="TotalAmount"
                  rules={[
                    { required: true, message: 'Please enter Total Amount.' },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 227500"
                    step={0.01}
                    style={{ width: '100%' }}
                    precision={2}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
