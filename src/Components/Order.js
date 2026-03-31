import { useMemo, useState, useEffect, useCallback } from 'react';
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
  Badge,
  Radio,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import Navbar from './Navbar';
import { getStateOptions } from '../data/states';
import { getCityOptions } from '../data/cities';

const OTHER_OPTION_VALUE = '__OTHER__';
const OTHER_SIZE_VALUE = '__OTHER_SIZE__';
const OTHER_ROLL_SIZE_VALUE = '__OTHER_ROLL_SIZE__';

const getSizeKey = (productType, productCategory) => {
  if (productType === 'Stitching') return 'stitching';
  if (productType === 'Machine') {
    switch (productCategory) {
      case 'D-Cut Bag':
        return 'd-cut';
      case 'U-Cut Bag':
        return 'u-cut';
      case 'Cake Bag - Old Pattern':
        return 'cake-bag-old';
      case 'Cake Bag - New Pattern':
        return 'cake-bag-new';
      case 'Side Gaget Bag':
        return 'side-gaget';
      case 'Bottom Gaget Bag':
        return 'bottom-gaget';
      case 'Handle Bag':
        return 'handle-bag';
      case 'Box Bag':
        return 'box-bag';
      case 'Leader Bag':
        return 'leader-bag';
      default:
        return null;
    }
  }
  return null;
};

