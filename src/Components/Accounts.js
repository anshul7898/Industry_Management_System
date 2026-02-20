import React, { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Input,
  Space,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Popconfirm,
  message,
} from 'antd';
import Navbar from './Navbar';
import dayjs from 'dayjs';

export default function Accounts() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal/form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [editingTxnId, setEditingTxnId] = useState(null);
  const [form] = Form.useForm();

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to fetch accounts (${res.status}): ${text}`);
      }
      const items = await res.json();
      const rows = (Array.isArray(items) ? items : []).map((x, idx) => ({
        key: x.txnId ?? String(idx),
        ...x,
      }));
      setData(rows);
    } catch (err) {
      message.error(err?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextTxnIdNumber = useMemo(() => {
    let max = 3000;
    for (const row of data) {
      const match = String(row.txnId || '').match(/^TXN-(\d+)$/i);
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
        row.txnId,
        row.type,
        row.description,
        row.partyName,
        row.date,
        String(row.amount),
      ]
        .map((x) => String(x || '').toLowerCase())
        .join(' ');
      return haystack.includes(q);
    });
  }, [data, searchText]);

  const openAddModal = (type) => {
    setModalMode('add');
    setEditingTxnId(null);

    form.resetFields();
    form.setFieldsValue({
      type,
      date: dayjs(),
      amount: 0,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingTxnId(record.txnId);

    form.resetFields();
    form.setFieldsValue({
      type: record.type,
      description: record.description,
      partyName: record.partyName,
      date: dayjs(record.date),
      amount: Number(record.amount ?? 0),
    });

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        type: values.type,
        description: values.description,
        partyName: values.partyName,
        date: values.date.format('YYYY-MM-DD'),
        amount: Number(values.amount ?? 0),
      };

      if (modalMode === 'add') {
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            // txnId omitted; backend generates it
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(
            `Failed to create transaction (${res.status}): ${text}`,
          );
        }

        const created = await res.json().catch(() => null);
        message.success(
          created?.txnId ? `Created ${created.txnId}` : 'Created',
        );

        setIsModalOpen(false);
        setPagination((p) => ({ ...p, current: 1 }));
        await refresh();
        return;
      }

      if (modalMode === 'edit') {
        if (!editingTxnId) throw new Error('Missing txnId for update.');

        const res = await fetch(
          `/api/accounts/${encodeURIComponent(editingTxnId)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(
            `Failed to update transaction (${res.status}): ${text}`,
          );
        }

        const updated = await res.json().catch(() => null);
        message.success(
          updated?.txnId ? `Updated ${updated.txnId}` : 'Updated',
        );

        setIsModalOpen(false);
        await refresh();
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (txnId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/accounts/${encodeURIComponent(txnId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `Failed to delete transaction (${res.status}): ${text}`,
        );
      }

      message.success(`Deleted ${txnId}`);
      await refresh();
    } catch (err) {
      message.error(err?.message || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Txn ID',
      dataIndex: 'txnId',
      key: 'txnId',
      sorter: (a, b) => String(a.txnId).localeCompare(String(b.txnId)),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Incoming', value: 'Incoming' },
        { text: 'Outgoing', value: 'Outgoing' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (value) => (
        <Tag color={value === 'Incoming' ? 'green' : 'red'}>{value}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) =>
        String(a.description).localeCompare(String(b.description)),
    },
    {
      title: 'Party Name',
      dataIndex: 'partyName',
      key: 'partyName',
      sorter: (a, b) => String(a.partyName).localeCompare(String(b.partyName)),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => String(a.date).localeCompare(String(b.date)),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => (a.amount ?? 0) - (b.amount ?? 0),
      render: (amt, record) => (
        <span
          style={{
            fontWeight: 600,
            color: record.type === 'Incoming' ? '#15803d' : '#b91c1c',
          }}
        >
          {record.type === 'Incoming' ? '+' : '-'}
          {Number(amt ?? 0).toLocaleString('en-IN')}
        </span>
      ),
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
            title="Delete this transaction?"
            description={`Are you sure you want to delete ${record.txnId}?`}
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.txnId)}
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
        <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Accounts</h1>

        <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
          <Input.Search
            allowClear
            placeholder="Search by Txn ID, type, description, party name, date, amount..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={(value) => onSearchChange(value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={refresh} disabled={loading}>
              Refresh
            </Button>
            <Button type="primary" onClick={() => openAddModal('Incoming')}>
              Add Incoming
            </Button>
            <Button danger onClick={() => openAddModal('Outgoing')}>
              Add Outgoing
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
            pageSizeOptions: [5, 10, 20, 50, 100],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
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
              ? 'Add Transaction'
              : `Edit Transaction (${editingTxnId})`
          }
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmit}
          okText={modalMode === 'add' ? 'Add' : 'Save'}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: 'Please select type.' }]}
            >
              <Select
                options={[
                  { value: 'Incoming', label: 'Incoming' },
                  { value: 'Outgoing', label: 'Outgoing' },
                ]}
              />
            </Form.Item>

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
              <Input placeholder="e.g., Customer payment received" />
            </Form.Item>

            <Form.Item
              label="Party Name"
              name="partyName"
              rules={[
                { required: true, message: 'Please enter party name.' },
                {
                  min: 2,
                  message: 'Party name must be at least 2 characters.',
                },
              ]}
            >
              <Input placeholder="e.g., Mehta Industries" />
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select date.' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Amount (₹)"
              name="amount"
              rules={[{ required: true, message: 'Please enter amount.' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <div style={{ fontSize: 12, color: '#667085' }}>
              {modalMode === 'add'
                ? `Transaction ID will be auto-generated (e.g., TXN-${nextTxnIdNumber})`
                : 'Transaction ID cannot be changed.'}
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
