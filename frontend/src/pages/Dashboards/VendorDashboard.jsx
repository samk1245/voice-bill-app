import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice.js';
import { parseVoiceCommand } from '../../utils/nlpParser.js';
import {
  playScanBeep,
  playSuccessChime,
  playDeleteSound,
  playClickSound,
  speakVoice
} from '../../utils/audioFeedback.js';
import ThermalReceipt from '../../components/ThermalReceipt.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, FileText, 
  BarChart3, Settings, Mic, MicOff, Search, Plus, Trash2, 
  Edit3, Printer, Share2, Download, RefreshCw, CheckCircle2, 
  AlertTriangle, X, Check, ArrowRight, ArrowLeft, Sun, Moon, 
  Volume2, VolumeX, Shield, CreditCard, Landmark, DollarSign,
  TrendingUp, Phone, Mail, MapPin, Upload, ChevronDown, 
  ChevronRight, Filter, AlertCircle, Sparkles, Send, Copy
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function VendorDashboard() {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('voicebill_dark_mode') === 'true';
  });

  // Sound & Speech settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [talkbackEnabled, setTalkbackEnabled] = useState(true);

  // Active Navigation Tab: 'dashboard' | 'billing' | 'products' | 'customers' | 'bills' | 'reports' | 'settings'
  const [activeTab, setActiveTab] = useState('billing');

  // Stores & Shop Data
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(user?.role || 'Owner');

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Voice Billing States
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micPermission, setMicPermission] = useState('prompt'); // 'granted' | 'denied' | 'prompt'
  const recognitionRef = useRef(null);

  // Current Bill Form & Cart
  const [cartItems, setCartItems] = useState([]);
  const [cartCustomer, setCartCustomer] = useState(null); // { name, mobile, address, gstin }
  const [cartCustomerInput, setCartCustomerInput] = useState({ name: '', mobile: '', address: '', gstin: '' });
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [isInterState, setIsInterState] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // Fast Product Search & Add in Billing Screen
  const [billingProductSearch, setBillingProductSearch] = useState('');
  const [billingCategoryFilter, setBillingCategoryFilter] = useState('All');

  // Ambiguity / Clarification Modal
  const [clarifications, setClarifications] = useState([]);
  const [showClarificationModal, setShowClarificationModal] = useState(false);

  // Generated Invoice for Receipt Preview Modal
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // Product Inventory Page States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSortBy, setProductSortBy] = useState('name');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
    price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10, status: 'Active'
  });
  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false);
  const [stockAdjustItem, setStockAdjustItem] = useState(null);
  const [stockAdjustQty, setStockAdjustQty] = useState('');
  const [stockAdjustReason, setStockAdjustReason] = useState('Restock / Delivery');
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');

  // Customer Management States
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', mobile: '', email: '', address: '', gstin: '' });
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [showPayUdhaarModal, setShowPayUdhaarModal] = useState(false);
  const [payUdhaarCustomer, setPayUdhaarCustomer] = useState(null);
  const [payUdhaarAmount, setPayUdhaarAmount] = useState('');
  const [payUdhaarMode, setPayUdhaarMode] = useState('Cash');

  // Bills History States
  const [billSearch, setBillSearch] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('All');
  const [billPaymentMethodFilter, setBillPaymentMethodFilter] = useState('All');
  const [showSubsequentPayModal, setShowSubsequentPayModal] = useState(false);
  const [subsequentPayOrder, setSubsequentPayOrder] = useState(null);
  const [subsequentPayAmount, setSubsequentPayAmount] = useState('');
  const [subsequentPayMode, setSubsequentPayMode] = useState('Cash');

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('voicebill_dark_mode', String(next));
      return next;
    });
  };

  // 1. Initial Load: Stores
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStores();
  }, [user]);

  // 2. Fetch Store Data when Store changes
  useEffect(() => {
    if (selectedStore) {
      fetchAllStoreData(selectedStore._id);
    }
  }, [selectedStore]);

  // 3. Web Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedStore?.preferredLanguage === 'Hindi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        setLiveTranscript('');
        setMicPermission('granted');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setLiveTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          addToast('Microphone permission denied. Please enable mic access in your browser.', 'error');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setMicPermission('unsupported');
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [selectedStore]);

  // Handle Voice Recording End
  useEffect(() => {
    if (!isRecording && liveTranscript) {
      processVoiceCommand(liveTranscript);
      setLiveTranscript('');
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          if (soundEnabled) playClickSound();
        } catch (err) {
          console.warn('Speech start error:', err);
        }
      } else {
        addToast('Voice recognition is not supported in this browser. Please use the text input below.', 'info');
      }
    }
  };

  // Data Fetching Functions
  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores/my-stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0]);
      }
    } catch (err) {
      console.error('Fetch stores error:', err);
    }
  };

  const fetchAllStoreData = async (storeId) => {
    setLoading(true);
    try {
      const [prodsRes, custsRes, billsRes, analyticsRes] = await Promise.all([
        fetch(`/api/products/store/${storeId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/orders/customers/${storeId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/orders/store/${storeId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/orders/analytics/${storeId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (custsRes.ok) setCustomers(await custsRes.json());
      if (billsRes.ok) setBills(await billsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error('Fetch store data error:', err);
      addToast('Error loading store data. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // VOICE / TEXT BILLING PARSER DISPATCHER
  const processVoiceCommand = (commandText) => {
    if (!commandText || !commandText.trim()) return;

    setIsProcessingAI(true);
    setSpeechText(commandText);

    try {
      const parsed = parseVoiceCommand(commandText, products, customers);

      if (parsed.intent === 'action') {
        if (parsed.action === 'clear_cart') {
          handleClearCart();
          if (talkbackEnabled) speakVoice('Cart khali kar diya hai.');
        } else if (parsed.action === 'print_bill') {
          if (cartItems.length > 0) {
            handleFinalizeBill(true);
          } else if (bills.length > 0) {
            setReceiptInvoice(bills[0]);
          }
        } else if (parsed.action === 'confirm_bill') {
          handleFinalizeBill(false);
        } else if (parsed.action === 'show_total') {
          if (talkbackEnabled) speakVoice(`Total amount hai ${computedTotals.grandTotal} rupaye.`);
        }
        addToast(parsed.message, 'info');
      } else if (parsed.intent === 'apply_discount') {
        if (parsed.discountType === 'percentage') {
          const discountAmt = Math.round((computedTotals.subtotal * (parsed.value / 100)) * 100) / 100;
          setOverallDiscount(discountAmt);
        } else {
          setOverallDiscount(parsed.value);
        }
        if (soundEnabled) playClickSound();
        if (talkbackEnabled) speakVoice(`${parsed.value} rupaye discount laga diya gaya hai.`);
        addToast(parsed.message, 'success');
      } else if (parsed.intent === 'set_tax') {
        // Update tax rate across cart
        setCartItems(prev => prev.map(item => ({ ...item, taxRate: parsed.taxRate })));
        if (soundEnabled) playClickSound();
        if (talkbackEnabled) speakVoice(`${parsed.taxRate} percent GST apply kar diya.`);
        addToast(parsed.message, 'success');
      } else if (parsed.intent === 'remove_item') {
        handleRemoveCartItem(parsed.productId || parsed.productName);
        if (talkbackEnabled) speakVoice(`${parsed.productName} cart se hata diya hai.`);
        addToast(parsed.message, 'info');
      } else if (parsed.intent === 'update_quantity') {
        handleUpdateCartQty(parsed.productId || parsed.productName, parsed.newQuantity);
        if (talkbackEnabled) speakVoice(`Quantity badal kar ${parsed.newQuantity} kar di hai.`);
        addToast(parsed.message, 'success');
      } else if (parsed.intent === 'billing_items') {
        if (parsed.customer) {
          setCartCustomer(parsed.customer);
          setCartCustomerInput({
            name: parsed.customer.name,
            mobile: parsed.customer.mobile || '',
            address: parsed.customer.address || '',
            gstin: parsed.customer.gstin || ''
          });
        }

        if (parsed.items && parsed.items.length > 0) {
          parsed.items.forEach(addItemToCart);
          if (soundEnabled) playScanBeep();
        }

        if (parsed.clarifications && parsed.clarifications.length > 0) {
          setClarifications(parsed.clarifications);
          setShowClarificationModal(true);
        } else if (parsed.items && parsed.items.length > 0) {
          if (talkbackEnabled) {
            speakVoice(`${parsed.items.length} items bill mein add ho gaye.`);
          }
        }
        addToast(`Voice processed: ${parsed.items.length} item(s) detected.`, 'success');
      } else {
        addToast('Voice command not recognized. Try saying "Add 2 notebooks at 50 rupees each"', 'info');
      }
    } catch (err) {
      console.error('NLP Parse execution error:', err);
      addToast('Error processing voice command.', 'error');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // CART OPERATIONS
  const addItemToCart = (productToAdd) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        (item.productId && item.productId === productToAdd.productId) || 
        item.name.toLowerCase() === productToAdd.name.toLowerCase()
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const existing = copy[existingIndex];
        const updatedQty = existing.quantity + (productToAdd.quantity || 1);
        copy[existingIndex] = {
          ...existing,
          quantity: updatedQty,
          price: productToAdd.price !== undefined ? productToAdd.price : existing.price,
          lineTotal: Math.round(((existing.price * updatedQty) - (existing.discount || 0)) * 100) / 100
        };
        return copy;
      } else {
        const qty = productToAdd.quantity || 1;
        const price = Number(productToAdd.price || 0);
        const discount = Number(productToAdd.discount || 0);
        const taxRate = Number(productToAdd.taxRate !== undefined ? productToAdd.taxRate : 5);
        const taxable = Math.max(0, (price * qty) - discount);
        const taxAmount = Math.round((taxable * (taxRate / 100)) * 100) / 100;
        const lineTotal = Math.round((taxable + taxAmount) * 100) / 100;

        return [...prev, {
          productId: productToAdd.productId || productToAdd._id,
          sku: productToAdd.sku || 'SKU-000',
          name: productToAdd.name,
          price,
          quantity: qty,
          unit: productToAdd.unit || 'pcs',
          discount,
          taxRate,
          taxAmount,
          lineTotal,
          stock: productToAdd.stock
        }];
      }
    });
  };

  const handleUpdateCartQty = (identifier, newQty) => {
    const qty = Math.max(1, Number(newQty) || 1);
    setCartItems(prev => prev.map(item => {
      if (item.productId === identifier || item.name.toLowerCase() === String(identifier).toLowerCase()) {
        const taxable = Math.max(0, (item.price * qty) - (item.discount || 0));
        const taxAmount = Math.round((taxable * ((item.taxRate || 5) / 100)) * 100) / 100;
        return {
          ...item,
          quantity: qty,
          taxAmount,
          lineTotal: Math.round((taxable + taxAmount) * 100) / 100
        };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (identifier) => {
    setCartItems(prev => prev.filter(item => 
      item.productId !== identifier && item.name.toLowerCase() !== String(identifier).toLowerCase()
    ));
    if (soundEnabled) playDeleteSound();
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartCustomer(null);
    setCartCustomerInput({ name: '', mobile: '', address: '', gstin: '' });
    setOverallDiscount(0);
    setAmountPaid('');
    setCashReceived('');
    setBillNotes('');
    if (soundEnabled) playDeleteSound();
  };

  // REAL-TIME TOTALS CALCULATION
  const computedTotals = React.useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    cartItems.forEach(item => {
      const lineSubtotal = Math.round((item.price * item.quantity) * 100) / 100;
      const taxable = Math.max(0, lineSubtotal - (item.discount || 0));
      const lineTax = Math.round((taxable * ((item.taxRate || 0) / 100)) * 100) / 100;
      subtotal += lineSubtotal;
      totalTax += lineTax;
    });

    subtotal = Math.round(subtotal * 100) / 100;
    totalTax = Math.round(totalTax * 100) / 100;

    const discount = Math.round(Number(overallDiscount || 0) * 100) / 100;
    const grandTotal = Math.round(Math.max(0, subtotal - discount + totalTax) * 100) / 100;

    let paid = amountPaid !== '' ? Number(amountPaid) : null;
    if (paid === null) {
      paid = paymentMethod === 'Credit/Udhaar' ? 0 : grandTotal;
    }
    paid = Math.round(Math.max(0, paid) * 100) / 100;
    const balanceDue = Math.round(Math.max(0, grandTotal - paid) * 100) / 100;

    const cashRec = cashReceived !== '' ? Number(cashReceived) : paid;
    const changeReturn = Math.round(Math.max(0, cashRec - grandTotal) * 100) / 100;

    const taxBreakdown = isInterState
      ? { cgst: 0, sgst: 0, igst: totalTax }
      : { cgst: Math.round((totalTax / 2) * 100) / 100, sgst: Math.round((totalTax / 2) * 100) / 100, igst: 0 };

    return {
      subtotal,
      discount,
      totalTax,
      grandTotal,
      paid,
      balanceDue,
      changeReturn,
      taxBreakdown
    };
  }, [cartItems, overallDiscount, amountPaid, paymentMethod, cashReceived, isInterState]);

  // FINALIZE & SAVE BILL
  const handleFinalizeBill = async (autoPrint = false) => {
    if (cartItems.length === 0) {
      addToast('Cannot generate bill: Cart is empty. Please add items.', 'error');
      return;
    }

    if (computedTotals.balanceDue > 0 && !cartCustomerInput.name.trim()) {
      addToast('Customer Name is required when there is an unpaid balance or Udhaar.', 'error');
      return;
    }

    setIsSubmittingBill(true);
    try {
      const payload = {
        storeId: selectedStore._id,
        customerName: cartCustomerInput.name || 'Walk-in Cash Customer',
        customerMobile: cartCustomerInput.mobile || '',
        customerAddress: cartCustomerInput.address || '',
        customerGstin: cartCustomerInput.gstin || '',
        items: cartItems,
        overallDiscount: computedTotals.discount,
        paymentMethod,
        amountPaid: computedTotals.paid,
        cashReceived: cashReceived ? Number(cashReceived) : computedTotals.paid,
        changeReturn: computedTotals.changeReturn,
        isInterState,
        notes: billNotes
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create invoice.');
      }

      if (soundEnabled) playSuccessChime();
      if (talkbackEnabled) speakVoice(`Bill generate ho gaya. Total amount ${data.totalAmount} rupaye.`);

      addToast(`Invoice #${data.invoiceNumber} created successfully!`, 'success');
      setReceiptInvoice(data);

      // Refresh store data & reset cart
      handleClearCart();
      fetchAllStoreData(selectedStore._id);

      if (autoPrint) {
        setTimeout(() => window.print(), 600);
      }
    } catch (err) {
      console.error('Invoice finalize error:', err);
      addToast(err.message || 'Error creating bill.', 'error');
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // PRODUCT CRUD OPERATIONS
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      addToast('Product name and selling price are required.', 'error');
      return;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products/add';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          storeId: selectedStore._id
        })
      });

      if (res.ok) {
        addToast(editingProduct ? 'Product updated successfully.' : 'Product added to inventory.', 'success');
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({
          name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
          price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10, status: 'Active'
        });
        fetchAllStoreData(selectedStore._id);
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to save product.', 'error');
      }
    } catch (err) {
      console.error('Save product error:', err);
      addToast('Network error saving product.', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Product deleted.', 'info');
        fetchAllStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleAdjustStock = async () => {
    if (!stockAdjustItem || !stockAdjustQty) return;
    try {
      const res = await fetch('/api/products/adjust-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: stockAdjustItem._id,
          changeQuantity: Number(stockAdjustQty),
          reason: stockAdjustReason
        })
      });

      if (res.ok) {
        addToast('Stock adjusted successfully.', 'success');
        setShowStockAdjustModal(false);
        setStockAdjustQty('');
        fetchAllStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error('Stock adjustment error:', err);
      addToast('Error adjusting stock.', 'error');
    }
  };

  const handleBulkImportCsv = async () => {
    if (!bulkCsvText.trim()) return;
    try {
      // Parse CSV rows
      const lines = bulkCsvText.trim().split('\n');
      const parsedProducts = [];

      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('name')) return; // skip header
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols[0] && cols[4]) {
          parsedProducts.push({
            name: cols[0],
            sku: cols[1] || '',
            barcode: cols[2] || '',
            category: cols[3] || 'General',
            price: Number(cols[4] || 0),
            unit: cols[5] || 'piece',
            stock: Number(cols[6] || 0),
            taxRate: Number(cols[7] || 5)
          });
        }
      });

      if (parsedProducts.length === 0) {
        addToast('No valid rows found in CSV. Format: Name, SKU, Barcode, Category, Price, Unit, Stock, TaxRate', 'error');
        return;
      }

      const res = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: selectedStore._id,
          products: parsedProducts
        })
      });

      if (res.ok) {
        const data = await res.json();
        addToast(`Imported ${data.count} products successfully.`, 'success');
        setShowBulkImportModal(false);
        setBulkCsvText('');
        fetchAllStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error('Bulk import error:', err);
      addToast('Failed to import products.', 'error');
    }
  };

  // CUSTOMER CRUD & UDHAAR PAYMENT
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;
    try {
      const res = await fetch('/api/orders/customer/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: selectedStore._id,
          ...newCustomerForm
        })
      });

      if (res.ok) {
        addToast('Customer added successfully.', 'success');
        setShowAddCustomerModal(false);
        setNewCustomerForm({ name: '', mobile: '', email: '', address: '', gstin: '' });
        fetchAllStoreData(selectedStore._id);
      } else {
        const data = await res.json();
        addToast(data.message || 'Error adding customer.', 'error');
      }
    } catch (err) {
      console.error('Add customer error:', err);
    }
  };

  const handlePayUdhaar = async () => {
    if (!payUdhaarCustomer || !payUdhaarAmount) return;
    try {
      const res = await fetch('/api/orders/pay-udhaar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: selectedStore._id,
          customerId: payUdhaarCustomer._id,
          amount: Number(payUdhaarAmount),
          paymentMode: payUdhaarMode
        })
      });

      if (res.ok) {
        addToast(`Payment of ₹${payUdhaarAmount} recorded for ${payUdhaarCustomer.name}.`, 'success');
        setShowPayUdhaarModal(false);
        setPayUdhaarAmount('');
        fetchAllStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error('Pay Udhaar error:', err);
      addToast('Error recording payment.', 'error');
    }
  };

  // BILL RECORD SUBSEQUENT PAYMENT
  const handleRecordSubsequentPay = async () => {
    if (!subsequentPayOrder || !subsequentPayAmount) return;
    try {
      const res = await fetch(`/api/orders/${subsequentPayOrder._id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(subsequentPayAmount),
          paymentMethod: subsequentPayMode
        })
      });

      if (res.ok) {
        addToast('Invoice payment recorded successfully.', 'success');
        setShowSubsequentPayModal(false);
        setSubsequentPayAmount('');
        fetchAllStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error('Subsequent payment error:', err);
      addToast('Error recording payment.', 'error');
    }
  };

  // CANCEL / REFUND INVOICE
  const handleCancelInvoice = async (orderId) => {
    const reason = window.prompt('Please enter cancellation reason (stock will be restored):');
    if (!reason) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled', reason })
      });

      if (res.ok) {
        addToast('Invoice cancelled and product inventory restored.', 'info');
        fetchAllStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    }
  };

  // Categories list for shelf & filter
  const productCategories = ['All', ...new Set(products.map(p => p.category || 'General'))];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* 1. TOP GLOBAL APP HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Store Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              VB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight leading-none text-slate-900 dark:text-white">
                  VoiceBill AI
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                  Smart POS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stores.length > 1 ? (
                  <select
                    value={selectedStore?._id || ''}
                    onChange={(e) => setSelectedStore(stores.find(s => s._id === e.target.value))}
                    className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {stores.map(s => <option key={s._id} value={s._id} className="dark:bg-slate-900">{s.name}</option>)}
                  </select>
                ) : (
                  <span>{selectedStore?.name || 'Local Store'}</span>
                )}
                <span>•</span>
                <span className="capitalize text-slate-400">{activeRole}</span>
              </div>
            </div>
          </div>

          {/* Quick Controls: Mute, Dark Mode, Role, User Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={soundEnabled ? 'Mute Audio Chimes' : 'Unmute Audio Chimes'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Role Switcher Pill */}
            <div className="hidden md:flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800/60 text-xs">
              <button
                onClick={() => setActiveRole('Owner')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${activeRole === 'Owner' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
              >
                Owner
              </button>
              <button
                onClick={() => setActiveRole('Cashier')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${activeRole === 'Cashier' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
              >
                Cashier
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN NAVIGATION TABS */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'billing'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>Voice & New Bill</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'products'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'customers'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Customers & Udhaar</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'bills'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Bill History ({bills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'reports'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Reports & GST</span>
          </button>
        </div>
      </nav>

      {/* 3. CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* =========================================================================
            TAB 1: VOICE & NEW BILL SCREEN
        ========================================================================= */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Left 7 Cols: Voice Engine, Search Shelf & Fast Touch Catalog */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Prominent Voice Assistant Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 dark:text-white">AI Voice Billing Engine</h2>
                      <p className="text-xs text-slate-500">Speak naturally in Hindi, English, or Hinglish</p>
                    </div>
                  </div>

                  {/* Mic Status Badge */}
                  <div className="flex items-center gap-2 text-xs">
                    {isRecording ? (
                      <span className="flex items-center gap-1.5 text-red-600 font-semibold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        Listening...
                      </span>
                    ) : (
                      <span className="text-slate-400">Ready</span>
                    )}
                  </div>
                </div>

                {/* Big Center Microphone Control */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <button
                    onClick={toggleRecording}
                    className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-md ${
                      isRecording
                        ? 'bg-red-500 text-white shadow-red-500/40 scale-105 animate-pulse-subtle'
                        : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>

                  <div className="flex-1 text-center sm:text-left">
                    {isRecording ? (
                      <div>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">Transcribing live speech...</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 italic mt-0.5">
                          "{liveTranscript || 'Listening to your voice...'}"
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tap mic to speak bill</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Try: <span className="font-medium text-slate-700 dark:text-slate-300">"Add two notebooks at 50 rupees each and five pens at 10 rupees"</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Text Input Alternative */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder='Or type billing command, e.g. "2 kilo chawal, ek Maggi"'
                      value={speechText}
                      onChange={(e) => setSpeechText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          processVoiceCommand(speechText);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition"
                    />
                  </div>
                  <button
                    onClick={() => processVoiceCommand(speechText)}
                    disabled={!speechText.trim() || isProcessingAI}
                    className="px-4 py-2.5 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl disabled:opacity-50 transition shadow-sm"
                  >
                    Process
                  </button>
                </div>
              </div>

              {/* Fast Touch Shelf & Category Filter */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search product by name, SKU, or scan barcode..."
                      value={billingProductSearch}
                      onChange={(e) => setBillingProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {productCategories.slice(0, 5).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setBillingCategoryFilter(cat)}
                        className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                          billingCategoryFilter === cat
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Grid (One-tap add to current bill) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                  {products
                    .filter(p => {
                      const matchSearch = (p.name || '').toLowerCase().includes(billingProductSearch.toLowerCase()) ||
                                          (p.sku || '').toLowerCase().includes(billingProductSearch.toLowerCase()) ||
                                          (p.barcode || '').includes(billingProductSearch);
                      const matchCat = billingCategoryFilter === 'All' || p.category === billingCategoryFilter;
                      return matchSearch && matchCat;
                    })
                    .map(product => (
                      <button
                        key={product._id}
                        onClick={() => {
                          addItemToCart(product);
                          if (soundEnabled) playScanBeep();
                        }}
                        className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col justify-between group shadow-xs"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            SKU: {product.sku || 'N/A'} • {product.unit || 'pcs'}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            ₹{product.price}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            product.stock <= (product.lowStockAlertLimit || 10)
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {product.stock} {product.unit}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Register Tape & Current Bill Cart */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                
                {/* Cart Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Current Bill</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                      {cartItems.reduce((sum, i) => sum + i.quantity, 0)} items
                    </span>
                  </div>

                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-xs text-slate-400 hover:text-red-600 transition"
                      title="Clear Cart"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Customer Details Strip */}
                <div className="py-3 border-b border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">Customer Details</span>
                    {customers.length > 0 && (
                      <select
                        onChange={(e) => {
                          const c = customers.find(cust => cust._id === e.target.value);
                          if (c) {
                            setCartCustomer(c);
                            setCartCustomerInput({ name: c.name, mobile: c.mobile || '', address: c.address || '', gstin: c.gstin || '' });
                          }
                        }}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="">Select Existing...</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.mobile || 'No Phone'})</option>)}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={cartCustomerInput.name}
                      onChange={(e) => setCartCustomerInput(prev => ({ ...prev, name: e.target.value }))}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Phone / WhatsApp"
                      value={cartCustomerInput.mobile}
                      onChange={(e) => setCartCustomerInput(prev => ({ ...prev, mobile: e.target.value }))}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="py-3 space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 stroke-1 opacity-40" />
                      <div>Your bill is currently empty.</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Use mic or tap products to add items.</div>
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="flex-1 pr-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</div>
                          <div className="text-[10px] text-slate-500">
                            ₹{item.price}/{item.unit} • Tax {item.taxRate || 5}%
                          </div>
                        </div>

                        {/* Qty +/- Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateCartQty(item.productId || item.name, item.quantity - 1)}
                            className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-slate-800 dark:text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateCartQty(item.productId || item.name, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total & Remove */}
                        <div className="text-right pl-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            ₹{item.lineTotal.toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveCartItem(item.productId || item.name)}
                            className="text-[10px] text-red-500 hover:text-red-700 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Calculation Tape */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">₹{computedTotals.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(e.target.value)}
                      className="w-20 px-2 py-0.5 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between">
                    <span>Total GST/Tax:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">₹{computedTotals.totalTax.toFixed(2)}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">₹{computedTotals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selector & Cash Presets */}
                <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {['Cash', 'UPI', 'Card', 'Credit/Udhaar'].map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 rounded-lg font-medium text-center transition ${
                          paymentMethod === method
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {method === 'Credit/Udhaar' ? 'Udhaar' : method}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Cash' && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400">Quick Cash:</span>
                      {[100, 200, 500].map(cashVal => (
                        <button
                          key={cashVal}
                          onClick={() => setCashReceived(cashVal)}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold hover:bg-slate-200"
                        >
                          +₹{cashVal}
                        </button>
                      ))}
                      <button
                        onClick={() => setCashReceived(computedTotals.grandTotal)}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold hover:bg-slate-200"
                      >
                        Exact
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'Cash' && cashReceived !== '' && (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-500">Change to return:</span>
                      <span className="font-bold text-emerald-600">₹{computedTotals.changeReturn.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Finalize Button */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => handleFinalizeBill(false)}
                    disabled={cartItems.length === 0 || isSubmittingBill}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmittingBill ? 'Processing Invoice...' : `Save & Finalize Bill (₹${computedTotals.grandTotal.toFixed(2)})`}
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: PROFESSIONAL ANALYTICS DASHBOARD
        ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Sales</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ₹{analytics?.todaySales?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">Real-time updated</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sales (Month)</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ₹{analytics?.monthSales?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{analytics?.totalBills || 0} bills generated</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Outstanding Udhaar</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                  ₹{analytics?.outstandingUdhaar?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Pending customer credit</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Alert</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
                  {analytics?.lowStockCount || 0} Items
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Need immediate restock</div>
              </div>
            </div>

            {/* Sales Trends Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sales Performance Trend</h3>
                    <p className="text-xs text-slate-500">Revenue per day over recent transactions</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {analytics?.salesTrends && analytics.salesTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.salesTrends}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                            borderColor: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '0.75rem',
                            fontSize: '12px'
                          }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No sales recorded in the selected period.
                    </div>
                  )}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top Sold Products</h3>
                <div className="space-y-3">
                  {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.quantity} {p.unit} sold</div>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          ₹{p.revenue.toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">No product sales yet.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Recent Bills Quick Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Bills</h3>
                <button
                  onClick={() => setActiveTab('bills')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All Bills &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {bills.slice(0, 5).map(b => (
                      <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{b.invoiceNumber}</td>
                        <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{b.customerName || 'Walk-in'}</td>
                        <td className="py-3 px-3 text-slate-500">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">₹{b.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{b.paymentMethod}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : b.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {b.paymentStatus || 'Paid'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setReceiptInvoice(b)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 3: PRODUCTS & INVENTORY MANAGEMENT
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product by name, SKU, barcode..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={`/api/products/export-csv/${selectedStore._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </a>

                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Bulk Import
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
                      price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10, status: 'Active'
                    });
                    setShowProductModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm transition"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/70 dark:bg-slate-800/40">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-3">SKU / Code</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Selling Price</th>
                      <th className="py-3 px-3 text-right">Cost</th>
                      <th className="py-3 px-3 text-right">Tax (%)</th>
                      <th className="py-3 px-3 text-center">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {products
                      .filter(p => {
                        const matchQ = (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                                       (p.sku || '').toLowerCase().includes(productSearch.toLowerCase());
                        const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
                        return matchQ && matchCat;
                      })
                      .map(p => {
                        const isLow = p.stock <= (p.lowStockAlertLimit || 10);
                        const isOut = p.stock === 0;

                        return (
                          <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                              {p.barcode && <div className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</div>}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{p.sku || 'N/A'}</td>
                            <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{p.category || 'General'}</td>
                            <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">₹{Number(p.price).toFixed(2)}</td>
                            <td className="py-3.5 px-3 text-right text-slate-500">₹{Number(p.costPrice || 0).toFixed(2)}</td>
                            <td className="py-3.5 px-3 text-right text-slate-600">{p.taxRate || 0}%</td>
                            <td className="py-3.5 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isOut
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              }`}>
                                {p.stock} {p.unit || 'pcs'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setStockAdjustItem(p);
                                  setShowStockAdjustModal(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded transition"
                                title="Adjust Stock"
                              >
                                Stock ±
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductForm({
                                    name: p.name,
                                    sku: p.sku || '',
                                    barcode: p.barcode || '',
                                    category: p.category || 'General',
                                    unit: p.unit || 'piece',
                                    price: p.price,
                                    costPrice: p.costPrice || '',
                                    taxRate: p.taxRate !== undefined ? p.taxRate : 5,
                                    stock: p.stock,
                                    lowStockAlertLimit: p.lowStockAlertLimit || 10,
                                    status: p.status || 'Active'
                                  });
                                  setShowProductModal(true);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 transition"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 4: CUSTOMERS & UDHAAR LEDGER MANAGEMENT
        ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </button>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customers
                .filter(c => (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || (c.mobile || '').includes(customerSearch))
                .map(customer => {
                  const hasCredit = (customer.pendingCredit || 0) > 0;
                  const reminderMsg = encodeURIComponent(
                    `Namaste ${customer.name} ji, aapke ${selectedStore?.name || 'kirana'} account mein ₹${customer.pendingCredit} ka udhaar bacha hua hai. Kripya online ya dukan par aakar pay kar dijiye. Dhanyawad!`
                  );

                  return (
                    <div
                      key={customer._id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{customer.name}</h4>
                            <div className="text-xs text-slate-500 mt-0.5">{customer.mobile || 'No Phone Number'}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hasCredit
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}>
                            {hasCredit ? `Udhaar: ₹${customer.pendingCredit}` : 'Clear'}
                          </span>
                        </div>

                        {customer.address && (
                          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                            {customer.address}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedLedgerCustomer(customer)}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View Ledger ({customer.ledger?.length || 0})
                        </button>

                        <div className="flex items-center gap-1.5">
                          {hasCredit && (
                            <>
                              <a
                                href={`https://wa.me/${(customer.mobile || '').replace(/\D/g, '')}?text=${reminderMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                                title="WhatsApp Payment Reminder"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  setPayUdhaarCustomer(customer);
                                  setPayUdhaarAmount(customer.pendingCredit);
                                  setShowPayUdhaarModal(true);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded-lg font-medium text-[11px] hover:bg-blue-700 transition"
                              >
                                Record Pay
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 5: BILL HISTORY & REPRINTS
        ========================================================================= */}
        {activeTab === 'bills' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Filters Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search invoice #, customer, product..."
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <select
                  value={billStatusFilter}
                  onChange={(e) => setBillStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <a
                href={`/api/orders/export-csv/${selectedStore._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl transition"
              >
                <Download className="h-3.5 w-3.5" />
                Export Bills CSV
              </a>
            </div>

            {/* Invoices List Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/70 dark:bg-slate-800/40">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3 text-right">Grand Total</th>
                      <th className="py-3 px-3 text-right">Paid</th>
                      <th className="py-3 px-3 text-right">Balance Due</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bills
                      .filter(b => {
                        const matchQ = (b.invoiceNumber || '').toLowerCase().includes(billSearch.toLowerCase()) ||
                                       (b.customerName || '').toLowerCase().includes(billSearch.toLowerCase()) ||
                                       (b.customerMobile || '').includes(billSearch);
                        const matchStatus = billStatusFilter === 'All' || b.paymentStatus === billStatusFilter;
                        return matchQ && matchStatus;
                      })
                      .map(order => (
                        <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {order.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-3 text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {order.customerName || 'Walk-in Customer'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{Number(order.totalAmount).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-right text-emerald-600 font-medium">
                            ₹{Number(order.amountPaid !== undefined ? order.amountPaid : order.totalAmount).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-medium text-red-600">
                            ₹{Number(order.balanceDue || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">{order.paymentMethod}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : order.paymentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {order.paymentStatus || 'Paid'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setReceiptInvoice(order)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded transition"
                            >
                              Receipt
                            </button>
                            {order.balanceDue > 0 && (
                              <button
                                onClick={() => {
                                  setSubsequentPayOrder(order);
                                  setSubsequentPayAmount(order.balanceDue);
                                  setShowSubsequentPayModal(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 rounded transition"
                              >
                                Record Pay
                              </button>
                            )}
                            {order.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelInvoice(order._id)}
                                className="px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 6: REPORTS & GST ANALYTICS
        ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GST Collection Summary</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{analytics?.taxSummary?.totalTax?.toFixed(2) || '0.00'}
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>CGST (Central):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{analytics?.taxSummary?.cgst?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (State):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{analytics?.taxSummary?.sgst?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGST (Inter-state):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{analytics?.taxSummary?.igst?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Breakdown</div>
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between">
                    <span>Paid Invoices:</span>
                    <span className="font-bold text-emerald-600">{analytics?.paidBillsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partially Paid:</span>
                    <span className="font-bold text-amber-600">{analytics?.partialBillsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unpaid Bills:</span>
                    <span className="font-bold text-red-600">{analytics?.unpaidBillsCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accounting Export</div>
                  <p className="text-xs text-slate-500 mt-1">Download CSV audit reports compatible with Tally & Excel.</p>
                </div>

                <div className="space-y-2 pt-4">
                  <a
                    href={`/api/orders/export-csv/${selectedStore._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    <Download className="h-4 w-4" /> Download Sales CSV
                  </a>
                  <a
                    href={`/api/products/export-csv/${selectedStore._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    <Download className="h-4 w-4" /> Download Inventory CSV
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODALS & OVERLAYS
      ========================================================================= */}

      {/* 1. RECEIPT PREVIEW MODAL */}
      {receiptInvoice && (
        <ThermalReceipt
          invoice={receiptInvoice}
          store={selectedStore}
          onClose={() => setReceiptInvoice(null)}
          onNewBill={() => {
            setReceiptInvoice(null);
            setActiveTab('billing');
            handleClearCart();
          }}
        />
      )}

      {/* 2. AMBIGUITY / CLARIFICATION MODAL */}
      {showClarificationModal && clarifications.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Confirm Voice Item
              </h3>
              <button onClick={() => setShowClarificationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {clarifications.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    You said: <span className="text-blue-600">"{item.term}"</span> ({item.quantity} {item.unit})
                  </div>

                  {item.options ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-slate-500 text-[11px]">Which variant did you mean?</div>
                      {item.options.map(opt => (
                        <button
                          key={opt._id}
                          onClick={() => {
                            addItemToCart({ ...opt, quantity: item.quantity });
                            setShowClarificationModal(false);
                            if (soundEnabled) playScanBeep();
                            addToast(`Added ${opt.name} to bill.`, 'success');
                          }}
                          className="w-full p-2 text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 flex justify-between items-center transition"
                        >
                          <span className="font-medium text-slate-900 dark:text-white">{opt.name}</span>
                          <span className="font-bold text-blue-600">₹{opt.price}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="text-slate-500 text-[11px]">Item not in catalog. Enter price to add:</div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Price in ₹"
                          defaultValue={item.suggestedPrice || ''}
                          id={`custom-price-${idx}`}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                        <button
                          onClick={() => {
                            const val = document.getElementById(`custom-price-${idx}`).value;
                            if (val && Number(val) > 0) {
                              addItemToCart({
                                name: item.term,
                                price: Number(val),
                                quantity: item.quantity,
                                unit: item.unit
                              });
                              setShowClarificationModal(false);
                              if (soundEnabled) playScanBeep();
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs"
                        >
                          Add to Bill
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice 1kg"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={productForm.sku}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. 890103001001"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Grains, Snacks"
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Grams)</option>
                    <option value="packet">packet (Packet)</option>
                    <option value="piece">piece (Piece)</option>
                    <option value="bottle">bottle (Bottle)</option>
                    <option value="strip">strip (Medicine Strip)</option>
                    <option value="litre">litre (Litre)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="60"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="48"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, costPrice: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Tax (%)</label>
                  <select
                    value={productForm.taxRate}
                    onChange={(e) => setProductForm(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% (Grains / Food)</option>
                    <option value="12">12% (Packaged / Stationery)</option>
                    <option value="18">18% (Standard Retail)</option>
                    <option value="28">28% (Beverages / Luxury)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Low Stock Alert Limit</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={productForm.lowStockAlertLimit}
                    onChange={(e) => setProductForm(prev => ({ ...prev, lowStockAlertLimit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. STOCK ADJUST MODAL */}
      {showStockAdjustModal && stockAdjustItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Adjust Stock: {stockAdjustItem.name}
            </h3>
            <p className="text-xs text-slate-500">Current Stock: <span className="font-bold text-slate-800 dark:text-slate-200">{stockAdjustItem.stock} {stockAdjustItem.unit}</span></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Quantity Change (e.g. +20 for restock, -5 for damage)</label>
                <input
                  type="number"
                  placeholder="+25"
                  value={stockAdjustQty}
                  onChange={(e) => setStockAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reason for Audit Log</label>
                <select
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Restock / Delivery">Restock / Delivery</option>
                  <option value="Physical Audit Discrepancy">Physical Audit Discrepancy</option>
                  <option value="Damaged / Expired Goods">Damaged / Expired Goods</option>
                  <option value="Return to Supplier">Return to Supplier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowStockAdjustModal(false)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. BULK CSV IMPORT MODAL */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bulk CSV Product Import</h3>
            <p className="text-xs text-slate-500">Paste CSV data below. Column format: <br/><code className="text-blue-600">Name, SKU, Barcode, Category, Price, Unit, Stock, TaxRate</code></p>

            <textarea
              rows={6}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              placeholder="Basmati Rice, GRA-01, 890100, Grains, 60, kg, 100, 5&#10;Sugar, GRA-02, 890101, Grains, 40, kg, 50, 5"
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowBulkImportModal(false)}
                className="px-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImportCsv}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Import Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mobile Phone (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={newCustomerForm.mobile}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, mobile: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street / Flat / Colony"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Customer GSTIN (Optional)</label>
                <input
                  type="text"
                  placeholder="07AAAAA0000A1Z5"
                  value={newCustomerForm.gstin}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, gstin: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CUSTOMER LEDGER MODAL */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Customer Ledger: {selectedLedgerCustomer.name}
                </h3>
                <div className="text-xs text-slate-500">
                  Total Outstanding Udhaar: <span className="font-bold text-red-600">₹{selectedLedgerCustomer.pendingCredit || 0}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLedgerCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {(selectedLedgerCustomer.ledger || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400">No ledger transactions recorded.</div>
              ) : (
                selectedLedgerCustomer.ledger.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex justify-between items-center ${
                      entry.type === 'credit'
                        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{entry.description}</div>
                      <div className="text-[10px] text-slate-400">{new Date(entry.date).toLocaleString('en-IN')}</div>
                    </div>
                    <div className={`font-bold text-sm ${entry.type === 'credit' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {entry.type === 'credit' ? `+₹${entry.amount}` : `-₹${entry.amount}`}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedLedgerCustomer(null)}
                className="px-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RECORD UDHAAR PAYMENT MODAL */}
      {showPayUdhaarModal && payUdhaarCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Record Udhaar Payment: {payUdhaarCustomer.name}
            </h3>
            <p className="text-xs text-slate-500">Current Pending: <span className="font-bold text-red-600">₹{payUdhaarCustomer.pendingCredit}</span></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={payUdhaarAmount}
                  onChange={(e) => setPayUdhaarAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Mode</label>
                <select
                  value={payUdhaarMode}
                  onChange={(e) => setPayUdhaarMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPayUdhaarModal(false)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePayUdhaar}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. RECORD SUBSEQUENT INVOICE PAYMENT MODAL */}
      {showSubsequentPayModal && subsequentPayOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Pay Balance: Invoice #{subsequentPayOrder.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500">Balance Due: <span className="font-bold text-red-600">₹{subsequentPayOrder.balanceDue}</span></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={subsequentPayAmount}
                  onChange={(e) => setSubsequentPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Method</label>
                <select
                  value={subsequentPayMode}
                  onChange={(e) => setSubsequentPayMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSubsequentPayModal(false)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordSubsequentPay}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 animate-fade-in ${
              toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-800'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