const DROPDOWN_OPTIONS = {
  plateBlockNumbers: [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
  ],
  productTypes: [
    { label: 'Stitching', value: 'Stitching' },
    { label: 'Machine', value: 'Machine' },
  ],
  productCategory: [
    { label: 'Leader Bag', value: 'Leader Bag' },
    { label: 'D-Cut Bag', value: 'D-Cut Bag' },
    { label: 'U-Cut Bag', value: 'U-Cut Bag' },
    { label: 'Cake Bag - Old Pattern', value: 'Cake Bag - Old Pattern' },
    { label: 'Cake Bag - New Pattern', value: 'Cake Bag - New Pattern' },
    { label: 'Side Gaget Bag', value: 'Side Gaget Bag' },
    { label: 'Bottom Gaget Bag', value: 'Bottom Gaget Bag' },
    { label: 'Box Bag', value: 'Box Bag' },
    { label: 'Handle Bag', value: 'Handle Bag' },
  ],
  bagMaterials: [
    { label: 'Non-woven', value: 'Non-woven' },
    { label: 'Laminated Non Woven', value: 'Laminated Non Woven' },
    { label: 'Bopp', value: 'Bopp' },
  ],
  handleTypes: [
    { label: 'Single Colour', value: 'Single Colour' },
    { label: 'Show Colour', value: 'Show Colour' },
  ],
  printingTypes: [
    { label: 'Flexo', value: 'Flexo' },
    { label: 'Offset', value: 'Offset' },
    { label: 'Screen', value: 'Screen' },
    { label: 'Roto Gravaier', value: 'Roto Gravaier' },
  ],
  sheetColors: [
    { label: 'White', value: 'White' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Yellow', value: 'Yellow' },
    { label: 'Orange', value: 'Orange' },
    { label: 'Black', value: 'Black' },
    { label: 'Other', value: OTHER_OPTION_VALUE },
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
    { label: 'Other', value: OTHER_OPTION_VALUE },
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
    { label: 'Other', value: OTHER_OPTION_VALUE },
  ],
  colors: [
    { label: 'White', value: 'White' },
    { label: 'Black', value: 'Black' },
    { label: 'Red', value: 'Red' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Pink', value: 'Pink' },
    { label: 'Other', value: OTHER_OPTION_VALUE },
  ],
  printColors: [
    { label: 'Single ', value: 'Single ' },
    { label: '2 Colour', value: '2 Colour' },
    { label: '3 Colour ', value: '3 Colour ' },
    { label: 'Multi Colour', value: 'Multi Colour' },
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
    { label: '60', value: 60 },
    { label: '70', value: 70 },
    { label: '80', value: 80 },
    { label: '90', value: 90 },
  ],
  orderTypes: [
    { label: 'New Order', value: 'new' },
    { label: 'Repeat Order', value: 'repeat' },
    { label: 'Old Order', value: 'old' },
  ],
  designStyles: [
    { label: 'Same Front/Back', value: 'Same Front/Back' },
    { label: 'Different Front/Back', value: 'Different Front/Back' },
  ],
};

const emptyProduct = {
  ProductType: undefined,
  ProductId: undefined,
  ProductCategory: undefined,
  ProductSize: undefined,
  ProductSizeCustom: undefined,
  RollSize: undefined,
  RollSizeCustom: undefined,
  BagMaterial: undefined,
  Quantity: undefined,
  SheetGSM: undefined,
  SheetColor: undefined,
  SheetColorCustom: undefined,
  BorderGSM: undefined,
  BorderColor: undefined,
  BorderColorCustom: undefined,
  HandleType: undefined,
  HandleColor: undefined,
  HandleColorCustom: undefined,
  HandleGSM: undefined,
  PrintingType: undefined,
  PrintColor: undefined,
  Color: undefined,
  ColorCustom: undefined,
  DesignType: undefined,
  DesignStyle: undefined,
  PlateBlockNumber: undefined,
  PlateType: undefined,
  PlateRate: undefined,
  Rate: undefined,
  ProductAmount: undefined,
};

const SectionBox = ({ title, lockedTag, children, accent = '#1677ff' }) => (
  <div
    style={{
      marginBottom: 20,
      borderRadius: 10,
      border: `1px solid #e8eaf0`,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}
  >
    <div
      style={{
        padding: '10px 16px',
        background: `linear-gradient(90deg, ${accent}18 0%, #f8f9ff 100%)`,
        borderBottom: `2px solid ${accent}30`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>
        {title}
      </span>
      {lockedTag && (
        <Tag color="purple" style={{ fontSize: 11, fontWeight: 400 }}>
          🔒 Locked
        </Tag>
      )}
    </div>
    <div style={{ padding: '16px 16px 4px' }}>{children}</div>
  </div>
);

const SubHeading = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#6b7280',
      borderLeft: '3px solid #1677ff',
      paddingLeft: 8,
      marginBottom: 12,
      marginTop: 18,
    }}
  >
    {children}
  </div>
);

const OtherSelectField = ({
  fieldName,
  selectFieldKey,
  customFieldKey,
  label,
  options,
  disabled,
  form,
  required = true,
}) => (
  <Form.Item
    noStyle
    shouldUpdate={(prev, cur) => {
      const p = prev.Products?.[fieldName]?.[selectFieldKey];
      const c = cur.Products?.[fieldName]?.[selectFieldKey];
      return p !== c;
    }}
  >
    {() => {
      const selectedValue = form.getFieldValue([
        'Products',
        fieldName,
        selectFieldKey,
      ]);
      const isOther = selectedValue === OTHER_OPTION_VALUE;
      return (
        <Row gutter={8} align="middle" style={{ marginBottom: 0 }}>
          <Col flex={isOther ? '140px' : 'auto'}>
            <Form.Item
              label={label}
              name={[fieldName, selectFieldKey]}
              rules={
                required
                  ? [{ required: true, message: `Please select ${label}.` }]
                  : []
              }
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder={`Select ${label}`}
                options={options}
                disabled={disabled}
                onChange={() => {
                  const products = form.getFieldValue('Products') || [];
                  const updated = [...products];
                  if (updated[fieldName]) {
                    updated[fieldName][customFieldKey] = undefined;
                    form.setFieldValue('Products', updated);
                  }
                }}
              />
            </Form.Item>
          </Col>
          {isOther && (
            <Col flex="auto">
              <Form.Item
                label={`Custom ${label}`}
                name={[fieldName, customFieldKey]}
                rules={
                  required
                    ? [
                        {
                          required: true,
                          message: `Please enter custom ${label}.`,
                        },
                        {
                          validator: (_, value) => {
                            const v = String(value || '').trim();
                            if (!v)
                              return Promise.reject(
                                new Error(`Please enter custom ${label}.`),
                              );
                            return Promise.resolve();
                          },
                        },
                      ]
                    : []
                }
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder={`Type custom ${label}…`}
                  disabled={disabled}
                  allowClear
                />
              </Form.Item>
            </Col>
          )}
        </Row>
      );
    }}
  </Form.Item>
);

const ProductSizeField = ({
  fieldName,
  productType,
  productCategory,
  sizeOptions,
  onNewSizeAdded,
  disabled,
  form,
  required = true,
}) => {
  const sizeKey = getSizeKey(productType, productCategory);
  const baseOptions = sizeKey ? sizeOptions[sizeKey] || [] : [];
  const options = [...baseOptions, { label: 'Other', value: OTHER_SIZE_VALUE }];
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => {
        const p = prev.Products?.[fieldName]?.ProductSize;
        const c = cur.Products?.[fieldName]?.ProductSize;
        return p !== c;
      }}
    >
      {() => {
        const selectedValue = form.getFieldValue([
          'Products',
          fieldName,
          'ProductSize',
        ]);
        const isOther = selectedValue === OTHER_SIZE_VALUE;
        const handleSaveCustomSize = async () => {
          const customVal = String(
            form.getFieldValue(['Products', fieldName, 'ProductSizeCustom']) ||
              '',
          ).trim();
          if (!customVal || !sizeKey) return;
          try {
            const res = await fetch(
              `/api/sizes/${encodeURIComponent(sizeKey)}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ size: customVal }),
              },
            );
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.detail || 'Failed to save new size');
            }
            onNewSizeAdded(sizeKey, customVal);
            const products = form.getFieldValue('Products') || [];
            const updated = [...products];
            updated[fieldName] = {
              ...updated[fieldName],
              ProductSize: customVal,
              ProductSizeCustom: undefined,
            };
            form.setFieldValue('Products', updated);
            message.success(`Size "${customVal}" saved and added to the list.`);
          } catch (err) {
            message.error(err?.message || 'Failed to save custom size');
          }
        };
        return (
          <Row gutter={8} align="middle" style={{ marginBottom: 0 }}>
            <Col flex={isOther ? '140px' : 'auto'}>
              <Form.Item
                label="Product Size"
                name={[fieldName, 'ProductSize']}
                rules={
                  required
                    ? [
                        {
                          required: true,
                          message: 'Please select Product Size.',
                        },
                      ]
                    : []
                }
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Select Product Size"
                  options={options}
                  disabled={disabled || (!sizeKey && !isOther)}
                  onChange={(val) => {
                    if (val !== OTHER_SIZE_VALUE) {
                      const products = form.getFieldValue('Products') || [];
                      const updated = [...products];
                      if (updated[fieldName]) {
                        updated[fieldName].ProductSizeCustom = undefined;
                        form.setFieldValue('Products', updated);
                      }
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {isOther && (
              <Col flex="auto">
                <Form.Item
                  label="Custom Size"
                  name={[fieldName, 'ProductSizeCustom']}
                  rules={[
                    { required: true, message: 'Please enter a custom size.' },
                    {
                      validator: (_, value) => {
                        const v = String(value || '').trim();
                        if (!v)
                          return Promise.reject(
                            new Error('Please enter a custom size.'),
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="e.g., 12x16"
                    allowClear
                    disabled={disabled}
                    onBlur={handleSaveCustomSize}
                    onPressEnter={handleSaveCustomSize}
                    suffix={
                      <Button
                        size="small"
                        type="link"
                        style={{ padding: 0, height: 'auto', fontSize: 12 }}
                        onClick={handleSaveCustomSize}
                      >
                        Save
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        );
      }}
    </Form.Item>
  );
};

const RollSizeField = ({
  fieldName,
  rollSizeOptions,
  onNewRollSizeAdded,
  disabled,
  form,
  required = false,
}) => {
  const options = [
    ...rollSizeOptions,
    { label: 'Other', value: OTHER_ROLL_SIZE_VALUE },
  ];
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => {
        const p = prev.Products?.[fieldName]?.RollSize;
        const c = cur.Products?.[fieldName]?.RollSize;
        return p !== c;
      }}
    >
      {() => {
        const selectedValue = form.getFieldValue([
          'Products',
          fieldName,
          'RollSize',
        ]);
        const isOther = selectedValue === OTHER_ROLL_SIZE_VALUE;
        const handleSaveCustomRollSize = async () => {
          const customVal = String(
            form.getFieldValue(['Products', fieldName, 'RollSizeCustom']) || '',
          ).trim();
          if (!customVal) return;
          try {
            const res = await fetch('/api/roll-sizes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ size: customVal }),
            });
            if (!res.ok) {
              if (res.status === 409) {
                onNewRollSizeAdded(customVal);
                const products = form.getFieldValue('Products') || [];
                const updated = [...products];
                updated[fieldName] = {
                  ...updated[fieldName],
                  RollSize: customVal,
                  RollSizeCustom: undefined,
                };
                form.setFieldValue('Products', updated);
                message.info(
                  `Roll size "${customVal}" already exists — selected.`,
                );
                return;
              }
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.detail || 'Failed to save new roll size');
            }
            onNewRollSizeAdded(customVal);
            const products = form.getFieldValue('Products') || [];
            const updated = [...products];
            updated[fieldName] = {
              ...updated[fieldName],
              RollSize: customVal,
              RollSizeCustom: undefined,
            };
            form.setFieldValue('Products', updated);
            message.success(
              `Roll size "${customVal}" saved and added to the list.`,
            );
          } catch (err) {
            message.error(err?.message || 'Failed to save custom roll size');
          }
        };
        return (
          <Row gutter={8} align="middle" style={{ marginBottom: 0 }}>
            <Col flex={isOther ? '140px' : 'auto'}>
              <Form.Item
                label="Roll Size"
                name={[fieldName, 'RollSize']}
                rules={
                  required
                    ? [{ required: true, message: 'Please select Roll Size.' }]
                    : []
                }
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Select Roll Size"
                  options={options}
                  disabled={disabled}
                  allowClear={!required}
                  onChange={(val) => {
                    if (val !== OTHER_ROLL_SIZE_VALUE) {
                      const products = form.getFieldValue('Products') || [];
                      const updated = [...products];
                      if (updated[fieldName]) {
                        updated[fieldName].RollSizeCustom = undefined;
                        form.setFieldValue('Products', updated);
                      }
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {isOther && (
              <Col flex="auto">
                <Form.Item
                  label="Custom Roll Size"
                  name={[fieldName, 'RollSizeCustom']}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a custom roll size.',
                    },
                    {
                      validator: (_, value) => {
                        const v = String(value || '').trim();
                        if (!v)
                          return Promise.reject(
                            new Error('Please enter a custom roll size.'),
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="e.g., 45 Inches"
                    allowClear
                    disabled={disabled}
                    onBlur={handleSaveCustomRollSize}
                    onPressEnter={handleSaveCustomRollSize}
                    suffix={
                      <Button
                        size="small"
                        type="link"
                        style={{ padding: 0, height: 'auto', fontSize: 12 }}
                        onClick={handleSaveCustomRollSize}
                      >
                        Save
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        );
      }}
    </Form.Item>
  );
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
  // eslint-disable-next-line no-unused-vars
  const [selectedOrderType, setSelectedOrderType] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const [sizeOptions, setSizeOptions] = useState({
    stitching: [],
    'd-cut': [],
    'u-cut': [],
    'cake-bag-old': [],
    'cake-bag-new': [],
    'side-gaget': [],
    'bottom-gaget': [],
    'handle-bag': [],
    'box-bag': [],
    'leader-bag': [],
  });
  const [rollSizeOptions, setRollSizeOptions] = useState([]);

  const [oldOrderAgentModalOpen, setOldOrderAgentModalOpen] = useState(false);
  const [oldOrderListModalOpen, setOldOrderListModalOpen] = useState(false);
  const [selectedOldAgent, setSelectedOldAgent] = useState(null);
  const [oldOrdersForAgent, setOldOrdersForAgent] = useState([]);
  const [oldOrdersLoading, setOldOrdersLoading] = useState(false);
  const [oldOrderSearch, setOldOrderSearch] = useState('');
  const [oldOrderAgentForm] = Form.useForm();

  const [repeatOrderAgentModalOpen, setRepeatOrderAgentModalOpen] =
    useState(false);
  const [repeatOrderListModalOpen, setRepeatOrderListModalOpen] =
    useState(false);
  const [selectedRepeatAgent, setSelectedRepeatAgent] = useState(null);
  const [repeatOrdersForAgent, setRepeatOrdersForAgent] = useState([]);
  const [repeatOrdersLoading, setRepeatOrdersLoading] = useState(false);
  const [repeatOrderSearch, setRepeatOrderSearch] = useState('');
  const [isRepeatOrder, setIsRepeatOrder] = useState(false);
  const [repeatOrderAgentForm] = Form.useForm();

  const [form] = Form.useForm();
  const [orderTypeForm] = Form.useForm();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const stateOptions = useMemo(() => getStateOptions(), []);
  const cityOptions = useMemo(
    () => getCityOptions(selectedState),
    [selectedState],
  );

  const handleNewSizeAdded = useCallback((sizeKey, newValue) => {
    setSizeOptions((prev) => {
      const existing = prev[sizeKey] || [];
      if (existing.some((o) => o.value === newValue)) return prev;
      return {
        ...prev,
        [sizeKey]: [...existing, { label: newValue, value: newValue }],
      };
    });
  }, []);

  const handleNewRollSizeAdded = useCallback((newValue) => {
    setRollSizeOptions((prev) => {
      if (prev.some((o) => o.value === newValue)) return prev;
      const updated = [...prev, { label: newValue, value: newValue }];
      updated.sort((a, b) => a.label.localeCompare(b.label));
      return updated;
    });
  }, []);

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

  const pickValueOrOther = (selectedValue, otherValue) => {
    if (selectedValue !== OTHER_OPTION_VALUE) return selectedValue;
    const v = String(otherValue || '').trim();
    return v || null;
  };

  const loadSizes = useCallback(async () => {
    try {
      const res = await fetch('/api/sizes');
      if (!res.ok) throw new Error(`Failed to fetch sizes (${res.status})`);
      const fetched = await res.json();
      setSizeOptions({
        stitching: fetched['stitching'] || [],
        'd-cut': fetched['d-cut'] || [],
        'u-cut': fetched['u-cut'] || [],
        'cake-bag-old': fetched['cake-bag-old'] || [],
        'cake-bag-new': fetched['cake-bag-new'] || [],
        'side-gaget': fetched['side-gaget'] || [],
        'bottom-gaget': fetched['bottom-gaget'] || [],
        'handle-bag': fetched['handle-bag'] || [],
        'box-bag': fetched['box-bag'] || [],
        'leader-bag': fetched['leader-bag'] || [],
      });
    } catch {
      message.error('Failed to load product size options');
    }
  }, []);

  const loadRollSizes = useCallback(async () => {
    try {
      const res = await fetch('/api/roll-sizes');
      if (!res.ok)
        throw new Error(`Failed to fetch roll sizes (${res.status})`);
      const data = await res.json();
      setRollSizeOptions(
        (data.sizes || []).map((s) => ({ label: s, value: s })),
      );
    } catch {
      message.error('Failed to load roll size options');
    }
  }, []);

  useEffect(() => {
    loadSizes();
    loadRollSizes();
  }, [loadSizes, loadRollSizes]);

  const handleProductTypeChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const productIndex = parseInt(fieldName.split('_')[0]);
    if (productIndex >= 0 && productIndex < products.length) {
      const updated = [...products];
      updated[productIndex].ProductSize = undefined;
      updated[productIndex].ProductSizeCustom = undefined;
      updated[productIndex].ProductCategory = undefined;
      updated[productIndex].BorderGSM = undefined;
      updated[productIndex].BorderColor = undefined;
      updated[productIndex].BorderColorCustom = undefined;
      form.setFieldValue('Products', updated);
    }
  };

  const handleProductCategoryChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const productIndex = parseInt(fieldName.split('_')[0]);
    if (productIndex >= 0 && productIndex < products.length) {
      const updated = [...products];
      updated[productIndex].ProductSize = undefined;
      updated[productIndex].ProductSizeCustom = undefined;
      form.setFieldValue('Products', updated);
    }
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

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const [orders, agentsData] = await Promise.all([
        fetchOrders(),
        fetchAgents(),
      ]);
      setAgents(agentsData);
      setData(
        orders.map((o, idx) => {
          const agent = agentsData.find((a) => a.agentId === o.AgentId);
          return {
            key: o.OrderId ?? String(idx),
            ...o,
            agentName: agent ? agent.name : '',
          };
        }),
      );
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
        setData(
          orders.map((o, idx) => {
            const agent = agentsData.find((a) => a.agentId === o.AgentId);
            return {
              key: o.OrderId ?? String(idx),
              ...o,
              agentName: agent ? agent.name : '',
            };
          }),
        );
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
  const compareNumber = (a, b, field) =>
    Number(a?.[field] ?? 0) - Number(b?.[field] ?? 0);

  const openOldOrderAgentModal = async () => {
    oldOrderAgentForm.resetFields();
    setSelectedOldAgent(null);
    setOldOrdersForAgent([]);
    setOldOrderSearch('');
    try {
      setAgents(await fetchAgents());
    } catch (err) {
      message.error(err.message);
    }
    setOldOrderAgentModalOpen(true);
  };

  const handleOldOrderAgentSelect = async (values) => {
    const agentId = values.agentId;
    setSelectedOldAgent(agents.find((a) => a.agentId === agentId));
    setOldOrderAgentModalOpen(false);
    setOldOrderListModalOpen(true);
    setOldOrderSearch('');
    setOldOrdersLoading(true);
    try {
      const all = await fetchOrders();
      setOldOrdersForAgent(all.filter((o) => o.AgentId === agentId));
    } catch {
      message.error('Failed to load orders for this agent');
      setOldOrdersForAgent([]);
    } finally {
      setOldOrdersLoading(false);
    }
  };

  const handleOldOrderSelect = async (order) => {
    setOldOrderListModalOpen(false);
    const key = 'party-lookup';
    message.loading({ content: 'Loading party details...', key, duration: 0 });
    try {
      setAgents(await fetchAgents());
      const partyData = await fetchPartyByName(order.Party_Name);
      setModalMode('add');
      setEditingOrderId(null);
      setIsRepeatOrder(false);
      const state = partyData?.state || partyData?.State || order.State || null;
      setSelectedState(state);
      form.resetFields();
      form.setFieldsValue({
        AgentId: order.AgentId,
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
        BookingName: '',
        TransportName: '',
        DispatchContactNumber: '',
        Destination: '',
        Products: [{ ...emptyProduct }],
        TotalAmount: 0,
        Carting: 0,
      });
      message.success({
        content: partyData
          ? `Party details loaded from database for "${order.Party_Name}"`
          : `Party details filled from order (no party record found for "${order.Party_Name}")`,
        key,
        duration: 3,
      });
      setIsModalOpen(true);
    } catch (err) {
      message.error({ content: 'Failed to load party details', key });
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

  const openRepeatOrderAgentModal = async () => {
    repeatOrderAgentForm.resetFields();
    setSelectedRepeatAgent(null);
    setRepeatOrdersForAgent([]);
    setRepeatOrderSearch('');
    try {
      setAgents(await fetchAgents());
    } catch (err) {
      message.error(err.message);
    }
    setRepeatOrderAgentModalOpen(true);
  };

  const handleRepeatOrderAgentSelect = async (values) => {
    const agentId = values.agentId;
    setSelectedRepeatAgent(agents.find((a) => a.agentId === agentId));
    setRepeatOrderAgentModalOpen(false);
    setRepeatOrderListModalOpen(true);
    setRepeatOrderSearch('');
    setRepeatOrdersLoading(true);
    try {
      const all = await fetchOrders();
      setRepeatOrdersForAgent(all.filter((o) => o.AgentId === agentId));
    } catch {
      message.error('Failed to load orders for this agent');
      setRepeatOrdersForAgent([]);
    } finally {
      setRepeatOrdersLoading(false);
    }
  };

  const normaliseColorForForm = (value, options) => {
    if (!value) return { selected: undefined, custom: undefined };
    const match = options.find((o) => o.value === value);
    if (match) return { selected: value, custom: undefined };
    return { selected: OTHER_OPTION_VALUE, custom: value };
  };

  const normaliseRollSizeForForm = (value, options) => {
    if (!value) return { selected: undefined, custom: undefined };
    const match = options.find((o) => o.value === value);
    if (match) return { selected: value, custom: undefined };
    return { selected: OTHER_ROLL_SIZE_VALUE, custom: value };
  };

  const handleRepeatOrderSelect = async (order) => {
    setRepeatOrderListModalOpen(false);
    const key = 'repeat-order-lookup';
    message.loading({ content: 'Loading order details...', key, duration: 0 });
    try {
      setAgents(await fetchAgents());
      setModalMode('add');
      setEditingOrderId(null);
      setIsRepeatOrder(true);
      const state = order.State || null;
      setSelectedState(state);
      const copiedProducts = (order.Products || []).map((p) => {
        const sc = normaliseColorForForm(
          p.SheetColor,
          DROPDOWN_OPTIONS.sheetColors,
        );
        const bc = normaliseColorForForm(
          p.BorderColor,
          DROPDOWN_OPTIONS.borderColors,
        );
        const hc = normaliseColorForForm(
          p.HandleColor,
          DROPDOWN_OPTIONS.handleColors,
        );
        const cc = normaliseColorForForm(p.Color, DROPDOWN_OPTIONS.colors);
        const rs = normaliseRollSizeForForm(p.RollSize, rollSizeOptions);
        return {
          ProductType: p.ProductType,
          ProductId: p.ProductId,
          ProductCategory: p.ProductCategory,
          ProductSize: p.ProductSize,
          ProductSizeCustom: undefined,
          RollSize: rs.selected,
          RollSizeCustom: rs.custom,
          BagMaterial: p.BagMaterial,
          Quantity: p.Quantity,
          SheetGSM: p.SheetGSM,
          SheetColor: sc.selected,
          SheetColorCustom: sc.custom,
          BorderGSM: p.BorderGSM,
          BorderColor: bc.selected,
          BorderColorCustom: bc.custom,
          HandleType: p.HandleType,
          HandleColor: hc.selected,
          HandleColorCustom: hc.custom,
          HandleGSM: p.HandleGSM,
          PrintingType: p.PrintingType,
          PrintColor: p.PrintColor,
          Color: cc.selected,
          ColorCustom: cc.custom,
          DesignType: p.DesignType || undefined,
          DesignStyle: p.DesignStyle || undefined,
          PlateBlockNumber: p.PlateBlockNumber || undefined,
          PlateType: p.PlateType || undefined,
          PlateRate: p.PlateRate || undefined,
          Rate: p.Rate,
          ProductAmount: p.ProductAmount || 0,
        };
      });
      form.resetFields();
      form.setFieldsValue({
        AgentId: order.AgentId,
        Party_Name: order.Party_Name || '',
        AliasOrCompanyName: order.AliasOrCompanyName || '',
        Address: order.Address || '',
        State: order.State || '',
        City: order.City || '',
        Pincode: order.Pincode || '',
        Contact_Person1: order.Contact_Person1 || '',
        Contact_Person2: order.Contact_Person2 || '',
        Mobile1: order.Mobile1 || '',
        Mobile2: order.Mobile2 || '',
        Email: order.Email || '',
        BookingName: order.BookingName || '',
        TransportName: order.TransportName || '',
        DispatchContactNumber: order.DispatchContactNumber || '',
        Destination: order.Destination || '',
        Products: copiedProducts,
        TotalAmount: order.TotalAmount || 0,
        Carting: order.Carting || 0,
      });
      message.success({
        content: `Repeat order loaded from #${order.OrderId}. Only Quantity can be edited.`,
        key,
        duration: 3,
      });
      setIsModalOpen(true);
    } catch (err) {
      message.error({ content: 'Failed to load order details', key });
      console.error('handleRepeatOrderSelect error:', err);
    }
  };

  const closeRepeatOrderAgentModal = () => {
    setRepeatOrderAgentModalOpen(false);
    repeatOrderAgentForm.resetFields();
    setSelectedRepeatAgent(null);
  };
  const closeRepeatOrderListModal = () => {
    setRepeatOrderListModalOpen(false);
    setRepeatOrdersForAgent([]);
    setSelectedRepeatAgent(null);
    setRepeatOrderSearch('');
  };

  const filteredRepeatOrders = useMemo(() => {
    if (!repeatOrderSearch.trim()) return repeatOrdersForAgent;
    const q = repeatOrderSearch.trim().toLowerCase();
    return repeatOrdersForAgent.filter((o) =>
      [o.OrderId, o.Party_Name, o.Contact_Person1].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [repeatOrdersForAgent, repeatOrderSearch]);

  const handleOrderTypeSelect = async (values) => {
    try {
      const orderType = values.orderType;
      setSelectedOrderType(orderType);
      setOrderTypeModalOpen(false);
      if (orderType === 'new') openAddOrderModal();
      else if (orderType === 'repeat') openRepeatOrderAgentModal();
      else if (orderType === 'old') openOldOrderAgentModal();
    } catch {
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
    setIsRepeatOrder(false);
    form.resetFields();
    form.setFieldValue('Products', [{ ...emptyProduct }]);
    form.setFieldValue('TotalAmount', 0);
    form.setFieldValue('Carting', 0);
    try {
      await Promise.all([
        fetchAgents().then(setAgents),
        loadSizes(),
        loadRollSizes(),
      ]);
    } catch (err) {
      message.error(err.message);
    }
    setIsModalOpen(true);
  };

  const openEditModal = async (record) => {
    setModalMode('edit');
    setEditingOrderId(record.OrderId);
    setSelectedState(record.State || null);
    setIsRepeatOrder(false);
    try {
      await Promise.all([
        fetchAgents().then(setAgents),
        loadSizes(),
        loadRollSizes(),
      ]);
    } catch (err) {
      message.error(err.message);
    }
    const normalisedProducts = (record.Products || [{ ...emptyProduct }]).map(
      (p) => {
        const sc = normaliseColorForForm(
          p.SheetColor,
          DROPDOWN_OPTIONS.sheetColors,
        );
        const bc = normaliseColorForForm(
          p.BorderColor,
          DROPDOWN_OPTIONS.borderColors,
        );
        const hc = normaliseColorForForm(
          p.HandleColor,
          DROPDOWN_OPTIONS.handleColors,
        );
        const cc = normaliseColorForForm(p.Color, DROPDOWN_OPTIONS.colors);
        const rs = normaliseRollSizeForForm(p.RollSize, rollSizeOptions);
        return {
          ...emptyProduct,
          ...p,
          ProductSizeCustom: undefined,
          RollSize: rs.selected,
          RollSizeCustom: rs.custom ?? undefined,
          SheetColor: sc.selected,
          SheetColorCustom: sc.custom ?? p.SheetColorCustom ?? undefined,
          BorderColor: bc.selected,
          BorderColorCustom: bc.custom ?? p.BorderColorCustom ?? undefined,
          HandleColor: hc.selected,
          HandleColorCustom: hc.custom ?? p.HandleColorCustom ?? undefined,
          Color: cc.selected,
          ColorCustom: cc.custom ?? p.ColorCustom ?? undefined,
          DesignType: p.DesignType ?? undefined,
          DesignStyle: p.DesignStyle ?? undefined,
          PlateType: p.PlateType ?? undefined,
          PlateRate: p.PlateRate ?? undefined,
        };
      },
    );
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
      Email: record.Email || '',
      BookingName: record.BookingName || '',
      TransportName: record.TransportName || '',
      DispatchContactNumber: record.DispatchContactNumber || '',
      Destination: record.Destination || '',
      Products: normalisedProducts,
      TotalAmount: record.TotalAmount || 0,
      Carting: record.Carting || 0,
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
    setIsRepeatOrder(false);
  };
  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingOrder(null);
  };

  const addPartyFromOrder = async (values, orderId) => {
    try {
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyName: values.Party_Name,
          aliasOrCompanyName: values.AliasOrCompanyName,
          address: values.Address,
          city: values.City,
          state: values.State,
          pincode: String(values.Pincode),
          agentId: values.AgentId ? parseInt(values.AgentId) : null,
          contact_Person1: values.Contact_Person1,
          contact_Person2: values.Contact_Person2 || null,
          email: values.Email || null,
          mobile1: String(values.Mobile1),
          mobile2: values.Mobile2 ? String(values.Mobile2) : null,
          orderId: orderId ? String(orderId) : null,
        }),
      });
      if (!res.ok) {
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
    (products || []).map((p) => {
      let resolvedRollSize = p.RollSize;
      if (p.RollSize === OTHER_ROLL_SIZE_VALUE) {
        resolvedRollSize = String(p.RollSizeCustom || '').trim() || null;
      }
      return {
        ProductType: p.ProductType,
        ProductId: p.ProductId,
        ProductCategory: p.ProductCategory,
        ProductSize:
          p.ProductSize === OTHER_SIZE_VALUE
            ? String(p.ProductSizeCustom || '').trim() || null
            : p.ProductSize,
        RollSize: resolvedRollSize || null,
        BagMaterial: p.BagMaterial,
        Quantity: p.Quantity,
        SheetGSM: Number(p.SheetGSM),
        SheetColor: pickValueOrOther(p.SheetColor, p.SheetColorCustom),
        BorderGSM:
          p.ProductType === 'Machine'
            ? p.BorderGSM
              ? Number(p.BorderGSM)
              : null
            : Number(p.BorderGSM),
        BorderColor:
          p.ProductType === 'Machine'
            ? p.BorderColor
              ? pickValueOrOther(p.BorderColor, p.BorderColorCustom)
              : null
            : pickValueOrOther(p.BorderColor, p.BorderColorCustom),
        HandleType: p.HandleType,
        HandleColor: pickValueOrOther(p.HandleColor, p.HandleColorCustom),
        HandleGSM: Number(p.HandleGSM),
        PrintingType: p.PrintingType,
        PrintColor: p.PrintColor,
        Color: pickValueOrOther(p.Color, p.ColorCustom),
        DesignType: p.DesignType || null,
        DesignStyle: p.DesignStyle || null,
        PlateBlockNumber: p.PlateBlockNumber || null,
        PlateType: p.PlateType || null,
        PlateRate: p.PlateRate ? parseFloat(p.PlateRate) : null,
        Rate: p.Rate,
        ProductAmount: p.ProductAmount || 0,
      };
    });

  // ── CHANGED: shared helper — TotalAmount = sum(ProductAmounts) + Carting ──
  const recalcTotalAmount = useCallback(() => {
    const products = form.getFieldValue('Products') || [];
    const carting = parseFloat(form.getFieldValue('Carting') || 0);
    const productsSum = products.reduce(
      (s, p) => s + (parseFloat(p?.ProductAmount) || 0),
      0,
    );
    const total = parseFloat((productsSum + carting).toFixed(2));
    form.setFieldValue('TotalAmount', total);
    return total;
  }, [form]);

  // ── CHANGED: recalc ProductAmount then TotalAmount (with Carting) ──
  const handleRateOrQuantityChange = (fieldName) => {
    const products = form.getFieldValue('Products') || [];
    const productIndex = parseInt(fieldName.split('_')[0]);
    if (productIndex >= 0 && productIndex < products.length) {
      const product = products[productIndex];
      const productAmount = parseFloat(
        (
          (parseFloat(product.Rate) || 0) * (parseFloat(product.Quantity) || 0)
        ).toFixed(2),
      );
      const updated = [...products];
      updated[productIndex].ProductAmount = productAmount;
      form.setFieldValue('Products', updated);
      recalcTotalAmount();
    }
  };

  // ── CHANGED: recalc TotalAmount (with Carting) after manual ProductAmount edit ──
  const handleProductAmountChange = () => {
    recalcTotalAmount();
  };

  // ── CHANGED: compute correct TotalAmount at submit so DynamoDB gets sum + Carting ──
  const computeFinalTotalAmount = (values) => {
    const productsSum = (values.Products || []).reduce(
      (s, p) => s + (parseFloat(p?.ProductAmount) || 0),
      0,
    );
    const carting = parseFloat(values.Carting || 0);
    return parseFloat((productsSum + carting).toFixed(2));
  };

  const handleAdd = async (values) => {
    if (!values.Products || values.Products.length === 0)
      throw new Error('Please add at least one product');
    const totalAmount = computeFinalTotalAmount(values); // ← CHANGED
    if (isNaN(totalAmount) || totalAmount < 0)
      throw new Error('Total Amount must be a valid non-negative number');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        Email: values.Email || null,
        BookingName: values.BookingName || null,
        TransportName: values.TransportName || null,
        DispatchContactNumber: values.DispatchContactNumber || null,
        Destination: values.Destination || null,
        TotalAmount: totalAmount, // ← CHANGED: sum of products + carting
        Carting: parseFloat(values.Carting || 0),
        Products: buildProductsPayload(values.Products),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to create order (${res.status}): ${text}`);
    }
    return res.json().catch(() => null);
  };

  const handleUpdate = async (orderId, values) => {
    if (!values.Products || values.Products.length === 0)
      throw new Error('Please add at least one product');
    const totalAmount = computeFinalTotalAmount(values); // ← CHANGED
    if (isNaN(totalAmount) || totalAmount < 0)
      throw new Error('Total Amount must be a valid non-negative number');
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        Email: values.Email || null,
        BookingName: values.BookingName || null,
        TransportName: values.TransportName || null,
        DispatchContactNumber: values.DispatchContactNumber || null,
        Destination: values.Destination || null,
        TotalAmount: totalAmount, // ← CHANGED: sum of products + carting
        Carting: parseFloat(values.Carting || 0),
        Products: buildProductsPayload(values.Products),
      }),
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
      if (!values.Products || values.Products.length === 0) {
        message.error('Please add at least one product');
        setLoading(false);
        return;
      }
      if (modalMode === 'add') {
        const created = await handleAdd(values);
        await addPartyFromOrder(values, created?.OrderId ?? null);
        message.success(
          created?.OrderId
            ? `Created order ${created.OrderId} with ${values.Products.length} product(s)`
            : 'Order created successfully',
        );
        setIsModalOpen(false);
        setSelectedState(null);
        setIsRepeatOrder(false);
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
        setIsRepeatOrder(false);
        await refreshOrders();
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agentOptions = agents.map((a) => ({ label: a.name, value: a.agentId }));

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'OrderId',
      key: 'OrderId',
      width: 120,
      sorter: (a, b) => compareText(a, b, 'OrderId'),
      sortDirections: ['ascend', 'descend'],
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span>
      ),
    },
    {
      title: 'Agent',
      dataIndex: 'agentName',
      key: 'agentName',
      width: 150,
      sorter: (a, b) => compareText(a, b, 'agentName'),
      sortDirections: ['ascend', 'descend'],
      render: (v) =>
        v ? (
          <Tag color="blue" style={{ fontWeight: 500 }}>
            {v}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Party Name',
      dataIndex: 'Party_Name',
      key: 'Party_Name',
      width: 160,
      sorter: (a, b) => compareText(a, b, 'Party_Name'),
      sortDirections: ['ascend', 'descend'],
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Contact Person 1',
      dataIndex: 'Contact_Person1',
      key: 'Contact_Person1',
      width: 150,
      sorter: (a, b) => compareText(a, b, 'Contact_Person1'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Mobile 1',
      dataIndex: 'Mobile1',
      key: 'Mobile1',
      width: 130,
      sorter: (a, b) => compareNumber(a, b, 'Mobile1'),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
      width: 180,
      sorter: (a, b) => compareText(a, b, 'Email'),
      sortDirections: ['ascend', 'descend'],
      render: (v) => <span style={{ color: '#595959' }}>{v || '-'}</span>,
    },
    {
      title: 'Products',
      dataIndex: 'Products',
      key: 'ProductCount',
      width: 110,
      render: (products) => (
        <Badge
          count={products ? products.length : 0}
          style={{
            backgroundColor: products?.length > 0 ? '#52c41a' : '#d9d9d9',
          }}
          showZero
        />
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'TotalAmount',
      key: 'TotalAmount',
      width: 140,
      render: (amount) => (
        <span style={{ fontWeight: 700, color: '#389e0d', fontSize: 14 }}>
          ₹{Number(amount || 0).toFixed(2)}
        </span>
      ),
      sorter: (a, b) => compareNumber(a, b, 'TotalAmount'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type="primary"
            ghost
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

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      [
        row.OrderId,
        row.Party_Name,
        row.Contact_Person1,
        row.Email,
        row.agentName,
      ].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, searchText]);

  const onSearchChange = (value) => {
    setSearchText(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const renderOrderListItem = ({
    order,
    onSelect,
    avatarColor,
    tagColor,
    linkColor,
  }) => (
    <List.Item
      className="order-list-item"
      onClick={() => onSelect(order)}
      style={{
        border: '1px solid #f0f0f0',
        marginBottom: 8,
        borderRadius: 10,
        padding: 14,
        cursor: 'pointer',
        background: '#fff',
        transition: 'all 0.18s ease',
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            style={{
              background: avatarColor,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: `0 0 0 3px ${avatarColor}22`,
            }}
            size={44}
          >
            {String(order.Party_Name || '?')[0].toUpperCase()}
          </Avatar>
        }
        title={
          <Space wrap>
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {order.Party_Name}
            </span>
            <Tag color={tagColor} style={{ fontSize: 11 }}>
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
      <Button type="link" style={{ color: linkColor, fontWeight: 600 }}>
        Select →
      </Button>
    </List.Item>
  );

  return (
    <div style={{ width: '100%', background: '#f4f6fb', minHeight: '100vh' }}>
      <Navbar />
      <style>{`
        .orders-table .ant-table-thead > tr > th { background: #1f2937 !important; color: #ffffff !important; font-weight: 600; font-size: 13px; border-bottom: none !important; }
        .orders-table .ant-table-thead > tr > th .ant-table-column-sorter,
        .orders-table .ant-table-thead > tr > th .ant-table-column-sorter-up,
        .orders-table .ant-table-thead > tr > th .ant-table-column-sorter-down { color: rgba(255,255,255,0.85); }
        .orders-table .table-row-light { background-color: #ffffff !important; }
        .orders-table .table-row-dark  { background-color: #f8f9fc !important; }
        .orders-table .ant-table-row:hover > td { background-color: #e6f4ff !important; }
        .orders-table .ant-table-cell { font-size: 13px; }
        .orders-table-card { border-radius: 12px !important; overflow: hidden; }
        .orders-table-card .ant-card-body { padding: 0 !important; }
        .order-list-item:hover { background: #f0f5ff !important; border-color: #1677ff !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,119,255,0.10); }
        .ant-descriptions-item-label { font-weight: 600; color: #374151; background: #f9fafb; }
        .ant-form-item-label > label { font-size: 12px; font-weight: 600; color: #374151; }
        .product-card .ant-card-head { background: linear-gradient(90deg, #1677ff18 0%, #f0f5ff 100%); border-bottom: 1px solid #d6e4ff; font-weight: 700; font-size: 13px; }
        .order-modal .ant-modal-footer .ant-btn-primary { background: #1677ff; border-radius: 8px; font-weight: 600; }
        .order-modal .ant-modal-header { border-bottom: 2px solid #f0f0f0; }
        .order-modal .ant-modal-title { font-size: 16px; font-weight: 700; }
      `}</style>

      <div style={{ maxWidth: 1440, margin: '24px auto', padding: '0 20px' }}>
        {/* ── Page header ── */}
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
              <ShoppingCartOutlined style={{ color: '#fff', fontSize: 22 }} />
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
                Orders
              </h1>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                Manage and track all customer orders
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
                placeholder="Search by Order ID, Party Name, Contact Person, Email, or Agent"
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
                onClick={refreshOrders}
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
                onClick={openOrderTypeModal}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  background: '#1677ff',
                }}
              >
                Add Order
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ── Table ── */}
        <Card
          className="orders-table-card"
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            className="orders-table"
            loading={loading}
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total} orders`,
              style: { padding: '12px 20px' },
            }}
            onChange={(newPag) =>
              setPagination({
                current: newPag.current,
                pageSize: newPag.pageSize,
              })
            }
            scroll={{ x: 1600 }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </Card>

        {/* ── Order Type Selection ── */}
        <Modal
          title={
            <Space>
              <ShoppingCartOutlined style={{ color: '#1677ff' }} />
              <span>Create New Order</span>
            </Space>
          }
          open={orderTypeModalOpen}
          onCancel={closeOrderTypeModal}
          width={460}
          footer={null}
          centered
          className="order-modal"
        >
          <Form
            form={orderTypeForm}
            layout="vertical"
            onFinish={handleOrderTypeSelect}
            style={{ marginTop: 8 }}
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
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Continue →
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
          centered
          className="order-modal"
        >
          <p
            style={{
              color: '#6b7280',
              marginBottom: 20,
              fontSize: 13,
              lineHeight: 1.6,
              borderLeft: '3px solid #1677ff',
              paddingLeft: 10,
            }}
          >
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
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={closeOldOrderAgentModal}
                  style={{ borderRadius: 8 }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ borderRadius: 8 }}
                >
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
          width={680}
          centered
          className="order-modal"
          footer={[
            <Button
              key="back"
              onClick={() => {
                closeOldOrderListModal();
                openOldOrderAgentModal();
              }}
              style={{ borderRadius: 8 }}
            >
              ← Back to Agents
            </Button>,
            <Button
              key="close"
              onClick={closeOldOrderListModal}
              style={{ borderRadius: 8 }}
            >
              Close
            </Button>,
          ]}
        >
          <div
            style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: 8,
              padding: '10px 14px',
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
            style={{ marginBottom: 14, borderRadius: 8 }}
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
              style={{ maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}
              renderItem={(order) =>
                renderOrderListItem({
                  order,
                  onSelect: handleOldOrderSelect,
                  avatarColor: '#1677ff',
                  tagColor: 'geekblue',
                  linkColor: '#1677ff',
                })
              }
            />
          )}
        </Modal>

        {/* ── Repeat Order: Step 1 — Select Agent ── */}
        <Modal
          title={
            <Space>
              <FileTextOutlined style={{ color: '#722ed1' }} />
              <span>Repeat Order — Select Agent</span>
            </Space>
          }
          open={repeatOrderAgentModalOpen}
          onCancel={closeRepeatOrderAgentModal}
          width={480}
          footer={null}
          centered
          className="order-modal"
        >
          <p
            style={{
              color: '#6b7280',
              marginBottom: 20,
              fontSize: 13,
              lineHeight: 1.6,
              borderLeft: '3px solid #722ed1',
              paddingLeft: 10,
            }}
          >
            Select an agent to browse their existing orders. The selected
            order's complete details will be copied — only quantity can be
            changed.
          </p>
          <Form
            form={repeatOrderAgentForm}
            layout="vertical"
            onFinish={handleRepeatOrderAgentSelect}
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
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={closeRepeatOrderAgentModal}
                  style={{ borderRadius: 8 }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    background: '#722ed1',
                    borderColor: '#722ed1',
                    borderRadius: 8,
                  }}
                >
                  View Orders →
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Repeat Order: Step 2 — Pick an Order ── */}
        <Modal
          title={
            <Space>
              <FileTextOutlined style={{ color: '#722ed1' }} />
              <span>
                Repeat Orders for {selectedRepeatAgent?.name || 'Agent'}
              </span>
              {repeatOrdersForAgent.length > 0 && (
                <Tag color="purple">
                  {repeatOrdersForAgent.length} order
                  {repeatOrdersForAgent.length !== 1 ? 's' : ''}
                </Tag>
              )}
            </Space>
          }
          open={repeatOrderListModalOpen}
          onCancel={closeRepeatOrderListModal}
          width={680}
          centered
          className="order-modal"
          footer={[
            <Button
              key="back"
              onClick={() => {
                closeRepeatOrderListModal();
                openRepeatOrderAgentModal();
              }}
              style={{ borderRadius: 8 }}
            >
              ← Back to Agents
            </Button>,
            <Button
              key="close"
              onClick={closeRepeatOrderListModal}
              style={{ borderRadius: 8 }}
            >
              Close
            </Button>,
          ]}
        >
          <div
            style={{
              background: '#f9f0ff',
              border: '1px solid #d3adf7',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 13,
              color: '#531dab',
            }}
          >
            🔁 Click an order to create a <strong>Repeat Order</strong> with all
            details copied. You can only edit the <strong>Quantity</strong> for
            each product.
          </div>
          <Input
            placeholder="Search by Order ID, Party Name or Contact Person..."
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            value={repeatOrderSearch}
            onChange={(e) => setRepeatOrderSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 14, borderRadius: 8 }}
          />
          {repeatOrdersLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: 12, color: '#999' }}>Loading orders...</p>
            </div>
          ) : filteredRepeatOrders.length === 0 ? (
            <Empty
              description={
                repeatOrdersForAgent.length === 0
                  ? `No orders found for ${selectedRepeatAgent?.name || 'this agent'}`
                  : 'No orders match your search'
              }
              style={{ padding: '32px 0' }}
            />
          ) : (
            <List
              dataSource={filteredRepeatOrders}
              style={{ maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}
              renderItem={(order) =>
                renderOrderListItem({
                  order,
                  onSelect: handleRepeatOrderSelect,
                  avatarColor: '#722ed1',
                  tagColor: 'purple',
                  linkColor: '#722ed1',
                })
              }
            />
          )}
        </Modal>

        {/* ── View Order Modal ── */}
        <Modal
          title={
            <Space>
              <EyeOutlined style={{ color: '#1677ff' }} />
              <span>View Order</span>
              {viewingOrder?.OrderId && (
                <Tag color="blue">#{viewingOrder.OrderId}</Tag>
              )}
            </Space>
          }
          open={viewModalOpen}
          onCancel={closeViewModal}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={closeViewModal}
              style={{ borderRadius: 8 }}
            >
              Close
            </Button>,
          ]}
          width={920}
          centered
          className="order-modal"
          bodyStyle={{
            maxHeight: '72vh',
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          {viewingOrder && (
            <div>
              <SectionBox title="Party Information" accent="#1677ff">
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
              </SectionBox>
              <SectionBox title="Contact Information" accent="#13c2c2">
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
                    {viewingOrder.Email || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </SectionBox>
              <SectionBox title="Dispatch Information" accent="#fa8c16">
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Booking Name">
                    {viewingOrder.BookingName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Transport Name">
                    {viewingOrder.TransportName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact Number">
                    {viewingOrder.DispatchContactNumber || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destination">
                    {viewingOrder.Destination || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </SectionBox>
              <SectionBox
                title={`Products (${viewingOrder.Products?.length || 0})`}
                accent="#52c41a"
              >
                {viewingOrder.Products && viewingOrder.Products.length > 0 ? (
                  <>
                    {viewingOrder.Products.map((product, idx) => (
                      <Card
                        key={idx}
                        className="product-card"
                        style={{
                          marginBottom: 12,
                          borderRadius: 10,
                          border: '1px solid #d6e4ff',
                        }}
                        title={
                          <Space>
                            <span>Product {idx + 1}</span>
                            {product.ProductType && (
                              <Tag color="geekblue">{product.ProductType}</Tag>
                            )}
                            {product.ProductCategory && (
                              <Tag color="cyan">{product.ProductCategory}</Tag>
                            )}
                          </Space>
                        }
                        size="small"
                      >
                        <Descriptions bordered size="small" column={3}>
                          <Descriptions.Item label="Product Type">
                            {product.ProductType}
                          </Descriptions.Item>
                          <Descriptions.Item label="Product Category">
                            {product.ProductCategory || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Product Size">
                            {product.ProductSize}
                          </Descriptions.Item>
                          <Descriptions.Item label="Roll Size">
                            {product.RollSize ? (
                              <Tag color="geekblue">{product.RollSize}</Tag>
                            ) : (
                              '-'
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Bag Material">
                            {product.BagMaterial}
                          </Descriptions.Item>
                          <Descriptions.Item label="Quantity">
                            {product.Quantity}
                          </Descriptions.Item>
                          <Descriptions.Item label="Rate">
                            <span style={{ fontWeight: 600, color: '#1677ff' }}>
                              ₹{Number(product.Rate || 0).toFixed(2)}
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Sheet GSM">
                            {product.SheetGSM}
                          </Descriptions.Item>
                          <Descriptions.Item label="Sheet Colour">
                            {product.SheetColor}
                          </Descriptions.Item>
                          {product.ProductType !== 'Machine' && (
                            <>
                              <Descriptions.Item label="Border GSM">
                                {product.BorderGSM}
                              </Descriptions.Item>
                              <Descriptions.Item label="Border Colour">
                                {product.BorderColor}
                              </Descriptions.Item>
                            </>
                          )}
                          <Descriptions.Item label="Handle Type">
                            {product.HandleType}
                          </Descriptions.Item>
                          <Descriptions.Item label="Handle Colour">
                            {product.HandleColor}
                          </Descriptions.Item>
                          <Descriptions.Item label="Handle GSM">
                            {product.HandleGSM}
                          </Descriptions.Item>
                          <Descriptions.Item label="Printing Type">
                            {product.PrintingType}
                          </Descriptions.Item>
                          <Descriptions.Item label="Print Colour">
                            {product.PrintColor}
                          </Descriptions.Item>
                          <Descriptions.Item label="Colour">
                            {product.Color}
                          </Descriptions.Item>
                          <Descriptions.Item label="Design Type">
                            {product.DesignType ? (
                              <Tag
                                color={
                                  product.DesignType === 'Old'
                                    ? 'orange'
                                    : 'green'
                                }
                              >
                                {product.DesignType === 'Old'
                                  ? '🔄 Old Design'
                                  : '✨ New Design'}
                              </Tag>
                            ) : (
                              '-'
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Design Style">
                            {product.DesignStyle ? (
                              <Tag
                                color={
                                  product.DesignStyle === 'Same Front/Back'
                                    ? 'blue'
                                    : 'purple'
                                }
                              >
                                {product.DesignStyle === 'Same Front/Back'
                                  ? '🔁 Same Front/Back'
                                  : '🔀 Different Front/Back'}
                              </Tag>
                            ) : (
                              '-'
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Plate Type">
                            {product.PlateType ? (
                              <Tag
                                color={
                                  product.PlateType === 'Old'
                                    ? 'orange'
                                    : 'green'
                                }
                              >
                                {product.PlateType === 'Old'
                                  ? '🔄 Old Plate'
                                  : '✨ New Plate'}
                              </Tag>
                            ) : (
                              '-'
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Number of Plate">
                            {product.PlateBlockNumber || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Plate Rate">
                            {product.PlateRate != null ? (
                              <span
                                style={{ fontWeight: 600, color: '#722ed1' }}
                              >
                                ₹{Number(product.PlateRate).toFixed(2)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Product Amount" span={3}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 15,
                                color: '#389e0d',
                              }}
                            >
                              ₹{Number(product.ProductAmount || 0).toFixed(2)}
                            </span>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    ))}
                    <Divider style={{ margin: '12px 0' }} />
                    <Row justify="end" gutter={24}>
                      <Col>
                        <Statistic
                          title={
                            <span style={{ fontWeight: 600 }}>Carting</span>
                          }
                          value={viewingOrder.Carting || 0}
                          prefix="₹"
                          precision={2}
                          valueStyle={{
                            color: '#fa8c16',
                            fontWeight: 700,
                            fontSize: 20,
                          }}
                        />
                      </Col>
                      <Col>
                        <Statistic
                          title={
                            <span style={{ fontWeight: 600 }}>
                              Total Amount
                            </span>
                          }
                          value={viewingOrder.TotalAmount || 0}
                          prefix="₹"
                          precision={2}
                          valueStyle={{
                            color: '#389e0d',
                            fontWeight: 700,
                            fontSize: 24,
                          }}
                        />
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Empty description="No products" />
                )}
              </SectionBox>
            </div>
          )}
        </Modal>

        {/* ── Add / Edit Order Modal ── */}
        <Modal
          title={
            <Space>
              {modalMode === 'add' ? (
                isRepeatOrder ? (
                  <>
                    <span style={{ fontSize: 18 }}>🔁</span>
                    <span>Repeat Order — Edit Quantities & Submit</span>
                  </>
                ) : (
                  <>
                    <PlusOutlined style={{ color: '#1677ff' }} />
                    <span>Add New Order</span>
                  </>
                )
              ) : (
                <>
                  <EditOutlined style={{ color: '#faad14' }} />
                  <span>Edit Order</span>
                  <Tag color="orange">#{editingOrderId}</Tag>
                </>
              )}
            </Space>
          }
          open={isModalOpen}
          onCancel={closeModal}
          onOk={handleSubmitModal}
          okText={modalMode === 'add' ? 'Create Order' : 'Save Changes'}
          okButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
          confirmLoading={loading}
          width={1020}
          centered
          className="order-modal"
          bodyStyle={{
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          <Form form={form} layout="vertical">
            {isRepeatOrder ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  background: 'linear-gradient(90deg,#f9f0ff,#fdf4ff)',
                  borderRadius: 8,
                  border: '1px solid #d3adf7',
                }}
              >
                <p style={{ margin: 0, color: '#531dab', fontSize: 13 }}>
                  <strong>🔒 Repeat Order Mode:</strong> All party, contact, and
                  product details are locked. Only <strong>Quantity</strong> can
                  be edited. ProductAmount and TotalAmount will
                  auto-recalculate.
                </p>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  background: 'linear-gradient(90deg,#e6f7ff,#f0f9ff)',
                  borderRadius: 8,
                  border: '1px solid #91d5ff',
                }}
              >
                <p style={{ margin: 0, color: '#0050b3', fontSize: 13 }}>
                  <strong>ℹ️ Note:</strong> ProductAmount = Rate × Quantity
                  (auto-calculated). TotalAmount = Sum of all ProductAmounts +
                  Carting (auto-calculated, but editable).
                </p>
              </div>
            )}

            {/* ── Party Information ── */}
            <SectionBox
              title="Party Information"
              lockedTag={isRepeatOrder}
              accent="#1677ff"
            >
              <Form.Item
                label="Agent"
                name="AgentId"
                rules={[{ required: true, message: 'Please select an Agent.' }]}
              >
                <Select
                  placeholder="Select Agent"
                  options={agentOptions}
                  showSearch
                  disabled={isRepeatOrder}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
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
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
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
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="Address"
                name="Address"
                rules={[{ required: true, message: 'Please enter Address.' }]}
              >
                <Input
                  placeholder="e.g., Plot 123, Industrial Area"
                  disabled={isRepeatOrder}
                />
              </Form.Item>
              <Row gutter={12}>
                <Col span={8}>
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
                      disabled={isRepeatOrder}
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
                    label="City"
                    name="City"
                    rules={[{ required: true, message: 'Please enter City.' }]}
                  >
                    <Select
                      placeholder="Select City"
                      options={cityOptions}
                      showSearch
                      onChange={handleCityChange}
                      disabled={
                        isRepeatOrder ||
                        (!selectedState && cityOptions.length === 0)
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
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </SectionBox>

            {/* ── Contact Information ── */}
            <SectionBox
              title="Contact Information"
              lockedTag={isRepeatOrder}
              accent="#13c2c2"
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Contact Person 1"
                    name="Contact_Person1"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter Contact Person 1.',
                      },
                    ]}
                  >
                    <Input
                      placeholder="e.g., Rajesh Kumar"
                      onInput={handleAlphabetsOnlyInput}
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Contact Person 2 (Optional)"
                    name="Contact_Person2"
                  >
                    <Input
                      placeholder="e.g., Priya Sharma"
                      onInput={handleAlphabetsOnlyInput}
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={8}>
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
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Mobile 2 (Optional)"
                    name="Mobile2"
                    rules={[{ validator: validateMobile }]}
                  >
                    <Input
                      placeholder="e.g., 9876543211"
                      maxLength={10}
                      onInput={handleMobileInput}
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Email (Optional)"
                    name="Email"
                    rules={[{ validator: validateEmail }]}
                  >
                    <Input
                      placeholder="e.g., rajesh@abcpack.com (optional)"
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </SectionBox>

            {/* ── Dispatch Information ── */}
            <SectionBox
              title="Dispatch Information"
              lockedTag={isRepeatOrder}
              accent="#fa8c16"
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Booking Name" name="BookingName">
                    <Input
                      placeholder="e.g., Rajesh Transport Booking"
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Transport Name" name="TransportName">
                    <Input
                      placeholder="e.g., Shree Ram Transport"
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Contact Number"
                    name="DispatchContactNumber"
                    rules={[{ validator: validateMobile }]}
                  >
                    <Input
                      placeholder="e.g., 9876543210"
                      maxLength={10}
                      onInput={handleMobileInput}
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Destination" name="Destination">
                    <Input
                      placeholder="e.g., Mumbai, Maharashtra"
                      disabled={isRepeatOrder}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </SectionBox>

            {/* ── Products Section ── */}
            <SectionBox
              title="Products"
              lockedTag={isRepeatOrder}
              accent="#52c41a"
            >
              {isRepeatOrder && (
                <Tag color="purple" style={{ marginBottom: 12, fontSize: 11 }}>
                  🔒 All fields locked — only Quantity is editable
                </Tag>
              )}
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
                        <Form.Item key={field.key} noStyle shouldUpdate>
                          {() => {
                            const productType =
                              form.getFieldValue('Products')?.[idx]
                                ?.ProductType;
                            const productCategory =
                              form.getFieldValue('Products')?.[idx]
                                ?.ProductCategory;
                            const isMachine = productType === 'Machine';
                            return (
                              <Card
                                className="product-card"
                                style={{
                                  marginBottom: 16,
                                  borderRadius: 10,
                                  border: '1px solid #e8eaf0',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                }}
                                title={
                                  <Space>
                                    <span style={{ fontWeight: 700 }}>
                                      Product {idx + 1}
                                    </span>
                                    {productType && (
                                      <Tag color="geekblue">{productType}</Tag>
                                    )}
                                    {productCategory && (
                                      <Tag
                                        color="cyan"
                                        style={{ fontSize: 11 }}
                                      >
                                        {productCategory}
                                      </Tag>
                                    )}
                                  </Space>
                                }
                                extra={
                                  !isRepeatOrder && (
                                    <Button
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => remove(field.name)}
                                      style={{ borderRadius: 6 }}
                                    >
                                      Remove
                                    </Button>
                                  )
                                }
                              >
                                {/* Product Type / Category / Size */}
                                <Row gutter={12}>
                                  <Col
                                    span={productType === 'Machine' ? 8 : 12}
                                  >
                                    <Form.Item
                                      label="Product Type"
                                      name={[field.name, 'ProductType']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Please select Product Type.',
                                        },
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Product Type"
                                        options={DROPDOWN_OPTIONS.productTypes}
                                        disabled={isRepeatOrder}
                                        onChange={() =>
                                          handleProductTypeChange(
                                            `${idx}_ProductType`,
                                          )
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                  {productType === 'Machine' && (
                                    <Col span={8}>
                                      <Form.Item
                                        label="Product Category"
                                        name={[field.name, 'ProductCategory']}
                                        rules={[
                                          {
                                            required: true,
                                            message:
                                              'Please select Product Category.',
                                          },
                                        ]}
                                      >
                                        <Select
                                          placeholder="Select Product Category"
                                          options={
                                            DROPDOWN_OPTIONS.productCategory
                                          }
                                          disabled={isRepeatOrder}
                                          onChange={() =>
                                            handleProductCategoryChange(
                                              `${idx}_ProductCategory`,
                                            )
                                          }
                                        />
                                      </Form.Item>
                                    </Col>
                                  )}
                                  <Col
                                    span={productType === 'Machine' ? 8 : 12}
                                  >
                                    <ProductSizeField
                                      fieldName={field.name}
                                      productType={productType}
                                      productCategory={productCategory}
                                      sizeOptions={sizeOptions}
                                      onNewSizeAdded={handleNewSizeAdded}
                                      disabled={isRepeatOrder}
                                      form={form}
                                      required={true}
                                    />
                                  </Col>
                                </Row>

                                {/* Roll Size */}
                                <Row gutter={12} style={{ marginTop: 4 }}>
                                  <Col span={24}>
                                    <RollSizeField
                                      fieldName={field.name}
                                      rollSizeOptions={rollSizeOptions}
                                      onNewRollSizeAdded={
                                        handleNewRollSizeAdded
                                      }
                                      disabled={isRepeatOrder}
                                      form={form}
                                      required={false}
                                    />
                                  </Col>
                                </Row>

                                {/* Bag Material / Quantity */}
                                <Row gutter={12} style={{ marginTop: 12 }}>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Bag Material"
                                      name={[field.name, 'BagMaterial']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Please select Bag Material.',
                                        },
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Bag Material"
                                        options={DROPDOWN_OPTIONS.bagMaterials}
                                        disabled={isRepeatOrder}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label={
                                        isRepeatOrder ? (
                                          <span>
                                            Quantity{' '}
                                            <Tag
                                              color="green"
                                              style={{ fontSize: 11 }}
                                            >
                                              ✏️ Editable
                                            </Tag>
                                          </span>
                                        ) : (
                                          'Quantity'
                                        )
                                      }
                                      name={[field.name, 'Quantity']}
                                      rules={[
                                        {
                                          required: true,
                                          message: 'Please enter Quantity.',
                                        },
                                      ]}
                                    >
                                      <Input
                                        placeholder="e.g., 1000"
                                        onInput={handleNumbersOnlyInput}
                                        onChange={() =>
                                          handleRateOrQuantityChange(
                                            `${idx}_Quantity`,
                                          )
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                {/* Sheet Information */}
                                <SubHeading>Sheet Information</SubHeading>
                                <Row gutter={12}>
                                  <Col span={12}>
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
                                        disabled={isRepeatOrder}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <OtherSelectField
                                      fieldName={field.name}
                                      selectFieldKey="SheetColor"
                                      customFieldKey="SheetColorCustom"
                                      label="Sheet Colour"
                                      options={DROPDOWN_OPTIONS.sheetColors}
                                      disabled={isRepeatOrder}
                                      form={form}
                                      required={true}
                                    />
                                  </Col>
                                </Row>

                                {/* Border Information (Stitching only) */}
                                {!isMachine && (
                                  <>
                                    <SubHeading>Border Information</SubHeading>
                                    <Row gutter={12}>
                                      <Col span={12}>
                                        <Form.Item
                                          label="Border GSM"
                                          name={[field.name, 'BorderGSM']}
                                          rules={[
                                            {
                                              required: true,
                                              message:
                                                'Please select Border GSM.',
                                            },
                                          ]}
                                        >
                                          <Select
                                            placeholder="Select Border GSM"
                                            options={
                                              DROPDOWN_OPTIONS.borderGSMs
                                            }
                                            disabled={isRepeatOrder}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col span={12}>
                                        <OtherSelectField
                                          fieldName={field.name}
                                          selectFieldKey="BorderColor"
                                          customFieldKey="BorderColorCustom"
                                          label="Border Colour"
                                          options={
                                            DROPDOWN_OPTIONS.borderColors
                                          }
                                          disabled={isRepeatOrder}
                                          form={form}
                                          required={true}
                                        />
                                      </Col>
                                    </Row>
                                  </>
                                )}

                                {/* Handle Information */}
                                <SubHeading>Handle Information</SubHeading>
                                <Row gutter={12}>
                                  <Col span={8}>
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
                                        disabled={isRepeatOrder}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <OtherSelectField
                                      fieldName={field.name}
                                      selectFieldKey="HandleColor"
                                      customFieldKey="HandleColorCustom"
                                      label="Handle Colour"
                                      options={DROPDOWN_OPTIONS.handleColors}
                                      disabled={isRepeatOrder}
                                      form={form}
                                      required={true}
                                    />
                                  </Col>
                                  <Col span={8}>
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
                                        disabled={isRepeatOrder}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                {/* Printing Information */}
                                <SubHeading>Printing Information</SubHeading>
                                <Row gutter={12}>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Printing Type"
                                      name={[field.name, 'PrintingType']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Please select Printing Type.',
                                        },
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Printing Type"
                                        options={DROPDOWN_OPTIONS.printingTypes}
                                        disabled={isRepeatOrder}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Print Colour"
                                      name={[field.name, 'PrintColor']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Please select Print Colour.',
                                        },
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Print Colour"
                                        options={DROPDOWN_OPTIONS.printColors}
                                        disabled={isRepeatOrder}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <OtherSelectField
                                      fieldName={field.name}
                                      selectFieldKey="Color"
                                      customFieldKey="ColorCustom"
                                      label="Colour"
                                      options={DROPDOWN_OPTIONS.colors}
                                      disabled={isRepeatOrder}
                                      form={form}
                                      required={true}
                                    />
                                  </Col>
                                </Row>

                                {/* Design Information */}
                                <SubHeading>Design Information</SubHeading>
                                <Row gutter={12}>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Design Type"
                                      name={[field.name, 'DesignType']}
                                    >
                                      <Radio.Group disabled={isRepeatOrder}>
                                        <Radio value="Old">Old Design</Radio>
                                        <Radio value="New">New Design</Radio>
                                      </Radio.Group>
                                    </Form.Item>
                                  </Col>
                                  <Col span={16}>
                                    <Form.Item
                                      label="Design Style"
                                      name={[field.name, 'DesignStyle']}
                                    >
                                      <Select
                                        placeholder="Select Design Style"
                                        options={DROPDOWN_OPTIONS.designStyles}
                                        disabled={isRepeatOrder}
                                        allowClear
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                {/* Plate Information */}
                                <SubHeading>Plate Information</SubHeading>
                                <Row gutter={12}>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Plate Type"
                                      name={[field.name, 'PlateType']}
                                    >
                                      <Radio.Group disabled={isRepeatOrder}>
                                        <Radio value="Old">Old Plate</Radio>
                                        <Radio value="New">New Plate</Radio>
                                      </Radio.Group>
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Number of Plate"
                                      name={[field.name, 'PlateBlockNumber']}
                                    >
                                      <Select
                                        placeholder="Select Number of Plate"
                                        options={
                                          DROPDOWN_OPTIONS.plateBlockNumbers
                                        }
                                        disabled={isRepeatOrder}
                                        allowClear
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Plate Rate (Optional)"
                                      name={[field.name, 'PlateRate']}
                                    >
                                      <Input
                                        placeholder="e.g., 500"
                                        disabled={isRepeatOrder}
                                        onInput={handleDecimalInput}
                                        prefix={
                                          <span
                                            style={{
                                              color: '#722ed1',
                                              fontWeight: 600,
                                            }}
                                          >
                                            ₹
                                          </span>
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                {/* Pricing */}
                                <SubHeading>Pricing</SubHeading>
                                <Row gutter={12}>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Rate"
                                      name={[field.name, 'Rate']}
                                      rules={[
                                        {
                                          required: true,
                                          message: 'Please enter Rate.',
                                        },
                                      ]}
                                    >
                                      <Input
                                        placeholder="e.g., 5.50"
                                        disabled={isRepeatOrder}
                                        onInput={handleDecimalInput}
                                        onChange={() =>
                                          handleRateOrQuantityChange(
                                            `${idx}_Rate`,
                                          )
                                        }
                                        prefix={
                                          <span
                                            style={{
                                              color: '#1677ff',
                                              fontWeight: 600,
                                            }}
                                          >
                                            ₹
                                          </span>
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label={
                                        isRepeatOrder ? (
                                          <span>
                                            Product Amount{' '}
                                            <Tag
                                              color="green"
                                              style={{ fontSize: 11 }}
                                            >
                                              ✏️ Auto
                                            </Tag>
                                          </span>
                                        ) : (
                                          'Product Amount'
                                        )
                                      }
                                      name={[field.name, 'ProductAmount']}
                                    >
                                      <Input
                                        placeholder="Auto-calculated"
                                        onInput={handleDecimalInput}
                                        onChange={() =>
                                          handleProductAmountChange(
                                            `${idx}_ProductAmount`,
                                          )
                                        }
                                        prefix={
                                          <span
                                            style={{
                                              color: '#52c41a',
                                              fontWeight: 600,
                                            }}
                                          >
                                            ₹
                                          </span>
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>
                            );
                          }}
                        </Form.Item>
                      ))
                    )}
                    {!isRepeatOrder && (
                      <Button
                        type="dashed"
                        onClick={() => add({ ...emptyProduct })}
                        block
                        icon={<PlusOutlined />}
                        style={{
                          borderRadius: 8,
                          marginBottom: 12,
                          borderColor: '#1677ff',
                          color: '#1677ff',
                          fontWeight: 600,
                        }}
                      >
                        + Add Product
                      </Button>
                    )}
                  </>
                )}
              </Form.List>
            </SectionBox>

            {/* ── Totals Section ── */}
            <div
              style={{
                background: 'linear-gradient(90deg, #f6ffed 0%, #fcffe6 100%)',
                border: '1px solid #b7eb8f',
                borderRadius: 10,
                padding: '16px 20px',
                marginTop: 8,
              }}
            >
              <Row gutter={16}>
                {/* Carting Field */}
                <Col span={12}>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#fa8c16',
                        }}
                      >
                        Carting
                      </span>
                    }
                    name="Carting"
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      size="large"
                      placeholder="0.00"
                      onInput={handleDecimalInput}
                      // ── CHANGED: recalc TotalAmount whenever Carting changes ──
                      onChange={recalcTotalAmount}
                      prefix={
                        <span
                          style={{
                            color: '#fa8c16',
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          ₹
                        </span>
                      }
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        borderRadius: 8,
                        borderColor: '#ffd591',
                      }}
                    />
                  </Form.Item>
                </Col>
                {/* Total Amount Field */}
                <Col span={12}>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#389e0d',
                        }}
                      >
                        Total Amount
                      </span>
                    }
                    name="TotalAmount"
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      size="large"
                      placeholder="Auto-calculated"
                      onInput={handleDecimalInput}
                      prefix={
                        <span
                          style={{
                            color: '#389e0d',
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          ₹
                        </span>
                      }
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        borderRadius: 8,
                        borderColor: '#b7eb8f',
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
