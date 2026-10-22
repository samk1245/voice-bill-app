import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import Sidebar from '../../components/Sidebar.jsx';
import TopNav from '../../components/TopNav.jsx';
import TemplateSelectorModal from '../../components/TemplateSelectorModal.jsx';
import HelpShortcutsModal from '../../components/HelpShortcutsModal.jsx';
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
  ChevronRight, Filter, AlertCircle, Sparkles, Send, Copy,
  QrCode, Zap, ShoppingBag, Truck, FileCheck, HelpCircle,
  Clock, Calendar, Award, Layers, Tag, Sliders, ArrowUpRight,
  Receipt, Wallet, CheckSquare, RefreshCcw, Wifi, WifiOff
} from 'lucide-react';

const CHART_COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export default function VendorDashboard() {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Layout & Theme States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('voicebill_dark_mode') === 'true';
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Active Navigation Tab: 15 sections
  const [activeTab, setActiveTab] = useState('billing');

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Audio & Talkback
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [talkbackEnabled, setTalkbackEnabled] = useState(true);

  // Global Search
  const [globalSearch, setGlobalSearch] = useState('');

  // Stores & Shop Data
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(user?.role || 'Owner');

  // Toast Notifications
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
  const [micPermission, setMicPermission] = useState('prompt');
  const recognitionRef = useRef(null);

  // Current Bill Form & Cart
  const [cartItems, setCartItems] = useState([]);
  const [cartCustomer, setCartCustomer] = useState(null);
  const [cartCustomerInput, setCartCustomerInput] = useState({ name: '', mobile: '', address: '', gstin: '' });
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [isInterState, setIsInterState] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // Billing Shelf Filters
  const [billingProductSearch, setBillingProductSearch] = useState('');
  const [billingCategoryFilter, setBillingCategoryFilter] = useState('All');

  // POS Grid Mode
  const [posCategoryFilter, setPosCategoryFilter] = useState('All');
  const [posSearch, setPosSearch] = useState('');

  // Barcode & Ambiguity Modals
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [clarifications, setClarifications] = useState([]);
  const [showClarificationModal, setShowClarificationModal] = useState(false);

  // Generated Invoice for Receipt Preview Modal
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // Product & Inventory Management
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSortBy, setProductSortBy] = useState('name');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
    price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10,
    status: 'Active', image: '', isService: false, batchNumber: '', expiryDate: ''
  });
  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false);
  const [stockAdjustItem, setStockAdjustItem] = useState(null);
  const [stockAdjustQty, setStockAdjustQty] = useState('');
  const [stockAdjustReason, setStockAdjustReason] = useState('Restock / Delivery');
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');

  // Customer Management
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', mobile: '', email: '', address: '', gstin: '' });
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [showPayUdhaarModal, setShowPayUdhaarModal] = useState(false);
  const [payUdhaarCustomer, setPayUdhaarCustomer] = useState(null);
  const [payUdhaarAmount, setPayUdhaarAmount] = useState('');
  const [payUdhaarMode, setPayUdhaarMode] = useState('Cash');

  // Bills History
  const [billSearch, setBillSearch] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('All');

  // Expenses Management
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Utilities',
    amount: '',
    description: '',
    paymentMethod: 'UPI',
    reference: '',
    date: new Date().toISOString().slice(0, 10)
  });

  // Suppliers Management
  const [suppliers, setSuppliers] = useState([
    { _id: 'sup_1', name: 'Metro Cash & Carry Wholesale', contactPerson: 'Suresh Kumar', mobile: '9811223344', email: 'orders@metrowholesale.in', category: 'FMCG & Groceries', pendingPayable: 14500 },
    { _id: 'sup_2', name: 'Modern Packaging & Polythene Supplies', contactPerson: 'Vikas Jain', mobile: '9822334455', email: 'vikas@modernpack.com', category: 'Packing Materials', pendingPayable: 2200 },
    { _id: 'sup_3', name: 'Shree Balaji Dairy Farm Ltd', contactPerson: 'Mukesh Yadav', mobile: '9833445566', email: 'balajidairy@gmail.com', category: 'Dairy & Ghee', pendingPayable: 5800 }
  ]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '', contactPerson: '', mobile: '', email: '', category: 'FMCG', pendingPayable: ''
  });

  // Quotations & Estimates
  const [quotations, setQuotations] = useState([
    {
      _id: 'quot_101',
      quotationNumber: 'EST-2026-001',
      customerName: 'Gupta Sweets & Caterers',
      customerMobile: '9811998877',
      validUntil: '2026-11-05',
      itemsCount: 4,
      totalAmount: 18450,
      createdAt: '2026-10-18T11:00:00.000Z',
      items: [
        { name: 'Fortune Sunlite Sunflower Oil 1L', quantity: 50, price: 145, lineTotal: 7250 },
        { name: 'Basmati Rice (Chawal) 25kg Bag', quantity: 2, price: 3400, lineTotal: 6800 },
        { name: 'Refined Sugar 50kg Sack', quantity: 2, price: 2100, lineTotal: 4200 },
        { name: 'Amul Butter 100g', quantity: 4, price: 50, lineTotal: 200 }
      ]
    }
  ]);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  // BillMate AI Copilot
  const [billmateMessages, setBillmateMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Namaste! I am BillMate AI, your universal billing & business copilot. You can ask me sales insights, check outstanding Udhaar, inspect low stock, or say "Log expense 500 for electricity"!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [billmateInput, setBillmateInput] = useState('');
  const [billmateLoading, setBillmateLoading] = useState(false);
  const billmateScrollRef = useRef(null);

  // Sync Dark Mode with <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('voicebill_dark_mode', String(next));
      return next;
    });
  };

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Back online! Transactions will sync automatically.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('Working offline. Bills will be queued locally.', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + B -> Voice Bill
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setActiveTab('billing');
      }
      // Ctrl + M -> Manual POS Grid
      else if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setActiveTab('pos');
      }
      // Ctrl + I -> BillMate AI
      else if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setActiveTab('billmate');
      }
      // Ctrl + K -> Focus Search
      else if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) searchInput.focus();
      }
      // Esc -> Close active modals
      else if (e.key === 'Escape') {
        setShowTemplateModal(false);
        setShowHelpModal(false);
        setShowBarcodeModal(false);
        setShowClarificationModal(false);
        setShowProductModal(false);
        setShowStockAdjustModal(false);
        setShowBulkImportModal(false);
        setShowAddCustomerModal(false);
        setShowPayUdhaarModal(false);
        setShowAddExpenseModal(false);
        setShowAddSupplierModal(false);
        setShowQuotationModal(false);
        setReceiptInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial Load: Stores
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStores();
  }, [user]);

  // Fetch Store Data when Selected Store changes
  useEffect(() => {
    if (selectedStore) {
      fetchAllStoreData(selectedStore._id);
    }
  }, [selectedStore]);

  // Web Speech Recognition Setup
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
          addToast('Microphone permission denied. Please allow microphone access in browser settings.', 'error');
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

  // Handle Voice Recording End -> Process Speech
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
        addToast('Voice recognition is not supported in this browser. Please use keyboard text entry below.', 'info');
      }
    }
  };

  // API Data Fetchers
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
      const headers = { Authorization: `Bearer ${token}` };
      const [prodRes, custRes, billRes, anaRes, expRes] = await Promise.all([
        fetch(`/api/products/store/${storeId}`, { headers }),
        fetch(`/api/customers/store/${storeId}`, { headers }),
        fetch(`/api/orders/store/${storeId}`, { headers }),
        fetch(`/api/orders/analytics/${storeId}`, { headers }),
        fetch(`/api/expenses/store/${storeId}`, { headers })
      ]);

      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(Array.isArray(pData) ? pData : pData.products || []);
      }
      if (custRes.ok) {
        const cData = await custRes.json();
        setCustomers(Array.isArray(cData) ? cData : cData.customers || []);
      }
      if (billRes.ok) {
        const bData = await billRes.json();
        setBills(Array.isArray(bData) ? bData : bData.orders || []);
      }
      if (anaRes.ok) {
        const aData = await anaRes.json();
        setAnalytics(aData);
      }
      if (expRes.ok) {
        const eData = await expRes.json();
        setExpenses(Array.isArray(eData) ? eData : eData.expenses || []);
      }
    } catch (err) {
      console.error('Fetch all store data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply Industry Template
  const handleApplyTemplate = async (category, seedCatalog) => {
    if (!selectedStore) return;
    setTemplateLoading(true);
    try {
      const res = await fetch(`/api/stores/${selectedStore._id}/apply-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category, seedCatalog })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to apply template');

      addToast(`Applied ${category} profile successfully!`, 'success');
      if (soundEnabled) playSuccessChime();
      setSelectedStore(data.store);
      setShowTemplateModal(false);
      fetchAllStoreData(selectedStore._id);
    } catch (err) {
      console.error('Apply template error:', err);
      addToast(err.message || 'Error applying template', 'error');
    } finally {
      setTemplateLoading(false);
    }
  };

  // Voice Command Processing
  const processVoiceCommand = async (commandText) => {
    if (!commandText || !commandText.trim()) return;
    setIsProcessingAI(true);
    setSpeechText(commandText);

    try {
      const parsed = parseVoiceCommand(commandText, products, customers);

      if (parsed.intent === 'action') {
        if (parsed.action === 'clear_cart') {
          handleClearCart();
          addToast('Cart cleared via voice.', 'info');
        } else if (parsed.action === 'print_bill' || parsed.action === 'confirm_bill') {
          handleFinalizeBill(true);
        } else if (parsed.action === 'show_total') {
          if (talkbackEnabled) {
            speakVoice(`Aapka kul total hai ${computedTotals.grandTotal} rupaye.`);
          }
          addToast(`Total: ₹${computedTotals.grandTotal}`, 'info');
        }
        setIsProcessingAI(false);
        return;
      }

      if (parsed.intent === 'apply_discount') {
        if (parsed.discountType === 'percentage') {
          const discountAmt = Math.round((computedTotals.subtotal * (parsed.value / 100)) * 100) / 100;
          setOverallDiscount(discountAmt);
          addToast(`Applied ${parsed.value}% discount (-₹${discountAmt})`, 'success');
        } else {
          setOverallDiscount(parsed.value);
          addToast(`Applied ₹${parsed.value} flat discount`, 'success');
        }
        setIsProcessingAI(false);
        return;
      }

      if (parsed.intent === 'set_tax') {
        addToast(`Set default tax to ${parsed.taxRate}%`, 'info');
        setIsProcessingAI(false);
        return;
      }

      // Add detected items
      if (parsed.detectedItems && parsed.detectedItems.length > 0) {
        parsed.detectedItems.forEach(item => {
          addItemToCart(item);
        });
        if (soundEnabled) playScanBeep();
        if (talkbackEnabled) {
          const names = parsed.detectedItems.map(i => `${i.quantity} ${i.name}`).join(' aur ');
          speakVoice(`${names} bill mein jod diya.`);
        }
        addToast(`Added ${parsed.detectedItems.length} item(s) from voice.`, 'success');
      }

      // Ambiguity Clarifications
      if (parsed.clarifications && parsed.clarifications.length > 0) {
        setClarifications(parsed.clarifications);
        setShowClarificationModal(true);
      }
    } catch (err) {
      console.error('Process voice command error:', err);
      addToast('Voice parser error. Please try again.', 'error');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Cart Management
  const addItemToCart = (product, customQty = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => 
        (item.productId && product._id && item.productId === product._id) ||
        (item.name && product.name && item.name.toLowerCase() === product.name.toLowerCase())
      );

      const qtyToAdd = Number(product.quantity || customQty || 1);
      const unitPrice = Number(product.price || 0);
      const taxRate = Number(product.taxRate || 0);

      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + qtyToAdd;
        const lineSubtotal = Math.round((existing.price * newQty) * 100) / 100;
        const lineTax = Math.round((lineSubtotal * (existing.taxRate / 100)) * 100) / 100;

        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          lineTotal: Math.round((lineSubtotal + lineTax) * 100) / 100
        };
        return updated;
      } else {
        const lineSubtotal = Math.round((unitPrice * qtyToAdd) * 100) / 100;
        const lineTax = Math.round((lineSubtotal * (taxRate / 100)) * 100) / 100;

        return [
          ...prev,
          {
            productId: product._id || product.productId || `custom_${Date.now()}`,
            sku: product.sku || 'SKU-GEN',
            name: product.name,
            price: unitPrice,
            quantity: qtyToAdd,
            unit: product.unit || 'piece',
            taxRate,
            discount: 0,
            image: product.image || '',
            lineTotal: Math.round((lineSubtotal + lineTax) * 100) / 100
          }
        ];
      }
    });

    if (soundEnabled) playScanBeep();
  };

  const handleUpdateCartQty = (identifier, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      handleRemoveCartItem(identifier);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.productId === identifier || item.name.toLowerCase() === String(identifier).toLowerCase()) {
        const lineSubtotal = Math.round((item.price * qty) * 100) / 100;
        const lineTax = Math.round((lineSubtotal * (item.taxRate / 100)) * 100) / 100;
        return {
          ...item,
          quantity: qty,
          lineTotal: Math.round((lineSubtotal + lineTax) * 100) / 100
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

  // Quick Grocery Cart Loader
  const handleLoadQuickGroceryCart = () => {
    const popularSamples = [
      { name: 'Basmati Rice (Chawal)', sku: 'GRA-RIC-001', price: 60, quantity: 2, unit: 'kg', taxRate: 5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'GRA-AAT-003', price: 235, quantity: 1, unit: 'packet', taxRate: 5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tata Salt Vacuum Evaporated 1kg', sku: 'GRO-SAL-009', price: 28, quantity: 1, unit: 'packet', taxRate: 0, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80' },
      { name: 'Maggi 2-Minute Masala Noodles 70g', sku: 'SNK-MAG-015', price: 14, quantity: 3, unit: 'packet', taxRate: 12, image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80' },
      { name: 'Amul Butter Pasteurized 100g', sku: 'DAI-BUT-013', price: 58, quantity: 1, unit: 'packet', taxRate: 12, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Britannia Good Day Butter Cookies 120g', sku: 'SNK-GUD-017', price: 30, quantity: 2, unit: 'packet', taxRate: 5, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80' }
    ];

    setCartItems(popularSamples.map(item => {
      const lineSub = item.price * item.quantity;
      const taxAmt = Math.round((lineSub * (item.taxRate / 100)) * 100) / 100;
      return {
        ...item,
        productId: `quick_${item.sku}`,
        discount: 0,
        taxAmount: taxAmt,
        lineTotal: Math.round((lineSub + taxAmt) * 100) / 100
      };
    }));

    setCartCustomerInput({
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      address: 'B-42, Sector 4, Rohini, New Delhi',
      gstin: '07AAACR1234D1Z2'
    });

    if (soundEnabled) playSuccessChime();
    addToast('Loaded 6 popular grocery products with pictures into cart!', 'success');
  };

  // Grocery Combos
  const groceryCombos = [
    {
      id: 'chai_combo',
      name: 'Chai-Nashta Combo',
      badge: 'Popular',
      desc: 'Tata Tea + Parle-G + Good Day + Sugar',
      items: [
        { name: 'Tata Tea Premium Desh Ki Chai 500g', qty: 1 },
        { name: 'Sugar (Cheeni) 1kg', qty: 1 },
        { name: 'Parle-G Gold Biscuits 100g', qty: 2 },
        { name: 'Britannia Good Day Butter Cookies 120g', qty: 1 }
      ]
    },
    {
      id: 'dal_chawal',
      name: 'Dal-Chawal Staples',
      badge: 'Daily Essential',
      desc: 'Rice 2kg + Toor Dal + Salt + Mustard Oil',
      items: [
        { name: 'Basmati Rice (Chawal)', qty: 2 },
        { name: 'Tata Sampann Toor Dal (Arhar) 1kg', qty: 1 },
        { name: 'Tata Salt Vacuum Evaporated 1kg', qty: 1 },
        { name: 'Fortune Kachi Ghani Mustard Oil 1L', qty: 1 }
      ]
    },
    {
      id: 'snack_pack',
      name: 'Snack Munchies Pack',
      badge: 'Quick Bite',
      desc: '2x Maggi + Coca-Cola + Kurkure + Lay\'s',
      items: [
        { name: 'Maggi 2-Minute Masala Noodles 70g', qty: 2 },
        { name: 'Coca Cola Bottle 500ml', qty: 1 },
        { name: 'Kurkure Masala Munch 82g', qty: 1 },
        { name: "Lay's India's Magic Masala Chips 50g", qty: 1 }
      ]
    },
    {
      id: 'clean_home',
      name: 'Home Hygiene Pack',
      badge: 'Weekly Kit',
      desc: 'Surf Excel + Vim Bar + Dettol Soap + Colgate',
      items: [
        { name: 'Surf Excel Easy Wash Detergent Powder 1kg', qty: 1 },
        { name: 'Vim Dishwash Lemon Bar 300g', qty: 2 },
        { name: 'Dettol Original Bathing Soap 125g', qty: 2 },
        { name: 'Colgate Strong Teeth Dental Cream 150g', qty: 1 }
      ]
    }
  ];

  const handleAddCombo = (combo) => {
    let addedCount = 0;
    combo.items.forEach(cItem => {
      const match = products.find(p => p.name.toLowerCase().includes(cItem.name.toLowerCase().slice(0, 10)));
      if (match) {
        addItemToCart(match, cItem.qty);
        addedCount++;
      } else {
        addItemToCart({
          name: cItem.name,
          price: 50,
          quantity: cItem.qty,
          taxRate: 5,
          unit: 'packet'
        }, cItem.qty);
        addedCount++;
      }
    });

    if (soundEnabled) playSuccessChime();
    addToast(`Added ${combo.name} (${addedCount} items) to bill!`, 'success');
  };

  // Accurate Decimal Calculation Engine
  const computedTotals = useMemo(() => {
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
      paid = (paymentMethod === 'Credit/Udhaar' || paymentMethod === 'Udhaar') ? 0 : grandTotal;
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

  // Finalize & Save Bill
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

      // Offline draft support
      if (!isOnline) {
        const offlineId = `OFFLINE-${Date.now()}`;
        const offlineOrder = {
          ...payload,
          _id: offlineId,
          invoiceNumber: `VB-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
          totalAmount: computedTotals.grandTotal,
          subtotal: computedTotals.subtotal,
          tax: computedTotals.totalTax,
          taxBreakdown: computedTotals.taxBreakdown,
          balanceDue: computedTotals.balanceDue,
          paymentStatus: computedTotals.balanceDue === 0 ? 'Paid' : 'Partial',
          createdAt: new Date().toISOString()
        };
        const drafts = JSON.parse(localStorage.getItem('voicebill_offline_drafts') || '[]');
        drafts.push(offlineOrder);
        localStorage.setItem('voicebill_offline_drafts', JSON.stringify(drafts));
        
        addToast('Invoice saved locally to Offline Queue!', 'warning');
        setReceiptInvoice(offlineOrder);
        handleClearCart();
        setIsSubmittingBill(false);
        return;
      }

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

  // Convert Quotation into Active Bill
  const handleConvertQuotationToBill = (quot) => {
    setCartItems(quot.items.map((it, idx) => ({
      productId: `quot_item_${idx}`,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      unit: 'piece',
      taxRate: 5,
      lineTotal: it.lineTotal || (it.price * it.quantity)
    })));
    setCartCustomerInput({
      name: quot.customerName,
      mobile: quot.customerMobile || '',
      address: '',
      gstin: ''
    });
    setActiveTab('billing');
    if (soundEnabled) playSuccessChime();
    addToast(`Quotation #${quot.quotationNumber} loaded into active bill tape!`, 'success');
  };

  // BillMate AI Message Sender
  const handleSendBillmateMessage = async (textToSend) => {
    const text = textToSend || billmateInput;
    if (!text || !text.trim() || !selectedStore) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setBillmateMessages(prev => [...prev, userMsg]);
    setBillmateInput('');
    setBillmateLoading(true);

    try {
      const res = await fetch('/api/nlp/billmate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: text.trim(), storeId: selectedStore._id })
      });

      const data = await res.json();
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer || 'I have analyzed your store records.',
        meta: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setBillmateMessages(prev => [...prev, aiMsg]);
      if (soundEnabled) playClickSound();

      // Refresh data if expense logged
      if (data.type === 'action_success') {
        fetchAllStoreData(selectedStore._id);
        addToast(data.answer, 'success');
      }
    } catch (err) {
      console.error('BillMate AI error:', err);
      setBillmateMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I encountered an issue connecting to store data. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setBillmateLoading(false);
    }
  };

  // Filtered Products for Billing Shelf
  const filteredBillingProducts = useMemo(() => {
    return products.filter(p => {
      const query = (billingProductSearch || globalSearch).toLowerCase().trim();
      const matchesSearch = !query || 
        (p.name || '').toLowerCase().includes(query) ||
        (p.sku || '').toLowerCase().includes(query) ||
        (p.barcode || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query);

      const matchesCat = billingCategoryFilter === 'All' || p.category === billingCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, billingProductSearch, globalSearch, billingCategoryFilter]);

  // Product categories list
  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Expense creation
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) {
      addToast('Please enter an amount and description.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/expenses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...expenseForm,
          storeId: selectedStore._id
        })
      });

      if (!res.ok) throw new Error('Failed to record expense');
      const data = await res.json();
      addToast(`Recorded expense of ₹${data.amount} under ${data.category}`, 'success');
      setShowAddExpenseModal(false);
      setExpenseForm({
        category: 'Utilities',
        amount: '',
        description: '',
        paymentMethod: 'UPI',
        reference: '',
        date: new Date().toISOString().slice(0, 10)
      });
      fetchAllStoreData(selectedStore._id);
    } catch (err) {
      addToast(err.message || 'Error recording expense', 'error');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200`}>
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeRole={activeRole}
        selectedStore={selectedStore}
        user={user}
        onLogout={() => {
          dispatch(logout());
          navigate('/login');
        }}
      />

      {/* 2. MAIN APP SHELL CONTAINER */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        
        {/* TOP NAV BAR */}
        <TopNav
          collapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedStore={selectedStore}
          stores={stores}
          onSelectStore={setSelectedStore}
          onOpenTemplateModal={() => setShowTemplateModal(true)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          talkbackEnabled={talkbackEnabled}
          setTalkbackEnabled={setTalkbackEnabled}
          isOnline={isOnline}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          onOpenHelpModal={() => setShowHelpModal(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onNewBillClick={() => setActiveTab('billing')}
        />

        {/* 3. DYNAMIC CONTENT AREA FOR 15 MODULES */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* =========================================================================
              TAB 1: DASHBOARD & LIVE ANALYTICS
          ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Business Intelligence Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Real-time sales, tax collections, profit margins, and inventory health for {selectedStore?.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAllStoreData(selectedStore?._id)}
                    className="p-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:text-violet-600 transition shadow-sm"
                    title="Refresh data"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Create Voice Bill</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700/80 shadow-card-soft">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span>TODAY'S SALES</span>
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{Number(analytics?.todaySales || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {analytics?.totalBills || 0} bills generated today
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700/80 shadow-card-soft">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span>THIS MONTH SALES</span>
                    <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{Number(analytics?.monthSales || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Estimated Operating Profit: <strong className="text-emerald-600 dark:text-emerald-400">₹{Number(analytics?.estimatedProfit || (analytics?.monthSales || 0) * 0.18).toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700/80 shadow-card-soft">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span>PENDING UDHAAR</span>
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    ₹{Number(analytics?.outstandingUdhaar || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {customers.filter(c => Number(c.pendingCredit) > 0).length} customer(s) with balance
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700/80 shadow-card-soft">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span>INVENTORY STATUS</span>
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {products.length} Items
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                    {analytics?.lowStockCount || products.filter(p => !p.isService && p.stock <= 10).length} low stock warnings
                  </p>
                </div>
              </div>

              {/* Charts Section: 7-day Sales & Top Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                    <span>7-Day Sales Trends</span>
                    <span className="text-xs text-slate-400 font-normal">Real billing records</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.salesTrends || []}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="label" stroke={darkMode ? '#94a3b8' : '#64748b'} textAnchor="end" tick={{ fontSize: 11 }} />
                        <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                            borderColor: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '12px',
                            color: darkMode ? '#f8fafc' : '#0f172a'
                          }} 
                        />
                        <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Top Selling Products
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {(analytics?.topProducts || []).length > 0 ? (
                      analytics.topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-700/60">
                          <div className="truncate pr-2">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                            <p className="text-slate-400 text-[10px]">{p.quantity} {p.unit || 'units'} sold</p>
                          </div>
                          <span className="font-bold text-violet-600 dark:text-violet-400">
                            ₹{p.revenue}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No sales transactions recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Bills Table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Finalized Invoices
                  </h3>
                  <button
                    onClick={() => setActiveTab('bills')}
                    className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View All ({bills.length})</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-navy-700">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                      {bills.slice(0, 5).map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-violet-600 dark:text-violet-400">{b.invoiceNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{b.customerName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{(b.items || []).length} item(s)</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">₹{b.totalAmount}</td>
                          <td className="py-2.5 px-3">{b.paymentMethod}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.paymentStatus === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                              b.paymentStatus === 'Partial' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                              'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}>
                              {b.paymentStatus}
                            </span>
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
              TAB 2: VOICE & SMART BILL WORKSPACE
          ========================================================================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fade-in">
              {/* Top Banner: Voice Microphone Bar & Quick Fill */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-navy-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-violet-700/40 relative overflow-hidden">
                <div className="flex items-center gap-4 z-10 w-full md:w-auto">
                  <button
                    onClick={toggleRecording}
                    className={`h-14 w-14 min-w-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl ${
                      isRecording 
                        ? 'bg-rose-600 text-white ring-4 ring-rose-400/50 animate-pulse' 
                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  </button>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <span>{isRecording ? 'Listening... Speak Your Bill' : 'Voice Billing Copilot'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/30 text-violet-200 border border-violet-400/30">
                        Hinglish / Hindi / English
                      </span>
                    </h2>
                    <p className="text-xs text-violet-200/80">
                      {liveTranscript || 'Example: "Add two chawal at 60 and 1 sunflower oil" or "5% discount"'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 z-10 w-full md:w-auto justify-end">
                  <button
                    onClick={handleLoadQuickGroceryCart}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/20 transition flex items-center gap-1.5"
                    title="Instantly populates 6 popular grocery products with photos & prices into the cart"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>✨ Quick Fill Cart (6 Items)</span>
                  </button>
                  <button
                    onClick={() => setShowBarcodeModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/20 transition flex items-center gap-1.5"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Barcode Scan</span>
                  </button>
                </div>
              </div>

              {/* ⚡ Quick Grocery Combos Strip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    1-Tap Quick Grocery Combos
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Instant bundle billing</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {groceryCombos.map(combo => (
                    <button
                      key={combo.id}
                      onClick={() => handleAddCombo(combo)}
                      className="p-3 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-500 dark:hover:border-violet-500 text-left transition shadow-card-soft group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 truncate">
                          {combo.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300">
                          {combo.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{combo.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Billing Grid: Left Cart Tape (5 cols) & Right Product Shelf (7 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: CART TAPE & TOTALS (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-700 pb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Bill Tape</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300">
                          {cartItems.length}
                        </span>
                      </div>
                      {cartItems.length > 0 && (
                        <button
                          onClick={handleClearCart}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    {/* Customer Info Form */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={cartCustomerInput.name}
                        onChange={(e) => setCartCustomerInput({ ...cartCustomerInput, name: e.target.value })}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <input
                        type="text"
                        placeholder="Mobile (10 digits)"
                        value={cartCustomerInput.mobile}
                        onChange={(e) => setCartCustomerInput({ ...cartCustomerInput, mobile: e.target.value })}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    {/* Cart Items List with Photos */}
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {cartItems.length > 0 ? (
                        cartItems.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-navy-700/80 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="h-10 w-10 min-w-10 rounded-lg object-cover border border-slate-200 dark:border-navy-700"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="h-10 w-10 min-w-10 rounded-lg bg-slate-200 dark:bg-navy-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                                  {item.name.charAt(0)}
                                </div>
                              )}
                              <div className="truncate">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                                <p className="text-[11px] text-slate-400">₹{item.price} × {item.quantity} {item.unit} ({item.taxRate}% GST)</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-slate-200 dark:border-navy-700 rounded-lg overflow-hidden bg-white dark:bg-navy-800">
                                <button
                                  onClick={() => handleUpdateCartQty(item.productId, item.quantity - 1)}
                                  className="px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700 font-bold"
                                >
                                  -
                                </button>
                                <span className="px-2 font-bold text-slate-800 dark:text-slate-200 text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateCartQty(item.productId, item.quantity + 1)}
                                  className="px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700 font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white min-w-14 text-right">
                                ₹{item.lineTotal}
                              </span>
                              <button
                                onClick={() => handleRemoveCartItem(item.productId)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs">
                          Cart is empty. Speak or tap products to add.
                        </div>
                      )}
                    </div>

                    {/* Calculation Summary Breakdown */}
                    <div className="pt-3 border-t border-slate-200 dark:border-navy-700 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Items Subtotal</span>
                        <span>₹{computedTotals.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>GST Tax Total</span>
                        <span>₹{computedTotals.totalTax}</span>
                      </div>
                      {computedTotals.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>Discount Applied</span>
                          <span>-₹{computedTotals.discount}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Grand Total</span>
                        <span className="text-2xl font-black text-violet-600 dark:text-violet-400">₹{computedTotals.grandTotal}</span>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                        {['Cash', 'UPI', 'Card', 'Udhaar'].map(mode => (
                          <button
                            key={mode}
                            onClick={() => setPaymentMethod(mode === 'Udhaar' ? 'Credit/Udhaar' : mode)}
                            className={`py-2 rounded-xl border text-center transition ${
                              (paymentMethod === mode || (mode === 'Udhaar' && paymentMethod === 'Credit/Udhaar'))
                                ? 'bg-violet-600 text-white border-violet-600 shadow-sm font-bold'
                                : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {/* Cash Tender & Change Calculator */}
                      {paymentMethod === 'Cash' && (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="number"
                            placeholder="Cash Tendered (₹)"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                          {computedTotals.changeReturn > 0 && (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                              Change: ₹{computedTotals.changeReturn}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Finalize Buttons */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleFinalizeBill(false)}
                        disabled={isSubmittingBill || cartItems.length === 0}
                        className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-glow-violet transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        <span>{isSubmittingBill ? 'Finalizing...' : `Finalize & Bill ₹${computedTotals.grandTotal}`}</span>
                      </button>
                      <button
                        onClick={() => handleFinalizeBill(true)}
                        disabled={isSubmittingBill || cartItems.length === 0}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition active:scale-95 disabled:opacity-50"
                        title="Save & Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: FAST TOUCH PRODUCT SHELF (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft space-y-4">
                    {/* Shelf Search & Category Filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search shelf items..."
                          value={billingProductSearch}
                          onChange={(e) => setBillingProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <select
                        value={billingCategoryFilter}
                        onChange={(e) => setBillingCategoryFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        {productCategories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Product Cards Grid with Photos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
                      {filteredBillingProducts.map(p => (
                        <div
                          key={p._id}
                          onClick={() => addItemToCart(p, 1)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/60 dark:bg-navy-900/40 hover:border-violet-500 dark:hover:border-violet-500 transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div>
                            {p.image ? (
                              <div className="h-24 w-full rounded-lg overflow-hidden mb-2 bg-white dark:bg-navy-950">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            ) : (
                              <div className="h-24 w-full rounded-lg bg-slate-200 dark:bg-navy-800 flex items-center justify-center font-bold text-slate-400 mb-2">
                                <Package className="h-8 w-8 opacity-40" />
                              </div>
                            )}
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400">
                              {p.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.category}</p>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-navy-700/60 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              ₹{p.price}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-violet-600 text-white text-[11px] font-bold group-hover:bg-violet-500 transition">
                              + Add
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: MANUAL POS GRID
          ========================================================================= */}
          {activeTab === 'pos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Touch POS Register
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    High-speed touch-first cashier screen with large buttons and fast tender.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-glow-violet"
                >
                  Switch to Voice Billing
                </button>
              </div>

              {/* POS Touch Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {products.map(p => (
                  <button
                    key={p._id}
                    onClick={() => {
                      addItemToCart(p, 1);
                      addToast(`Added ${p.name}`, 'info');
                    }}
                    className="p-3 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-left hover:border-violet-500 active:scale-95 transition shadow-card-soft flex flex-col justify-between h-32"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">{p.category}</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">{p.name}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-navy-700">
                      <span className="text-sm font-black text-violet-600 dark:text-violet-400">₹{p.price}</span>
                      <span className="text-[10px] text-slate-400">{p.unit}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: PRODUCTS & SERVICES CATALOG
          ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Products & Services Catalog ({products.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Manage goods, services, batches, expiry dates, and tax categories.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
                        price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10,
                        status: 'Active', image: '', isService: false, batchNumber: '', expiryDate: ''
                      });
                      setShowProductModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Item</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-navy-700">
                      <tr>
                        <th className="py-2.5 px-3">Photo</th>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">SKU / Barcode</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Selling Price</th>
                        <th className="py-2.5 px-3">Tax</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                      {products.map(p => (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                          <td className="py-2 px-3">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-navy-700 flex items-center justify-center font-bold text-slate-500 text-[10px]">{p.name.charAt(0)}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku || p.barcode || '-'}</td>
                          <td className="py-2.5 px-3">{p.category}</td>
                          <td className="py-2.5 px-3 font-bold text-violet-600 dark:text-violet-400">₹{p.price}</td>
                          <td className="py-2.5 px-3">{p.taxRate}% GST</td>
                          <td className="py-2.5 px-3 font-semibold">
                            {p.isService ? 'Service' : `${p.stock} ${p.unit}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isService ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}`}>
                              {p.isService ? 'Service' : 'Physical'}
                            </span>
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
              TAB 5: STOCK & INVENTORY
          ========================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                    Stock & Inventory Health
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Real-time stock quantities, low-stock warnings, and inventory audit logs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">TOTAL PRODUCTS IN STOCK</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {products.reduce((acc, p) => acc + (!p.isService ? Number(p.stock || 0) : 0), 0)} Units
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">LOW STOCK ALERTS</span>
                  <div className="text-2xl font-black text-rose-500 mt-1">
                    {products.filter(p => !p.isService && Number(p.stock) <= Number(p.lowStockAlertLimit || 10)).length} Items
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">INVENTORY VALUATION</span>
                  <div className="text-2xl font-black text-emerald-500 mt-1">
                    ₹{products.reduce((acc, p) => acc + (!p.isService ? (Number(p.costPrice || p.price * 0.8) * Number(p.stock || 0)) : 0), 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: INVOICES & BILL HISTORY
          ========================================================================= */}
          {activeTab === 'bills' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Invoices & Receipts History ({bills.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    View, reprint thermal receipts, download A4 tax PDFs, or share via WhatsApp.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-navy-700">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                      {bills.map(b => (
                        <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-violet-600 dark:text-violet-400">{b.invoiceNumber}</td>
                          <td className="py-2.5 px-3 text-slate-500">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{b.customerName}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">₹{b.totalAmount}</td>
                          <td className="py-2.5 px-3">{b.paymentMethod}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.paymentStatus === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                              b.paymentStatus === 'Partial' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                              'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setReceiptInvoice(b)}
                              className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300 font-bold hover:bg-violet-100 transition"
                            >
                              Receipt / Print
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
              TAB 7: QUOTATIONS & ESTIMATES
          ========================================================================= */}
          {activeTab === 'quotations' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Quotations & Proforma Estimates
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Create price quotes and convert them into finalized bills in 1 click.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quotations.map(q => (
                  <div key={q._id} className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-violet-600 dark:text-violet-400">{q.quotationNumber}</span>
                      <span className="text-[11px] text-slate-400">Valid until {q.validUntil}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{q.customerName}</h3>
                      <p className="text-xs text-slate-500">{q.customerMobile} • {q.itemsCount} line items</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-navy-700 flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900 dark:text-white">₹{q.totalAmount.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleConvertQuotationToBill(q)}
                        className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition shadow-glow-violet flex items-center gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Convert to Bill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 8: CUSTOMERS & UDHAAR LEDGER
          ========================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Customer Directory & Udhaar Ledger
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Track customer credit balances, payment histories, and contact info.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-navy-700">
                      <tr>
                        <th className="py-2.5 px-3">Customer Name</th>
                        <th className="py-2.5 px-3">Mobile</th>
                        <th className="py-2.5 px-3">Address</th>
                        <th className="py-2.5 px-3">Outstanding Udhaar</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                      {customers.map(c => (
                        <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{c.mobile || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{c.address || '-'}</td>
                          <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                            ₹{Number(c.pendingCredit || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {Number(c.pendingCredit || 0) > 0 && (
                              <button
                                onClick={() => {
                                  setPayUdhaarCustomer(c);
                                  setPayUdhaarAmount(String(c.pendingCredit));
                                  setShowPayUdhaarModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition"
                              >
                                Record Payment
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
              TAB 9: SUPPLIERS DIRECTORY
          ========================================================================= */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Suppliers & Purchase Vendors
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Manage restock distributors, contact persons, and pending wholesale payables.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.map(s => (
                  <div key={s._id} className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300">
                        {s.category}
                      </span>
                      <span className="text-xs font-bold text-rose-500">
                        Payable: ₹{s.pendingPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
                      <p className="text-xs text-slate-500">{s.contactPerson} • {s.mobile}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 10: EXPENSES & CASHFLOW
          ========================================================================= */}
          {activeTab === 'expenses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Expenses & Operating Profit
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Record operating costs (Rent, Salaries, Utilities) to measure true net profit.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log New Expense</span>
                </button>
              </div>

              {/* Profit Indicator Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-950 to-navy-900 text-white border border-navy-800 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Revenue This Month</span>
                  <div className="text-2xl font-black text-white mt-1">₹{Number(analytics?.monthSales || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Total Expenses Logged</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">₹{expenses.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Estimated Net Operating Profit</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    ₹{(Number(analytics?.monthSales || 0) - expenses.reduce((s, e) => s + Number(e.amount || 0), 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Expenses List */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-navy-700">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Payment Mode</th>
                        <th className="py-2.5 px-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                      {expenses.map(e => (
                        <tr key={e._id} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                          <td className="py-2.5 px-3 text-slate-500">{new Date(e.date || e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td className="py-2.5 px-3 font-semibold text-violet-600 dark:text-violet-400">{e.category}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{e.description}</td>
                          <td className="py-2.5 px-3">{e.paymentMethod || 'Cash'}</td>
                          <td className="py-2.5 px-3 font-bold text-rose-500">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 11: REPORTS & GST ANALYTICS
          ========================================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    GST & Financial Reports
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Tax summary breakdown for GSTR-1, payment distribution, and sales export.
                  </p>
                </div>
              </div>

              {/* GST Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">TOTAL GST COLLECTED</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{Number(analytics?.taxSummary?.totalTax || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">CGST (INTRA-STATE)</span>
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">₹{Number(analytics?.taxSummary?.cgst || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">SGST (INTRA-STATE)</span>
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">₹{Number(analytics?.taxSummary?.sgst || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft">
                  <span className="text-xs text-slate-500 font-semibold">IGST (INTER-STATE)</span>
                  <div className="text-2xl font-black text-blue-500 mt-1">₹{Number(analytics?.taxSummary?.igst || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 12: BILLMATE AI COPILOT
          ========================================================================= */}
          {activeTab === 'billmate' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    BillMate AI Assistant
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Ask natural questions in Hindi or English, inspect business facts, and log expenses.
                  </p>
                </div>
              </div>

              {/* Chat Container */}
              <div className="rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft flex flex-col h-[520px] overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {billmateMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="h-8 w-8 min-w-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-glow-violet">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                      <div className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-lg leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-violet-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-100 rounded-tl-none whitespace-pre-line'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {billmateLoading && (
                    <div className="flex gap-3 justify-start items-center text-xs text-slate-400">
                      <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center animate-pulse">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span>BillMate AI is analyzing your store records...</span>
                    </div>
                  )}
                  <div ref={billmateScrollRef} />
                </div>

                {/* Pre-built Prompt Chips */}
                <div className="p-2.5 border-t border-slate-100 dark:border-navy-700 bg-slate-50 dark:bg-navy-950/60 flex items-center gap-2 overflow-x-auto text-xs">
                  <button
                    onClick={() => handleSendBillmateMessage('How much did I sell today?')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-500 whitespace-nowrap transition"
                  >
                    💬 Today's sales?
                  </button>
                  <button
                    onClick={() => handleSendBillmateMessage('Which products generated the most revenue?')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-500 whitespace-nowrap transition"
                  >
                    📈 Top products?
                  </button>
                  <button
                    onClick={() => handleSendBillmateMessage('Show customers with outstanding payments')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-500 whitespace-nowrap transition"
                  >
                    👥 Pending Udhaar?
                  </button>
                  <button
                    onClick={() => handleSendBillmateMessage('Check low stock alerts')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-500 whitespace-nowrap transition"
                  >
                    ⚠️ Low stock?
                  </button>
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask BillMate anything about your sales, inventory, or expenses..."
                    value={billmateInput}
                    onChange={(e) => setBillmateInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendBillmateMessage();
                    }}
                    className="flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={() => handleSendBillmateMessage()}
                    disabled={billmateLoading || !billmateInput.trim()}
                    className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-glow-violet disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 13: STAFF & PERMISSIONS MATRIX
          ========================================================================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Staff Accounts & Role Permissions
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Granular role security for Owners, Managers, Cashiers, and Accountants.
                  </p>
                </div>
              </div>

              {/* Roles Matrix Table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-navy-700">
                    <tr>
                      <th className="py-2.5 px-3">Capability</th>
                      <th className="py-2.5 px-3 text-center">Owner</th>
                      <th className="py-2.5 px-3 text-center">Manager</th>
                      <th className="py-2.5 px-3 text-center">Cashier</th>
                      <th className="py-2.5 px-3 text-center">Accountant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                    {[
                      { cap: 'Create Voice & Manual Invoices', o: true, m: true, c: true, a: false },
                      { cap: 'Edit Prices & Add Products', o: true, m: true, c: false, a: false },
                      { cap: 'Adjust Inventory & Stock', o: true, m: true, c: false, a: false },
                      { cap: 'Apply Custom Discounts', o: true, m: true, c: true, a: false },
                      { cap: 'View Net Profit & Financials', o: true, m: false, c: false, a: true },
                      { cap: 'Cancel or Void Invoices', o: true, m: true, c: false, a: false },
                      { cap: 'Switch 12 Business Profiles', o: true, m: false, c: false, a: false }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-navy-900/40">
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">{row.cap}</td>
                        <td className="py-2.5 px-3 text-center">{row.o ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                        <td className="py-2.5 px-3 text-center">{row.m ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                        <td className="py-2.5 px-3 text-center">{row.c ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                        <td className="py-2.5 px-3 text-center">{row.a ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 14: 12 BUSINESS PROFILES & STORE SETTINGS
          ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Business Configuration & 12 Industry Profiles
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Adapt invoice numbering, tax calculation policies, and switch industry catalogs.
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Choose Industry Profile</span>
                </button>
              </div>

              {/* Current Store Details Form */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-2">
                  Active Store Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Business / Shop Name</label>
                    <input
                      type="text"
                      value={selectedStore?.name || ''}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Industry Category</label>
                    <input
                      type="text"
                      value={selectedStore?.category || 'Universal'}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-bold text-violet-600 dark:text-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={selectedStore?.gstNumber || '07AAAAA0000A1Z5'}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">UPI VPA for QR Invoicing</label>
                    <input
                      type="text"
                      value={selectedStore?.upiId || 'shop@upi'}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-mono text-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 15: HELP & KEYBOARD SHORTCUTS
          ========================================================================= */}
          {activeTab === 'help' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Help, Shortcuts & Speech Guide
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Master voice commands and keyboard shortcuts for lightning-fast counter billing.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-card-soft space-y-4">
                <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400">Voice Billing Shortcuts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
                    <strong>Ctrl + B:</strong> Jump immediately to Voice Billing workspace
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
                    <strong>Ctrl + M:</strong> Jump to Manual Touch POS screen
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
                    <strong>Ctrl + K:</strong> Instant focus on product search
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
                    <strong>Esc:</strong> Close any open modal / receipt preview
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. MODALS & PREVIEWS */}

      {/* 12 Industry Profile Selector Modal */}
      <TemplateSelectorModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        currentCategory={selectedStore?.category}
        onApplyTemplate={handleApplyTemplate}
        isLoading={templateLoading}
      />

      {/* Help & Shortcuts Modal */}
      <HelpShortcutsModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Receipt Preview Modal (Thermal & A4) */}
      {receiptInvoice && (
        <ThermalReceipt
          invoice={receiptInvoice}
          store={selectedStore}
          onClose={() => setReceiptInvoice(null)}
          onNewBill={() => {
            setReceiptInvoice(null);
            setActiveTab('billing');
          }}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Operating Expense</h3>
              <button onClick={() => setShowAddExpenseModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
                >
                  {['Rent', 'Utilities', 'Salaries', 'Inventory Purchase', 'Transport', 'Marketing', 'Maintenance', 'Miscellaneous'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Electricity bill for September"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-glow-violet transition mt-2"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Simulator Modal */}
      {showBarcodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="h-4 w-4 text-violet-600" />
                Barcode Scanner & Quick Add
              </h3>
              <button onClick={() => setShowBarcodeModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 pt-3 text-xs">
              <p className="text-slate-500">Tap any sample barcode below to instantly add to bill:</p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {products.filter(p => p.barcode).slice(0, 8).map(p => (
                  <button
                    key={p._id}
                    onClick={() => {
                      addItemToCart(p, 1);
                      addToast(`Scanned: ${p.name}`, 'success');
                      setShowBarcodeModal(false);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-500 text-left flex items-center justify-between"
                  >
                    <span className="font-semibold truncate pr-2">{p.name}</span>
                    <span className="font-mono text-violet-600 font-bold">{p.barcode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-200 pointer-events-auto border ${
              t.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-700 shadow-rose-950/50'
                : t.type === 'warning'
                ? 'bg-amber-900/90 text-amber-100 border-amber-700 shadow-amber-950/50'
                : 'bg-navy-950/95 text-white border-violet-600/50 shadow-glow-violet'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400 min-w-4" />
            ) : t.type === 'warning' ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 min-w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 min-w-4" />
            )}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
