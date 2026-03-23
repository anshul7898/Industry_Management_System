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
  List,
  Avatar,
  Tag,
  Spin,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
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
    { label: 'Single Colour', value: 'Single Colour' },
    { label: 'Double Colour', value: 'Double Colour' },
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

// Empty product template
const emptyProduct = {
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
};

export default function Order() {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
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

  // ── Old Order State ────────────────────────────────────────────
  const [oldOrderAgentModalOpen, setOldOrderAgentModalOpen] = useState(false);
  const [oldOrderListModalOpen, setOldOrderListModalOpen] = useState(false);
  const [selectedOldAgent, setSelectedOldAgent] = useState(null);
  const [oldOrdersForAgent, setOldOrdersForAgent] = useState([]);
  const [oldOrdersLoading, setOldOrdersLoading] = useState(false);
  const [oldOrderSearch, setOldOrderSearch] = useState('');
  const [oldOrderAgentForm] = Form.useForm();
  // ──────────────────────────────────────────────────────────────

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

  const handleDecimalInput = (e) => {
    const filtered = e.target.value.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    e.target.value =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filtered;
  };

  const validateEmail = (_, value) => {
    if (!value) return Promise.resolve();
    if (emailRegex.test(value)) return Promise.resolve();
    return Promise.reject(
      new Error('Please enter a valid email address (e.g., user@example.com)'),
    );
  };

  const validateMobile = (_, value) => {
    if (!value) return Promise.resolve();
    if (/^[0-9]{10}$/.test(value)) return Promise.resolve();
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

  // ── Fetch party data by party name from the Party table ────────
  async function fetchPartyByName(partyName) {
    try {
      const res = await fetch(
        `/api/party/by-name/${encodeURIComponent(partyName)}`,
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
  // ──────────────────────────────────────────────────────────────

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

  // ── Old Order Handlers ─────────────────────────────────────────

  const openOldOrderAgentModal = async () => {
    oldOrderAgentForm.resetFields();
    setSelectedOldAgent(null);
    setOldOrdersForAgent([]);
    setOldOrderSearch('');
    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);
    } catch (err) {
      message.error(err.message);
    }
    setOldOrderAgentModalOpen(true);
  };

  const handleOldOrderAgentSelect = async (values) => {
    const agentId = values.agentId;
    const agent = agents.find((a) => a.agentId === agentId);
    setSelectedOldAgent(agent);
    setOldOrderAgentModalOpen(false);
    setOldOrderListModalOpen(true);
    setOldOrderSearch('');
    setOldOrdersLoading(true);
    try {
      const allOrders = await fetchOrders();
      setOldOrdersForAgent(allOrders.filter((o) => o.AgentId === agentId));
    } catch {
      message.error('Failed to load orders for this agent');
      setOldOrdersForAgent([]);
    } finally {
      setOldOrdersLoading(false);
    }
  };

  /**
   * When an old order is selected:
   * 1. Fetch the party record from the Party table using the order's Party_Name
   * 2. Open the NEW ORDER modal (modalMode = 'add') with:
   *    - Party & Contact info auto-filled from the party table record
   *    - Products list empty (fresh new order)
   *    - AgentId pre-set to the selected old agent
   */
  const handleOldOrderSelect = async (order) => {
    setOldOrderListModalOpen(false);

    // Show loading while fetching party data
    const loadingKey = 'party-lookup';
    message.loading({
      content: 'Loading party details...',
      key: loadingKey,
      duration: 0,
    });

    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData);

      // Try to fetch party details from the Party table
      const partyData = await fetchPartyByName(order.Party_Name);

      // Switch to NEW ORDER mode — products are blank, party info pre-filled
      setModalMode('add');
      setEditingOrderId(null);

      // Use party table data if found, otherwise fall back to order fields
      const state = partyData?.state || partyData?.State || order.State || null;
      setSelectedState(state);

      form.resetFields();

      form.setFieldsValue({
        // Pre-fill agent from the selected old order
        AgentId: order.AgentId,

        // Party Information — from party table (preferred) or order
        Party_Name:
          partyData?.partyName ||
          partyData?.PartyName ||
          order.Party_Name ||
          '',
        AliasOrCompanyName:
          partyData?.aliasOrCompanyName ||
          partyData?.AliasOrCompanyName ||
          order.AliasOrCompanyName ||
          '',
        Address:
          partyData?.address || partyData?.Address || order.Address || '',
        State: state,
        City: partyData?.city || partyData?.City || order.City || '',
        Pincode:
          partyData?.pincode || partyData?.Pincode || order.Pincode || '',

        // Contact Information — from party table (preferred) or order
        Contact_Person1:
          partyData?.contact_Person1 ||
          partyData?.Contact_Person1 ||
          order.Contact_Person1 ||
          '',
        Contact_Person2:
          partyData?.contact_Person2 ||
          partyData?.Contact_Person2 ||
          order.Contact_Person2 ||
          '',
        Mobile1:
          partyData?.mobile1 || partyData?.Mobile1 || order.Mobile1 || '',
        Mobile2:
          partyData?.mobile2 || partyData?.Mobile2 || order.Mobile2 || '',
        Email: partyData?.email || partyData?.Email || order.Email || '',

        // Products are blank — this is a new order
        Products: [{ ...emptyProduct }],
        TotalAmount: 0,
      });

      message.success({
        content: partyData
          ? `Party details loaded from database for "${order.Party_Name}"`
          : `Party details filled from order (no party record found for "${order.Party_Name}")`,
        key: loadingKey,
        duration: 3,
      });

      setIsModalOpen(true);
    } catch (err) {
      message.error({
        content: 'Failed to load party details',
        key: loadingKey,
      });
      console.error('handleOldOrderSelect error:', err);
    }
  };

  const closeOldOrderAgentModal = () => {
    setOldOrderAgentModalOpen(false);
    oldOrderAgentForm.resetFields();
    setSelectedOldAgent(null);
  };

  const closeOldOrderListModal = () => {
    setOldOrderListModalOpen(false);
    setOldOrdersForAgent([]);
    setSelectedOldAgent(null);
    setOldOrderSearch('');
  };

  const filteredOldOrders = useMemo(() => {
    if (!oldOrderSearch.trim()) return oldOrdersForAgent;
    const q = oldOrderSearch.trim().toLowerCase();
    return oldOrdersForAgent.filter((o) =>
      [o.OrderId, o.Party_Name, o.Contact_Person1].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [oldOrdersForAgent, oldOrderSearch]);

  // ──────────────────────────────────────────────────────────────

  const handleOrderTypeSelect = async (values) => {
    try {
      const orderType = values.orderType;
      setSelectedOrderType(orderType);
      setOrderTypeModalOpen(false);

      if (orderType === 'new') {
        openAddOrderModal();
      } else if (orderType === 'repeat') {
        message.info('Repeat Order feature coming soon');
      } else if (orderType === 'old') {
        openOldOrderAgentModal();
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
    form.setFieldValue('Products', [{ ...emptyProduct }]);
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
      Products: record.Products || [{ ...emptyProduct }],
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

  const buildProductsPayload = (products) =>
    (products || []).map((product) => ({
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
    }));

  const handleAdd = async (values) => {
    if (!values.Products || values.Products.length === 0)
      throw new Error('Please add at least one product');
    const totalAmount = values.TotalAmount || 0;
    if (isNaN(totalAmount) || totalAmount < 0)
      throw new Error('Total Amount must be a valid non-negative number');

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
      Products: buildProductsPayload(values.Products),
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
    await addPartyFromOrder(values);
    return orderResult;
  };

  const handleUpdate = async (orderId, values) => {
    if (!values.Products || values.Products.length === 0)
      throw new Error('Please add at least one product');
    const totalAmount = values.TotalAmount || 0;
    if (isNaN(totalAmount) || totalAmount < 0)
      throw new Error('Total Amount must be a valid non-negative number');

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
      Products: buildProductsPayload(values.Products),
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

  const handleRateOrQuantityChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const parts = fieldName.split('_');
    const productIndex = parseInt(parts[0]);
    if (productIndex >= 0 && productIndex < products.length) {
      const product = products[productIndex];
      const rate = parseFloat(product.Rate) || 0;
      const quantity = parseFloat(product.Quantity) || 0;
      const productAmount = parseFloat((rate * quantity).toFixed(2));
      const updatedProducts = [...products];
      updatedProducts[productIndex].ProductAmount = productAmount;
      form.setFieldValue('Products', updatedProducts);
      const totalAmount = updatedProducts.reduce(
        (sum, p) => sum + (parseFloat(p.ProductAmount) || 0),
        0,
      );
      form.setFieldValue('TotalAmount', parseFloat(totalAmount.toFixed(2)));
    }
  };

  const handleProductAmountChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const totalAmount = products.reduce(
      (sum, p) => sum + (parseFloat(p.ProductAmount) || 0),
      0,
    );
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
          onChange={(newPagination) =>
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            })
          }
          scroll={{ x: 1600 }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />

        <style>{`
          .ant-table-thead > tr > th { background: #1f2937 !important; color: #ffffff !important; font-weight: 600; }
          .ant-table-thead > tr > th .ant-table-column-sorter,
          .ant-table-thead > tr > th .ant-table-column-sorter-up,
          .ant-table-thead > tr > th .ant-table-column-sorter-down { color: rgba(255, 255, 255, 0.95); }
          .table-row-light { background-color: #ffffff !important; }
          .table-row-dark { background-color: #f5f5f5 !important; }
          .table-row-light:hover { background-color: #fafafa !important; }
          .table-row-dark:hover { background-color: #efefef !important; }
          .old-order-list-item { transition: all 0.2s; }
          .old-order-list-item:hover { background: #f0f5ff !important; border-color: #1677ff !important; }
        `}</style>

        {/* ── Order Type Selection Modal ── */}
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
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Continue
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Old Order: Step 1 — Select Agent ── */}
        <Modal
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1677ff' }} />
              <span>Old Order — Select Agent</span>
            </Space>
          }
          open={oldOrderAgentModalOpen}
          onCancel={closeOldOrderAgentModal}
          width={480}
          footer={null}
        >
          <p style={{ color: '#666', marginBottom: 20, fontSize: 13 }}>
            Select an agent to browse their existing orders. The selected
            order's party details will be auto-filled in the new order form.
          </p>
          <Form
            form={oldOrderAgentForm}
            layout="vertical"
            onFinish={handleOldOrderAgentSelect}
          >
            <Form.Item
              label="Agent"
              name="agentId"
              rules={[{ required: true, message: 'Please select an agent.' }]}
            >
              <Select
                placeholder="Search and select an agent"
                options={agentOptions}
                showSearch
                size="large"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={closeOldOrderAgentModal}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  View Orders →
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Old Order: Step 2 — Pick an Order ── */}
        <Modal
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1677ff' }} />
              <span>Orders for {selectedOldAgent?.name || 'Agent'}</span>
              {oldOrdersForAgent.length > 0 && (
                <Tag color="blue">
                  {oldOrdersForAgent.length} order
                  {oldOrdersForAgent.length !== 1 ? 's' : ''}
                </Tag>
              )}
            </Space>
          }
          open={oldOrderListModalOpen}
          onCancel={closeOldOrderListModal}
          width={660}
          footer={[
            <Button
              key="back"
              onClick={() => {
                closeOldOrderListModal();
                openOldOrderAgentModal();
              }}
            >
              ← Back to Agents
            </Button>,
            <Button key="close" onClick={closeOldOrderListModal}>
              Close
            </Button>,
          ]}
        >
          {/* Info banner */}
          <div
            style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 14,
              fontSize: 13,
              color: '#0050b3',
            }}
          >
            💡 Click an order to open a <strong>New Order</strong> form with the
            party's details auto-filled from the database.
          </div>

          <Input
            placeholder="Search by Order ID, Party Name or Contact Person..."
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            value={oldOrderSearch}
            onChange={(e) => setOldOrderSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 16 }}
          />

          {oldOrdersLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: 12, color: '#999' }}>Loading orders...</p>
            </div>
          ) : filteredOldOrders.length === 0 ? (
            <Empty
              description={
                oldOrdersForAgent.length === 0
                  ? `No orders found for ${selectedOldAgent?.name || 'this agent'}`
                  : 'No orders match your search'
              }
              style={{ padding: '32px 0' }}
            />
          ) : (
            <List
              dataSource={filteredOldOrders}
              style={{ maxHeight: 440, overflowY: 'auto' }}
              renderItem={(order) => (
                <List.Item
                  className="old-order-list-item"
                  onClick={() => handleOldOrderSelect(order)}
                  style={{
                    border: '1px solid #f0f0f0',
                    marginBottom: 8,
                    borderRadius: 8,
                    padding: 14,
                    cursor: 'pointer',
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          background: '#1677ff',
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                        size={44}
                      >
                        {String(order.Party_Name || '?')[0].toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <Space wrap>
                        <span style={{ fontWeight: 600 }}>
                          {order.Party_Name}
                        </span>
                        <Tag color="geekblue" style={{ fontSize: 11 }}>
                          #{order.OrderId}
                        </Tag>
                        <Tag color="green" style={{ fontSize: 11 }}>
                          {order.Products?.length || 0} product
                          {(order.Products?.length || 0) !== 1 ? 's' : ''}
                        </Tag>
                      </Space>
                    }
                    description={
                      <span style={{ fontSize: 12, color: '#888' }}>
                        {order.Contact_Person1}
                        {order.Mobile1 ? ` · ${order.Mobile1}` : ''}
                        {order.TotalAmount != null && (
                          <strong style={{ color: '#52c41a', marginLeft: 8 }}>
                            ₹{Number(order.TotalAmount).toFixed(2)}
                          </strong>
                        )}
                      </span>
                    }
                  />
                  <Button
                    type="link"
                    style={{ color: '#1677ff', fontWeight: 600 }}
                  >
                    Select →
                  </Button>
                </List.Item>
              )}
            />
          )}
        </Modal>

        {/* ── View Order Modal ── */}
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

        {/* ── Add / Edit Order Modal ── */}
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
                  rules={[{ validator: validateMobile }]}
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

            {/* Total Amount */}
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
