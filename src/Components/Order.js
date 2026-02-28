import { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Button,
  Popconfirm,
  Modal,
  Form,
  DatePicker,
  message,
} from 'antd';
import Navbar from './Navbar';
import dayjs from 'dayjs';

export default function Order() {
  const [searchText, setSearchText] = useState('');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingOrderId, setEditingOrderId] = useState(null);

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
        key: o.orderId ?? String(idx),
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
          key: o.orderId ?? String(idx),
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

  const nextOrderIdNumber = useMemo(() => {
    let max = 1000;
    for (const row of data) {
      const match = String(row.orderId || '').match(/^ORD-(\d+)$/i);
      if (match) {
        const n = Number(match[1]);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    }
    return max + 1;
  }, [data]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingOrderId(null);
    form.resetFields();
    form.setFieldsValue({
      orderDate: dayjs(),
      deliveryDate: dayjs().add(7, 'day'),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingOrderId(record.orderId);

    form.setFieldsValue({
      description: record.description,
      customerName: record.customerName,
      orderDate: dayjs(record.orderDate),
      deliveryDate: dayjs(record.deliveryDate),
    });

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleAdd = async (values) => {
    const payload = {
      description: values.description,
      customerName: values.customerName,
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
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
      description: values.description,
      customerName: values.customerName,
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
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
          created?.orderId ? `Created ${created.orderId}` : 'Order created',
        );

        setIsModalOpen(false);
        setPagination((p) => ({ ...p, current: 1 }));
        await refreshOrders();
        return;
      }

      if (modalMode === 'edit') {
        if (!editingOrderId) throw new Error('Missing orderId for update.');

        const updated = await handleUpdate(editingOrderId, values);
        message.success(
          updated?.orderId ? `Updated ${updated.orderId}` : 'Order updated',
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
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: (a, b) => compareText(a, b, 'orderId'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => compareText(a, b, 'description'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: (a, b) => compareText(a, b, 'customerName'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: (a, b) => compareText(a, b, 'orderDate'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      sorter: (a, b) => compareText(a, b, 'deliveryDate'),
      sortDirections: ['ascend', 'descend'],
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
            title="Delete this order?"
            description={`Are you sure you want to delete ${record.orderId}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                setLoading(true);
                await handleDelete(record.orderId);
                message.success(`Deleted ${record.orderId}`);
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
      const orderId = String(row.orderId || '').toLowerCase();
      const desc = String(row.description || '').toLowerCase();
      const customer = String(row.customerName || '').toLowerCase();
      return orderId.includes(q) || desc.includes(q) || customer.includes(q);
    });
  }, [data, searchText]);

  const onSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  return (
    <div style={{ width: '100%' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '20px auto', padding: '0 16px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Order</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by Order ID, Description, or Customer Name"
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

        <Modal
          title={modalMode === 'add' ? 'Add Order' : 'Edit Order'}
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmitModal}
          okText={modalMode === 'add' ? 'Add' : 'Save'}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter description.' },
                {
                  min: 3,
                  message: 'Description must be at least 3 characters.',
                },
              ]}
            >
              <Input placeholder="e.g., Industrial Pump - Model IP-200" />
            </Form.Item>

            <Form.Item
              label="Customer Name"
              name="customerName"
              rules={[
                { required: true, message: 'Please enter customer name.' },
                {
                  min: 2,
                  message: 'Customer name must be at least 2 characters.',
                },
              ]}
            >
              <Input placeholder="e.g., Mehta Industries" />
            </Form.Item>

            <Form.Item
              label="Order Date"
              name="orderDate"
              rules={[{ required: true, message: 'Please select order date.' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Delivery Date"
              name="deliveryDate"
              dependencies={['orderDate']}
              rules={[
                { required: true, message: 'Please select delivery date.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const orderDate = getFieldValue('orderDate');
                    if (!orderDate || !value) return Promise.resolve();
                    if (value.isBefore(orderDate, 'day')) {
                      return Promise.reject(
                        new Error('Delivery date cannot be before order date.'),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <div style={{ fontSize: 12, color: '#667085' }}>
              {modalMode === 'add'
                ? `Order ID will be auto-generated (e.g., ORD-${nextOrderIdNumber})`
                : `Editing order: ${editingOrderId}`}
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
