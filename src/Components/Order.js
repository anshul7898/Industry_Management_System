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
  Checkbox,
  Descriptions,
  Card,
  Divider,
  Empty,
  Row,
  Col,
  Statistic,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import { getStateOptions } from '../data/states';
import { getCityOptions } from '../data/cities';

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
      label: 'Single Colour',
      value: 'Single Colour',
    },
    {
      label: 'Double Colour',
      value: 'Double Colour',
    },
  ],
  printingTypes: [
    { label: 'Flex', value: 'Flex' },
    { label: 'Machine', value: 'Machine' },
  ],
  sheetColors: [
    { label: 'White', value: 'White' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Yellow', value: 'Yellow' },
    { label: 'Orange', value: 'Orange' },
    { label: 'Black', value: 'Black' },
  ],
  borderColors: [
    { label: 'Red', value: 'Red' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Cream', value: 'Cream' },
    { label: 'White', value: 'White' },
    { label: 'Black', value: 'Black' },
    { label: 'Orange', value: 'Orange' },
    { label: 'P-Blue', value: 'P-Blue' },
    { label: 'R-Green', value: 'R-Green' },
    { label: 'Pink', value: 'Pink' },
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
    { label: 'Black', value: 'Black' },
    { label: 'Red', value: 'Red' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Pink', value: 'Pink' },
  ],
  sheetGSMs: [
    { label: '55', value: 55 },
    { label: '60', value: 60 },
    { label: '65', value: 65 },
    { label: '70', value: 70 },
    { label: '80', value: 80 },
    { label: '90', value: 90 },
    { label: '100', value: 100 },
    { label: '110', value: 110 },
    { label: '120', value: 120 },
  ],
  borderGSMs: [
    { label: '55', value: 55 },
    { label: '60', value: 60 },
    { label: '65', value: 65 },
    { label: '70', value: 70 },
    { label: '80', value: 80 },
    { label: '90', value: 90 },
    { label: '100', value: 100 },
    { label: '110', value: 110 },
    { label: '120', value: 120 },
  ],
  handleGSMs: [
    { label: '100', value: 100 },
    { label: '120', value: 120 },
    { label: '150', value: 150 },
    { label: '180', value: 180 },
    { label: '200', value: 200 },
  ],
  orderTypes: [
    { label: 'New Order', value: 'new' },
    { label: 'Repeat Order', value: 'repeat' },
    { label: 'Old Order', value: 'old' },
  ],
};

export default function Order() {
  const [searchText, setSearchText] = useState('');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [orderTypeModalOpen, setOrderTypeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const [form] = Form.useForm();
  const [orderTypeForm] = Form.useForm();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const stateOptions = useMemo(() => getStateOptions(), []);

  const cityOptions = useMemo(
    () => getCityOptions(selectedState),
    [selectedState],
  );

  const handleStateChange = (value) => {
    setSelectedState(value);
    form.setFieldValue('City', null);
  };

  const handleCityChange = (value) => {
    form.setFieldValue('City', value);
  };

  // Input handlers to allow only specific character types
  const handleAlphabetsOnlyInput = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    e.target.value = filteredValue;
  };

  const handleNumbersOnlyInput = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    e.target.value = filteredValue;
  };

  const handlePincodeInput = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    e.target.value = filteredValue;
  };

  const handleMobileInput = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    e.target.value = filteredValue;
  };

  // Handle decimal numbers (for Rate, Product Amount, Total Amount)
  const handleDecimalInput = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    const filteredValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = filteredValue.split('.');
    if (parts.length > 2) {
      e.target.value = parts[0] + '.' + parts.slice(1).join('');
    } else {
      e.target.value = filteredValue;
    }
  };

  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(
      new Error('Please enter a valid email address (e.g., user@example.com)'),
    );
  };

  const validateMobile = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (/^[0-9]{10}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Mobile number should be 10 digits'));
  };

  async function fetchOrders() {
    const res = await fetch('/api/orders');
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch orders (${res.status}): ${text}`);
    }
    const orders = await res.json();
    return Array.isArray(orders) ? orders : [];
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents/lightweight');
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch agents (${res.status}): ${text}`);
    }
    return res.json();
  }

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const [orders, agentsData] = await Promise.all([
        fetchOrders(),
        fetchAgents(),
      ]);

      setAgents(agentsData);

      const rows = orders.map((o, idx) => {
        const agent = agentsData.find((a) => a.agentId === o.AgentId);
        return {
          key: o.OrderId ?? String(idx),
          ...o,
          agentName: agent ? agent.name : '',
        };
      });

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
        const [orders, agentsData] = await Promise.all([
          fetchOrders(),
          fetchAgents(),
        ]);

        if (cancelled) return;

        setAgents(agentsData);

        const rows = orders.map((o, idx) => {
          const agent = agentsData.find((a) => a.agentId === o.AgentId);
          return {
            key: o.OrderId ?? String(idx),
            ...o,
            agentName: agent ? agent.name : '',
          };
        });

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

  const handleOrderTypeSelect = async (values) => {
    try {
      const orderType = values.orderType;
      setSelectedOrderType(orderType);

      if (orderType === 'new') {
        setOrderTypeModalOpen(false);
        openAddOrderModal();
      } else if (orderType === 'repeat') {
        setOrderTypeModalOpen(false);
        message.info('Repeat Order feature coming soon');
      } else if (orderType === 'old') {
        setOrderTypeModalOpen(false);
        message.info('Old Order feature coming soon');
      }
    } catch (err) {
      message.error('Please select an order type');
    }
  };

  const openOrderTypeModal = () => {
    orderTypeForm.resetFields();
    setSelectedOrderType(null);
    setOrderTypeModalOpen(true);
  };

  const closeOrderTypeModal = () => {
    setOrderTypeModalOpen(false);
    orderTypeForm.resetFields();
    setSelectedOrderType(null);
  };

  const openAddOrderModal = async () => {
    setModalMode('add');
    setEditingOrderId(null);
    setSelectedState(null);
    form.resetFields();
    // Initialize with empty products array
    form.setFieldValue('Products', [
      {
        ProductType: undefined,
        ProductId: undefined,
        ProductSize: undefined,
        BagMaterial: undefined,
        Quantity: undefined,
        SheetGSM: undefined,
        SheetColor: undefined,
        BorderGSM: undefined,
        BorderColor: undefined,
        HandleType: undefined,
        HandleColor: undefined,
        HandleGSM: undefined,
        PrintingType: undefined,
        PrintColor: undefined,
        Color: undefined,
        Design: false,
        PlateBlockNumber: undefined,
        PlateAvailable: false,
        Rate: undefined,
        ProductAmount: undefined,
      },
    ]);
    form.setFieldValue('TotalAmount', 0);

    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);
    } catch (err) {
      message.error(err.message);
    }

    setIsModalOpen(true);
  };

  const openEditModal = async (record) => {
    setModalMode('edit');
    setEditingOrderId(record.OrderId);
    setSelectedState(record.State || null);

    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);
    } catch (err) {
      message.error(err.message);
    }

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
      Products: record.Products || [
        {
          ProductType: undefined,
          ProductId: undefined,
          ProductSize: undefined,
          BagMaterial: undefined,
          Quantity: undefined,
          SheetGSM: undefined,
          SheetColor: undefined,
          BorderGSM: undefined,
          BorderColor: undefined,
          HandleType: undefined,
          HandleColor: undefined,
          HandleGSM: undefined,
          PrintingType: undefined,
          PrintColor: undefined,
          Color: undefined,
          Design: false,
          PlateBlockNumber: undefined,
          PlateAvailable: false,
          Rate: undefined,
          ProductAmount: undefined,
        },
      ],
      TotalAmount: record.TotalAmount || 0,
    });

    setIsModalOpen(true);
  };

  const openViewModal = (record) => {
    setViewingOrder(record);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedState(null);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingOrder(null);
  };

  const addPartyFromOrder = async (values) => {
    try {
      const partyPayload = {
        partyName: values.Party_Name,
        aliasOrCompanyName: values.AliasOrCompanyName,
        address: values.Address,
        city: values.City,
        state: values.State,
        pincode: String(values.Pincode),
        agentId: values.AgentId ? parseInt(values.AgentId) : null,
        contact_Person1: values.Contact_Person1,
        contact_Person2: values.Contact_Person2 || null,
        email: values.Email,
        mobile1: String(values.Mobile1),
        mobile2: values.Mobile2 ? String(values.Mobile2) : null,
        orderId: null,
      };

      console.log('Party Payload being sent:', partyPayload);

      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partyPayload),
      });

      const responseText = await res.text();
      console.log('Party API Response Status:', res.status);
      console.log('Party API Response:', responseText);

      if (!res.ok) {
        console.error('Party creation failed:', responseText);
        message.warning(
          'Order created successfully, but party could not be added. Please add party manually if needed.',
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error adding party from order:', err);
      message.warning(
        'Order created, but party could not be added automatically. Please add the party manually if needed.',
      );
      return false;
    }
  };

  const handleAdd = async (values) => {
    // Validate that at least one product is present
    if (!values.Products || values.Products.length === 0) {
      throw new Error('Please add at least one product');
    }

    // Ensure TotalAmount is a valid number
    const totalAmount = values.TotalAmount || 0;
    if (isNaN(totalAmount) || totalAmount < 0) {
      throw new Error('Total Amount must be a valid non-negative number');
    }

    const payload = {
      AgentId: values.AgentId ? parseInt(values.AgentId) : null,
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
      TotalAmount: parseFloat(totalAmount),
      Products: (values.Products || []).map((product) => ({
        ProductType: product.ProductType,
        ProductId: product.ProductId,
        ProductSize: product.ProductSize,
        BagMaterial: product.BagMaterial,
        Quantity: product.Quantity,
        SheetGSM: Number(product.SheetGSM),
        SheetColor: product.SheetColor,
        BorderGSM: Number(product.BorderGSM),
        BorderColor: product.BorderColor,
        HandleType: product.HandleType,
        HandleColor: product.HandleColor,
        HandleGSM: Number(product.HandleGSM),
        PrintingType: product.PrintingType,
        PrintColor: product.PrintColor,
        Color: product.Color,
        Design: product.Design || false,
        PlateBlockNumber: product.PlateBlockNumber || null,
        PlateAvailable: product.PlateAvailable || false,
        Rate: product.Rate,
        ProductAmount: product.ProductAmount || 0,
      })),
    };

    console.log('Order Payload being sent:', JSON.stringify(payload, null, 2));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('Order creation error:', text);
      throw new Error(`Failed to create order (${res.status}): ${text}`);
    }

    const orderResult = await res.json().catch(() => null);

    // Add party details after order is created
    await addPartyFromOrder(values);

    return orderResult;
  };

  const handleUpdate = async (orderId, values) => {
    // Validate that at least one product is present
    if (!values.Products || values.Products.length === 0) {
      throw new Error('Please add at least one product');
    }

    // Ensure TotalAmount is a valid number
    const totalAmount = values.TotalAmount || 0;
    if (isNaN(totalAmount) || totalAmount < 0) {
      throw new Error('Total Amount must be a valid non-negative number');
    }

    const payload = {
      AgentId: values.AgentId ? parseInt(values.AgentId) : null,
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
      TotalAmount: parseFloat(totalAmount),
      Products: (values.Products || []).map((product) => ({
        ProductType: product.ProductType,
        ProductId: product.ProductId,
        ProductSize: product.ProductSize,
        BagMaterial: product.BagMaterial,
        Quantity: product.Quantity,
        SheetGSM: Number(product.SheetGSM),
        SheetColor: product.SheetColor,
        BorderGSM: Number(product.BorderGSM),
        BorderColor: product.BorderColor,
        HandleType: product.HandleType,
        HandleColor: product.HandleColor,
        HandleGSM: Number(product.HandleGSM),
        PrintingType: product.PrintingType,
        PrintColor: product.PrintColor,
        Color: product.Color,
        Design: product.Design || false,
        PlateBlockNumber: product.PlateBlockNumber || null,
        PlateAvailable: product.PlateAvailable || false,
        Rate: product.Rate,
        ProductAmount: product.ProductAmount || 0,
      })),
    };

    console.log('Update Payload being sent:', JSON.stringify(payload, null, 2));

    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('Order update error:', text);
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

  // Calculate ProductAmount when Rate or Quantity changes
  const handleRateOrQuantityChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const parts = fieldName.split('_');
    const productIndex = parseInt(parts[0]);

    if (productIndex >= 0 && productIndex < products.length) {
      const product = products[productIndex];
      const rate = parseFloat(product.Rate) || 0;
      const quantity = parseFloat(product.Quantity) || 0;
      const productAmount = parseFloat((rate * quantity).toFixed(2));

      // Update ProductAmount
      const updatedProducts = [...products];
      updatedProducts[productIndex].ProductAmount = productAmount;
      form.setFieldValue('Products', updatedProducts);

      // Recalculate TotalAmount
      const totalAmount = updatedProducts.reduce((sum, p) => {
        const pAmount = parseFloat(p.ProductAmount) || 0;
        return sum + pAmount;
      }, 0);
      form.setFieldValue('TotalAmount', parseFloat(totalAmount.toFixed(2)));
    }
  };

  // Handle manual ProductAmount change
  const handleProductAmountChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const totalAmount = products.reduce((sum, p) => {
      const productAmount = parseFloat(p.ProductAmount) || 0;
      return sum + productAmount;
    }, 0);
    form.setFieldValue('TotalAmount', parseFloat(totalAmount.toFixed(2)));
  };

  const handleSubmitModal = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!values.Products || values.Products.length === 0) {
        message.error('Please add at least one product');
        setLoading(false);
        return;
      }

      if (modalMode === 'add') {
        const created = await handleAdd(values);
        message.success(
          created?.OrderId
            ? `Created order ${created.OrderId} with ${values.Products.length} product(s)`
            : 'Order created successfully',
        );

        setIsModalOpen(false);
        setSelectedState(null);
        setPagination((p) => ({ ...p, current: 1 }));
        await refreshOrders();
        return;
      }

      if (modalMode === 'edit') {
        if (!editingOrderId) throw new Error('Missing OrderId for update.');

        const updated = await handleUpdate(editingOrderId, values);
        message.success(
          updated?.OrderId
            ? `Updated order ${updated.OrderId} with ${values.Products.length} product(s)`
            : 'Order updated successfully',
        );

        setIsModalOpen(false);
        setSelectedState(null);
        await refreshOrders();
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agentOptions = agents.map((agent) => ({
    label: agent.name,
    value: agent.agentId,
  }));

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
      title: 'Agent',
      dataIndex: 'agentName',
      key: 'agentName',
      width: 150,
      sorter: (a, b) => compareText(a, b, 'agentName'),
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
      title: 'No of Products',
      dataIndex: 'Products',
      key: 'ProductCount',
      width: 130,
      render: (products) => (products ? products.length : 0),
    },
    {
      title: 'Total Amount',
      dataIndex: 'TotalAmount',
      key: 'TotalAmount',
      width: 130,
      render: (amount) => `₹${Number(amount || 0).toFixed(2)}`,
      sorter: (a, b) => compareNumber(a, b, 'TotalAmount'),
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
      const agentName = String(row.agentName || '').toLowerCase();
      return (
        orderId.includes(q) ||
        party.includes(q) ||
        contact.includes(q) ||
        email.includes(q) ||
        agentName.includes(q)
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
            placeholder="Search by Order ID, Party Name, Contact Person, Email, or Agent"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={(value) => onSearchChange(value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={refreshOrders} disabled={loading}>
              Refresh
            </Button>
            <Button type="primary" onClick={openOrderTypeModal}>
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
          scroll={{ x: 1600 }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
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
          .table-row-light {
            background-color: #ffffff !important;
          }
          .table-row-dark {
            background-color: #f5f5f5 !important;
          }
          .table-row-light:hover {
            background-color: #fafafa !important;
          }
          .table-row-dark:hover {
            background-color: #efefef !important;
          }
        `}</style>

        {/* Order Type Selection Modal */}
        <Modal
          title="Create New Order"
          open={orderTypeModalOpen}
          onCancel={closeOrderTypeModal}
          width={500}
          footer={null}
        >
          <Form
            form={orderTypeForm}
            layout="vertical"
            onFinish={handleOrderTypeSelect}
          >
            <Form.Item
              label="Select Order Type"
              name="orderType"
              rules={[
                { required: true, message: 'Please select an order type' },
              ]}
            >
              <Select
                placeholder="Choose order type"
                options={DROPDOWN_OPTIONS.orderTypes}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Continue
              </Button>
            </Form.Item>
          </Form>
        </Modal>

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
                  <Descriptions.Item label="Agent">
                    {viewingOrder.agentName || '-'}
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
                  <Descriptions.Item label="State">
                    {viewingOrder.State}
                  </Descriptions.Item>
                  <Descriptions.Item label="City">
                    {viewingOrder.City}
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

              {/* Products Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Products ({viewingOrder.Products?.length || 0})
                </h3>
                {viewingOrder.Products && viewingOrder.Products.length > 0 ? (
                  <div>
                    {viewingOrder.Products.map((product, idx) => (
                      <Card
                        key={idx}
                        style={{ marginBottom: 12 }}
                        title={`Product ${idx + 1}`}
                        size="small"
                      >
                        <Descriptions bordered size="small" column={3}>
                          <Descriptions.Item label="Product Type">
                            {product.ProductType}
                          </Descriptions.Item>
                          <Descriptions.Item label="Product ID">
                            {product.ProductId}
                          </Descriptions.Item>
                          <Descriptions.Item label="Product Size">
                            {product.ProductSize}
                          </Descriptions.Item>
                          <Descriptions.Item label="Bag Material">
                            {product.BagMaterial}
                          </Descriptions.Item>
                          <Descriptions.Item label="Quantity">
                            {product.Quantity}
                          </Descriptions.Item>
                          <Descriptions.Item label="Rate">
                            ₹{Number(product.Rate || 0).toFixed(2)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Sheet GSM">
                            {product.SheetGSM}
                          </Descriptions.Item>
                          <Descriptions.Item label="Sheet Color">
                            {product.SheetColor}
                          </Descriptions.Item>
                          <Descriptions.Item label="Border GSM">
                            {product.BorderGSM}
                          </Descriptions.Item>
                          <Descriptions.Item label="Border Color">
                            {product.BorderColor}
                          </Descriptions.Item>
                          <Descriptions.Item label="Handle Type">
                            {product.HandleType}
                          </Descriptions.Item>
                          <Descriptions.Item label="Handle Color">
                            {product.HandleColor}
                          </Descriptions.Item>
                          <Descriptions.Item label="Handle GSM">
                            {product.HandleGSM}
                          </Descriptions.Item>
                          <Descriptions.Item label="Printing Type">
                            {product.PrintingType}
                          </Descriptions.Item>
                          <Descriptions.Item label="Print Color">
                            {product.PrintColor}
                          </Descriptions.Item>
                          <Descriptions.Item label="Color">
                            {product.Color}
                          </Descriptions.Item>
                          <Descriptions.Item label="Design">
                            {product.Design ? 'Yes' : 'No'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Plate Available">
                            {product.PlateAvailable ? 'Yes' : 'No'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Plate Block Number">
                            {product.PlateBlockNumber || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Product Amount" span={3}>
                            ₹{Number(product.ProductAmount || 0).toFixed(2)}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    ))}
                    <Divider />
                    <Row justify="end">
                      <Col>
                        <Statistic
                          title="Total Amount"
                          value={viewingOrder.TotalAmount || 0}
                          prefix="₹"
                          precision={2}
                        />
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <Empty description="No products" />
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Add/Edit Order Modal */}
        <Modal
          title={
            modalMode === 'add'
              ? 'Add New Order (Multiple Products)'
              : `Edit Order - ${editingOrderId || ''}`
          }
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmitModal}
          okText={modalMode === 'add' ? 'Create Order' : 'Save Changes'}
          confirmLoading={loading}
          width={1000}
          bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <Form form={form} layout="vertical">
            {/* Info Message */}
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: '#e6f7ff',
                borderRadius: 4,
                border: '1px solid #91d5ff',
              }}
            >
              <p style={{ margin: 0, color: '#0050b3', fontSize: '14px' }}>
                <strong>ℹ️ Note:</strong> Each order can contain multiple
                products. ProductAmount = Rate × Quantity (auto-calculated, but
                editable). TotalAmount = Sum of all ProductAmounts
                (auto-calculated, but editable).
              </p>
            </div>

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
                label="Agent"
                name="AgentId"
                rules={[{ required: true, message: 'Please select an Agent.' }]}
              >
                <Select
                  placeholder="Select Agent"
                  options={agentOptions}
                  optionLabelProp="label"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                label="Party Name"
                name="Party_Name"
                rules={[
                  { required: true, message: 'Please enter Party Name.' },
                ]}
              >
                <Input
                  placeholder="e.g., ABC Packaging Solutions"
                  onInput={handleAlphabetsOnlyInput}
                />
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
                <Input
                  placeholder="e.g., ABC Pack"
                  onInput={handleAlphabetsOnlyInput}
                />
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
                  label="State"
                  name="State"
                  rules={[{ required: true, message: 'Please enter State.' }]}
                >
                  <Select
                    placeholder="Select State"
                    options={stateOptions}
                    showSearch
                    onChange={handleStateChange}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="City"
                  name="City"
                  rules={[{ required: true, message: 'Please enter City.' }]}
                >
                  <Select
                    placeholder="Select City"
                    options={cityOptions}
                    showSearch
                    onChange={handleCityChange}
                    disabled={!selectedState || cityOptions.length === 0}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
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
                  <Input
                    placeholder="e.g., 400001"
                    maxLength={6}
                    onInput={handlePincodeInput}
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
                <Input
                  placeholder="e.g., Rajesh Kumar"
                  onInput={handleAlphabetsOnlyInput}
                />
              </Form.Item>

              <Form.Item
                label="Contact Person 2 (Optional)"
                name="Contact_Person2"
              >
                <Input
                  placeholder="e.g., Priya Sharma"
                  onInput={handleAlphabetsOnlyInput}
                />
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
                  <Input
                    placeholder="e.g., 9876543210"
                    maxLength={10}
                    onInput={handleMobileInput}
                  />
                </Form.Item>

                <Form.Item
                  label="Mobile 2 (Optional)"
                  name="Mobile2"
                  rules={[
                    {
                      validator: validateMobile,
                    },
                  ]}
                >
                  <Input
                    placeholder="e.g., 9876543211"
                    maxLength={10}
                    onInput={handleMobileInput}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Email"
                name="Email"
                rules={[
                  { required: true, message: 'Please enter Email.' },
                  { validator: validateEmail },
                ]}
              >
                <Input placeholder="e.g., rajesh@abcpack.com" />
              </Form.Item>
            </div>

            {/* Products Section */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Products</h3>

              <Form.List name="Products">
                {(fields, { add, remove }) => (
                  <>
                    {fields.length === 0 ? (
                      <Empty
                        description="No products added"
                        style={{ marginBottom: 12 }}
                      />
                    ) : (
                      fields.map((field, idx) => (
                        <Card
                          key={field.key}
                          style={{ marginBottom: 12 }}
                          title={`Product ${idx + 1}`}
                          extra={
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                            >
                              Remove
                            </Button>
                          }
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1fr',
                              gap: 12,
                            }}
                          >
                            <Form.Item
                              label="Product Type"
                              name={[field.name, 'ProductType']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Product Type.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Product Type"
                                options={DROPDOWN_OPTIONS.productTypes}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Product ID"
                              name={[field.name, 'ProductId']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Product ID.',
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., 1001"
                                onInput={handleNumbersOnlyInput}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Product Size"
                              name={[field.name, 'ProductSize']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Product Size.',
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., 14"
                                onInput={handleNumbersOnlyInput}
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
                              name={[field.name, 'BagMaterial']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Bag Material.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Bag Material"
                                options={DROPDOWN_OPTIONS.bagMaterials}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Quantity"
                              name={[field.name, 'Quantity']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Quantity.',
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., 5000"
                                onInput={handleNumbersOnlyInput}
                                onChange={() =>
                                  handleRateOrQuantityChange(`${idx}_Quantity`)
                                }
                              />
                            </Form.Item>
                          </div>

                          {/* Sheet Information */}
                          <Divider style={{ margin: '12px 0' }}>
                            Sheet Information
                          </Divider>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 12,
                            }}
                          >
                            <Form.Item
                              label="Sheet GSM"
                              name={[field.name, 'SheetGSM']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Sheet GSM.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Sheet GSM"
                                options={DROPDOWN_OPTIONS.sheetGSMs}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Sheet Color"
                              name={[field.name, 'SheetColor']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Sheet Color.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Sheet Color"
                                options={DROPDOWN_OPTIONS.sheetColors}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Border GSM"
                              name={[field.name, 'BorderGSM']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Border GSM.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Border GSM"
                                options={DROPDOWN_OPTIONS.borderGSMs}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Border Color"
                              name={[field.name, 'BorderColor']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Border Color.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Border Color"
                                options={DROPDOWN_OPTIONS.borderColors}
                              />
                            </Form.Item>
                          </div>

                          {/* Handle Information */}
                          <Divider style={{ margin: '12px 0' }}>
                            Handle Information
                          </Divider>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1fr',
                              gap: 12,
                            }}
                          >
                            <Form.Item
                              label="Handle Type"
                              name={[field.name, 'HandleType']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Handle Type.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Handle Type"
                                options={DROPDOWN_OPTIONS.handleTypes}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Handle Color"
                              name={[field.name, 'HandleColor']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Handle Color.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Handle Color"
                                options={DROPDOWN_OPTIONS.handleColors}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Handle GSM"
                              name={[field.name, 'HandleGSM']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Handle GSM.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Handle GSM"
                                options={DROPDOWN_OPTIONS.handleGSMs}
                              />
                            </Form.Item>
                          </div>

                          {/* Printing Information */}
                          <Divider style={{ margin: '12px 0' }}>
                            Printing Information
                          </Divider>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1fr',
                              gap: 12,
                            }}
                          >
                            <Form.Item
                              label="Printing Type"
                              name={[field.name, 'PrintingType']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Printing Type.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Printing Type"
                                options={DROPDOWN_OPTIONS.printingTypes}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Print Color"
                              name={[field.name, 'PrintColor']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Print Color.',
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Print Color"
                                options={DROPDOWN_OPTIONS.printColors}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Color"
                              name={[field.name, 'Color']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select Color.',
                                },
                              ]}
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
                            <Form.Item
                              label="Design"
                              name={[field.name, 'Design']}
                              valuePropName="checked"
                            >
                              <Checkbox>Has Custom Design</Checkbox>
                            </Form.Item>

                            <Form.Item
                              label="Plate Available"
                              name={[field.name, 'PlateAvailable']}
                              valuePropName="checked"
                            >
                              <Checkbox>Plate Available</Checkbox>
                            </Form.Item>
                          </div>

                          <Form.Item
                            label="Plate Block Number"
                            name={[field.name, 'PlateBlockNumber']}
                          >
                            <Input
                              placeholder="e.g., 2001"
                              onInput={handleNumbersOnlyInput}
                            />
                          </Form.Item>

                          {/* Pricing Information */}
                          <Divider style={{ margin: '12px 0' }}>
                            Pricing
                          </Divider>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 12,
                            }}
                          >
                            <Form.Item
                              label="Rate (Per Unit)"
                              name={[field.name, 'Rate']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Rate.',
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., 45.50"
                                onInput={handleDecimalInput}
                                onChange={() =>
                                  handleRateOrQuantityChange(`${idx}_Rate`)
                                }
                                prefix="₹"
                              />
                            </Form.Item>

                            <Form.Item
                              label="Product Amount (Editable)"
                              name={[field.name, 'ProductAmount']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Product Amount is required.',
                                },
                              ]}
                            >
                              <Input
                                placeholder="Rate × Quantity"
                                onInput={handleDecimalInput}
                                onChange={() =>
                                  handleProductAmountChange(
                                    `${idx}_ProductAmount`,
                                  )
                                }
                                prefix="₹"
                              />
                            </Form.Item>
                          </div>
                        </Card>
                      ))
                    )}

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{ marginTop: 12 }}
                    >
                      Add Product
                    </Button>
                  </>
                )}
              </Form.List>
            </div>

            {/* Total Amount Section */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px',
                backgroundColor: '#f0f5ff',
                borderRadius: 4,
                border: '2px solid #b7eb8f',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Order Total</h3>
              <Form.Item
                label="Total Amount (Auto-calculated, but Editable)"
                name="TotalAmount"
                rules={[
                  { required: true, message: 'Total Amount is required.' },
                ]}
              >
                <Input
                  placeholder="Sum of all Product Amounts"
                  onInput={handleDecimalInput}
                  prefix="₹"
                />
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
