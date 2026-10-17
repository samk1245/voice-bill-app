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
  Store, Package, ShoppingBag, DollarSign, Plus, Edit2, 
  Trash2, ShoppingCart, Loader2, CheckCircle2, ChevronRight,
  Mic, MicOff, Search, Users, Settings, Smartphone, Wifi, WifiOff,
  Sparkles, Send, ArrowRight, Printer, RefreshCw, X, AlertTriangle, 
  Share2, ArrowLeft, Check, UserPlus, CreditCard, Landmark, BookOpen,
  Volume2, VolumeX, Monitor, LayoutGrid, Zap, HelpCircle, ArrowUpRight,
  Palette, Sun, Moon, Flame, Shield, TrendingUp, Award, Layers
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Color Theme: 'cyber' | 'saffron' | 'emerald' | 'light'
  const [currentTheme, setCurrentTheme] = useState('cyber');

  // Mode View: 'pos' (Widescreen Counter) vs 'mobile' (Phone Bezel)
  const [layoutMode, setLayoutMode] = useState('pos');

  // Audio settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [talkbackEnabled, setTalkbackEnabled] = useState(true);

  // Network State
  const [isOffline, setIsOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState([]);

  // Shop state
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(user?.role || 'Owner');

  // Active Bottom Tab: 'billing' | 'inventory' | 'ledger' | 'assistant' | 'settings'
  const [activeTab, setActiveTab] = useState('billing');

  // Unified voice billing states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  // Current Bill cart
  const [cartItems, setCartItems] = useState([]);
  const [cartCustomer, setCartCustomer] = useState(null); // { name, mobile }
  const [cartDiscount, setCartDiscount] = useState(0);
  const [cartTaxRate, setCartTaxRate] = useState(5); // 5% GST
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [changeToReturn, setChangeToReturn] = useState(0);

  // POS Touch Bar Category filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Ambiguity / Clarification state
  const [clarifications, setClarifications] = useState([]);
  const [showClarificationModal, setShowClarificationModal] = useState(false);

  // Generated Invoice for review
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Inventory forms
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', stock: '', unit: 'packet', category: 'General', lowStockAlertLimit: 10
  });
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  // Customer ledger states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPayUdhaarModal, setShowPayUdhaarModal] = useState(false);
  const [payUdhaarAmount, setPayUdhaarAmount] = useState('');
  const [payUdhaarMode, setPayUdhaarMode] = useState('Cash');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', mobile: '' });
  const [showWhatsAppReminderModal, setShowWhatsAppReminderModal] = useState(false);
  const [reminderTone, setReminderTone] = useState('polite'); // 'polite' | 'standard' | 'urgent'

  // Assistant chatbot states
  const [assistantMessages, setAssistantMessages] = useState([
    { sender: 'assistant', text: 'Namaste! Main aapka VoiceBill AI Copilot hoon. Aaj ki sales, top products, ya low stock alert ke baare mein poocho.', type: 'text' }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantChartData, setAssistantChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');

  // Web Speech Recognition ref
  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const waveformRef = useRef(null);
  const canvasAnimationRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStores();
  }, [user]);

  useEffect(() => {
    if (selectedStore) {
      fetchStoreData(selectedStore._id);
    }
  }, [selectedStore, isOffline]);

  useEffect(() => {
    if (!isOffline && syncQueue.length > 0) {
      syncOfflineData();
    }
  }, [isOffline]);

  // Speech Recognition initialization
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
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setLiveTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [selectedStore]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      startWaveformAnimation();
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
      cancelAnimationFrame(canvasAnimationRef.current);
      if (liveTranscript) {
        triggerVoiceCommand(liveTranscript);
        setLiveTranscript('');
      }
    }
    return () => {
      clearInterval(recordingTimerRef.current);
      cancelAnimationFrame(canvasAnimationRef.current);
    };
  }, [isRecording]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stores/my-stores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setStores(data);
        setSelectedStore(data[0]);
      } else {
        const fallbackStore = {
          _id: 'store_apna_kirana',
          name: 'Apna Kirana Store',
          category: 'Kirana/Grocery',
          preferredLanguage: 'Hinglish',
          address: 'Rohini Sector 4, New Delhi',
          upiId: 'apnakirana@okaxis',
          gstNumber: '07AAAAA1111A1Z1'
        };
        setStores([fallbackStore]);
        setSelectedStore(fallbackStore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreData = async (storeId) => {
    if (isOffline) {
      const cachedProducts = localStorage.getItem(`products_${storeId}`);
      const cachedCustomers = localStorage.getItem(`customers_${storeId}`);
      const cachedBills = localStorage.getItem(`bills_${storeId}`);

      if (cachedProducts) setProducts(JSON.parse(cachedProducts));
      if (cachedCustomers) setCustomers(JSON.parse(cachedCustomers));
      if (cachedBills) setBills(JSON.parse(cachedBills));
      return;
    }

    try {
      setLoading(true);
      const prodRes = await fetch(`/api/products/store/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodRes.ok) {
        setProducts(prodData);
        localStorage.setItem(`products_${storeId}`, JSON.stringify(prodData));
      }

      const custRes = await fetch(`/api/orders/customers/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const custData = await custRes.json();
      if (custRes.ok) {
        setCustomers(custData);
        localStorage.setItem(`customers_${storeId}`, JSON.stringify(custData));
      }

      const billRes = await fetch(`/api/orders/store/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const billData = await billRes.json();
      if (billRes.ok) {
        setBills(billData);
        localStorage.setItem(`bills_${storeId}`, JSON.stringify(billData));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineData = async () => {
    setLoading(true);
    let successCount = 0;
    for (const action of syncQueue) {
      try {
        const res = await fetch(action.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(action.body)
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error(err);
      }
    }
    setSyncQueue([]);
    if (selectedStore) {
      await fetchStoreData(selectedStore._id);
    }
    setLoading(false);
    if (soundEnabled) playSuccessChime();
    alert(`Sync Complete! ${successCount} offline bills & ledger entries synced to cloud.`);
  };

  // Waveform canvas helper
  const startWaveformAnimation = () => {
    const canvas = waveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = 70;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Theme matching stroke
      let strokeColor = '#8b5cf6';
      if (currentTheme === 'saffron') strokeColor = '#f59e0b';
      if (currentTheme === 'emerald') strokeColor = '#10b981';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const sliceWidth = canvas.width / 45;
      let x = 0;

      for (let i = 0; i < 45; i++) {
        const amplitude = Math.sin(i * 0.22 + Date.now() * 0.015) * Math.sin(Date.now() * 0.007) * 24 + 35;
        if (i === 0) ctx.moveTo(x, amplitude);
        else ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      ctx.stroke();
      canvasAnimationRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const toggleRecording = () => {
    if (soundEnabled) playClickSound();

    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          return;
        } catch (err) {
          console.warn('Native speech recognition fallback:', err);
        }
      }
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const presets = [
          "Ramesh ko do kilo chawal, ek kilo cheeni aur paanch biscuit dena",
          "Ek packet Maggi aur do Coke add karo",
          "Parle-G do packet add karo",
          "10 rupaye discount laga do",
          "Customer ne 500 cash diya"
        ];
        const picked = presets[Math.floor(Math.random() * presets.length)];
        triggerVoiceCommand(picked);
      }, 2400);
    }
  };

  const triggerVoiceCommand = async (text) => {
    setSpeechText(text);
    setIsProcessingAI(true);
    setActiveTab('billing');

    if (isOffline) {
      setTimeout(() => {
        const result = parseVoiceCommand(text, products, customers);
        handleNLPResult(result);
        setIsProcessingAI(false);
      }, 350);
    } else {
      try {
        const res = await fetch('/api/nlp/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text, storeId: selectedStore._id })
        });
        const data = await res.json();
        if (res.ok) {
          handleNLPResult(data);
        } else {
          const localRes = parseVoiceCommand(text, products, customers);
          handleNLPResult(localRes);
        }
      } catch (err) {
        const localRes = parseVoiceCommand(text, products, customers);
        handleNLPResult(localRes);
      } finally {
        setIsProcessingAI(false);
      }
    }
  };

  const handleNLPResult = (result) => {
    if (!result) return;

    if (result.intent === 'action') {
      if (result.action === 'clear_cart') {
        setCartItems([]);
        setCartCustomer(null);
        if (soundEnabled) playDeleteSound();
        if (talkbackEnabled) speakVoice('Cart khali kar di gayi hai.');
      } else if (result.action === 'confirm_bill') {
        handleConfirmBill();
      } else if (result.action === 'print_bill') {
        if (generatedInvoice) window.print();
        else handleConfirmBill();
      } else if (result.action === 'whatsapp_share') {
        if (generatedInvoice) {
          window.open(`https://wa.me/?text=Invoice%20${generatedInvoice.invoiceNumber}`, '_blank');
        }
      }
      return;
    }

    if (result.intent === 'remove_item') {
      if (result.productId) {
        removeCartItem(result.productId);
      } else {
        const target = result.productName?.toLowerCase();
        setCartItems(prev => prev.filter(i => !i.name.toLowerCase().includes(target)));
      }
      if (soundEnabled) playDeleteSound();
      if (talkbackEnabled) speakVoice(`${result.productName} hata diya.`);
      return;
    }

    if (result.intent === 'update_qty') {
      setCartItems(prev => prev.map(item => {
        if (item.productId === result.productId || item.name.toLowerCase().includes(result.productName.toLowerCase())) {
          return {
            ...item,
            quantity: result.quantity,
            total: result.quantity * item.price
          };
        }
        return item;
      }));
      if (soundEnabled) playScanBeep();
      if (talkbackEnabled) speakVoice(`${result.productName} quantity ${result.quantity} kar di gayi.`);
      return;
    }

    if (result.intent === 'billing') {
      if (result.customerName) {
        const match = customers.find(c => c.name.toLowerCase() === result.customerName.toLowerCase());
        if (match) setCartCustomer(match);
        else setCartCustomer({ name: result.customerName, mobile: '' });
      }

      if (result.items && result.items.length > 0) {
        if (soundEnabled) playScanBeep();
        setCartItems(prev => {
          const newCart = [...prev];
          result.items.forEach(newItem => {
            const index = newCart.findIndex(item => item.productId === newItem.productId);
            if (index > -1) {
              newCart[index].quantity += newItem.quantity;
              newCart[index].total = newCart[index].quantity * newCart[index].price;
            } else {
              newCart.push(newItem);
            }
          });
          return newCart;
        });

        if (talkbackEnabled) {
          const names = result.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(' aur ');
          speakVoice(`${names} add ho gaya.`);
        }
      }

      if (result.clarifications && result.clarifications.length > 0) {
        setClarifications(result.clarifications);
        setShowClarificationModal(true);
        if (talkbackEnabled) speakVoice('Kripya size select karein.');
      }
    }

    else if (result.intent === 'payment') {
      setPaymentMethod(result.paymentMethod || 'Cash');
      if (result.cashReceived) {
        setCashReceived(result.cashReceived);
        calculateChange(result.cashReceived);
        if (talkbackEnabled) {
          const change = Math.max(0, result.cashReceived - cartTotal);
          speakVoice(`Cash mila ₹${result.cashReceived}. Wapas karein ₹${change}.`);
        }
      }
    }

    else if (result.intent === 'discount') {
      setCartDiscount(result.discount);
      if (soundEnabled) playScanBeep();
      if (talkbackEnabled) speakVoice(`₹${result.discount} discount lagaya.`);
    }

    else if (result.intent === 'credit') {
      setPaymentMethod('Credit/Udhaar');
      const match = customers.find(c => c.name.toLowerCase().includes(result.customerName.toLowerCase()));
      if (match) setCartCustomer(match);
      else setCartCustomer({ name: result.customerName, mobile: '' });

      if (talkbackEnabled) speakVoice(`${result.customerName} ke khate mein ₹${result.amount} udhaar likha gaya.`);
      alert(`Parsed Udhaar: ₹${result.amount} credit for ${result.customerName}`);
    }

    else if (result.intent === 'add_product') {
      setProductForm({
        name: result.product.name,
        price: result.product.price,
        stock: result.product.stock,
        unit: result.product.unit || 'packet',
        category: 'General',
        lowStockAlertLimit: 10
      });
      setEditingProduct(null);
      setShowProductModal(true);
    }

    else if (result.intent === 'add_customer') {
      setNewCustomerForm({
        name: result.customer.name,
        mobile: result.customer.mobile || ''
      });
      setShowAddCustomerModal(true);
    }

    else if (result.intent === 'sales_query') {
      handleAssistantQuery(result.salesIntent);
    }
  };

  const selectAmbiguousProduct = (option, quantity, index) => {
    if (soundEnabled) playScanBeep();
    setCartItems(prev => {
      const newCart = [...prev];
      const existingIdx = newCart.findIndex(item => item.productId === option.productId);
      if (existingIdx > -1) {
        newCart[existingIdx].quantity += quantity;
        newCart[existingIdx].total = newCart[existingIdx].quantity * newCart[existingIdx].price;
      } else {
        newCart.push({
          productId: option.productId,
          name: option.name,
          price: option.price,
          quantity,
          unit: option.unit,
          total: option.price * quantity
        });
      }
      return newCart;
    });

    setClarifications(prev => prev.filter((_, idx) => idx !== index));
    if (clarifications.length <= 1) {
      setShowClarificationModal(false);
    }
    if (talkbackEnabled) speakVoice(`${option.name} add ho gaya.`);
  };

  const addNewProductFromAmbiguity = (name, quantity, index) => {
    setProductForm({
      name,
      price: '',
      stock: quantity || 10,
      unit: 'packet',
      category: 'General',
      lowStockAlertLimit: 10
    });
    setEditingProduct(null);
    setShowProductModal(true);
    setClarifications(prev => prev.filter((_, idx) => idx !== index));
    if (clarifications.length <= 1) {
      setShowClarificationModal(false);
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const cartTax = parseFloat(((cartSubtotal - cartDiscount) * (cartTaxRate / 100)).toFixed(2));
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax);

  const calculateChange = (cash) => {
    const cashVal = parseFloat(cash);
    if (!isNaN(cashVal)) {
      setChangeToReturn(Math.max(0, cashVal - cartTotal));
    }
  };

  const updateCartQty = (productId, change) => {
    if (soundEnabled) playClickSound();
    setCartItems(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      });
    });
  };

  const removeCartItem = (productId) => {
    if (soundEnabled) playDeleteSound();
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleQuickAddProduct = (p) => {
    if (soundEnabled) playScanBeep();
    setCartItems(prev => {
      const newCart = [...prev];
      const idx = newCart.findIndex(item => item.productId === p._id);
      if (idx > -1) {
        newCart[idx].quantity += 1;
        newCart[idx].total = newCart[idx].quantity * newCart[idx].price;
      } else {
        newCart.push({
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: 1,
          unit: p.unit,
          total: p.price
        });
      }
      return newCart;
    });
    if (talkbackEnabled) speakVoice(`${p.name} add kiya.`);
  };

  const handleConfirmBill = async () => {
    if (cartItems.length === 0) return;

    const payload = {
      storeId: selectedStore._id,
      customerName: cartCustomer ? cartCustomer.name : 'Cash Customer',
      customerMobile: cartCustomer ? cartCustomer.mobile : '',
      items: cartItems,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      tax: cartTax,
      totalAmount: cartTotal,
      paymentMethod,
      cashReceived: cashReceived || 0,
      changeReturn: changeToReturn || 0
    };

    if (isOffline) {
      const mockId = `orde_${Math.random().toString(36).substr(2, 9)}`;
      const offlineBill = {
        _id: mockId,
        invoiceNumber: `VB-${1001 + bills.length} (Offline)`,
        createdAt: new Date().toISOString(),
        ...payload
      };

      const updatedBills = [offlineBill, ...bills];
      setBills(updatedBills);
      localStorage.setItem(`bills_${selectedStore._id}`, JSON.stringify(updatedBills));

      const updatedProducts = products.map(p => {
        const itemInCart = cartItems.find(item => item.productId === p._id);
        if (itemInCart) {
          return { ...p, stock: Math.max(0, (p.stock || 0) - itemInCart.quantity) };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem(`products_${selectedStore._id}`, JSON.stringify(updatedProducts));

      if (paymentMethod === 'Credit/Udhaar') {
        const updatedCusts = customers.map(c => {
          if (c.name.toLowerCase() === payload.customerName.toLowerCase()) {
            return {
              ...c,
              pendingCredit: (c.pendingCredit || 0) + cartTotal,
              ledger: [
                ...(c.ledger || []),
                {
                  type: 'credit',
                  amount: cartTotal,
                  description: `Invoice #${offlineBill.invoiceNumber} (Offline)`,
                  date: new Date().toISOString()
                }
              ]
            };
          }
          return c;
        });
        setCustomers(updatedCusts);
        localStorage.setItem(`customers_${selectedStore._id}`, JSON.stringify(updatedCusts));
      }

      setSyncQueue(prev => [...prev, { url: '/api/orders/create', body: payload }]);
      setGeneratedInvoice(offlineBill);

      if (soundEnabled) playSuccessChime();
      if (talkbackEnabled) speakVoice(`₹${cartTotal} ka bill generate ho gaya.`);

      setCartItems([]);
      setCartCustomer(null);
      setCartDiscount(0);
      setCashReceived('');
      setChangeToReturn(0);
    } else {
      try {
        setLoading(true);
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setGeneratedInvoice(data);
          fetchStoreData(selectedStore._id);

          if (soundEnabled) playSuccessChime();
          if (talkbackEnabled) speakVoice(`₹${cartTotal} ka bill generate ho gaya.`);

          setCartItems([]);
          setCartCustomer(null);
          setCartDiscount(0);
          setCashReceived('');
          setChangeToReturn(0);
        } else {
          alert(data.message || 'Error creating bill');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      const mockId = editingProduct ? editingProduct._id : `prod_${Math.random().toString(36).substr(2, 9)}`;
      const payload = {
        _id: mockId,
        storeId: selectedStore._id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        unit: productForm.unit,
        category: productForm.category,
        lowStockAlertLimit: parseInt(productForm.lowStockAlertLimit)
      };

      let updatedProds;
      if (editingProduct) {
        updatedProds = products.map(p => p._id === editingProduct._id ? payload : p);
      } else {
        updatedProds = [payload, ...products];
      }

      setProducts(updatedProds);
      localStorage.setItem(`products_${selectedStore._id}`, JSON.stringify(updatedProds));
      setShowProductModal(false);
      if (soundEnabled) playSuccessChime();
      return;
    }

    try {
      setLoading(true);
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products/add';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: selectedStore._id,
          ...productForm
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowProductModal(false);
        fetchStoreData(selectedStore._id);
        if (soundEnabled) playSuccessChime();
      } else {
        alert(data.message || 'Error saving product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (isOffline) {
      const updated = products.filter(p => p._id !== id);
      setProducts(updated);
      localStorage.setItem(`products_${selectedStore._id}`, JSON.stringify(updated));
      if (soundEnabled) playDeleteSound();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (soundEnabled) playDeleteSound();
        fetchStoreData(selectedStore._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanSubmit = (e) => {
    e.preventDefault();
    if (!barcodeSearch) return;

    let targetId = null;
    if (barcodeSearch === '111') targetId = 'prod_rice';
    else if (barcodeSearch === '222') targetId = 'prod_maggi';
    else if (barcodeSearch === '333') targetId = 'prod_coke';
    else if (barcodeSearch === '444') targetId = 'prod_parleg_50g';

    const matchProd = products.find(p => p._id === targetId || p.name.toLowerCase().includes(barcodeSearch.toLowerCase()));
    
    if (matchProd) {
      if (soundEnabled) playScanBeep();
      handleQuickAddProduct(matchProd);
      setBarcodeSearch('');
      setShowBarcodeModal(false);
      setActiveTab('billing');
    } else {
      alert(`No product matches barcode "${barcodeSearch}".`);
    }
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomerForm.name) return;

    if (isOffline) {
      const mockId = `cust_${Math.random().toString(36).substr(2, 9)}`;
      const newCust = {
        _id: mockId,
        storeId: selectedStore._id,
        name: newCustomerForm.name,
        mobile: newCustomerForm.mobile,
        pendingCredit: 0,
        ledger: []
      };

      const updated = [newCust, ...customers];
      setCustomers(updated);
      localStorage.setItem(`customers_${selectedStore._id}`, JSON.stringify(updated));
      setNewCustomerForm({ name: '', mobile: '' });
      setShowAddCustomerModal(false);
      if (soundEnabled) playSuccessChime();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders/customer/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId: selectedStore._id,
          name: newCustomerForm.name,
          mobile: newCustomerForm.mobile
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewCustomerForm({ name: '', mobile: '' });
        setShowAddCustomerModal(false);
        fetchStoreData(selectedStore._id);
        if (soundEnabled) playSuccessChime();
      } else {
        alert(data.message || 'Failed to add customer');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayUdhaar = async (e) => {
    e.preventDefault();
    if (!payUdhaarAmount || !selectedCustomer) return;

    const payload = {
      storeId: selectedStore._id,
      customerId: selectedCustomer._id,
      amount: parseFloat(payUdhaarAmount),
      paymentMode: payUdhaarMode
    };

    if (isOffline) {
      const payVal = parseFloat(payUdhaarAmount);
      const updatedCusts = customers.map(c => {
        if (c._id === selectedCustomer._id) {
          const newPending = Math.max(0, (c.pendingCredit || 0) - payVal);
          return {
            ...c,
            pendingCredit: newPending,
            ledger: [
              ...(c.ledger || []),
              {
                type: 'payment',
                amount: payVal,
                description: `Payment received via ${payUdhaarMode} (Offline)`,
                date: new Date().toISOString()
              }
            ]
          };
        }
        return c;
      });
      setCustomers(updatedCusts);
      localStorage.setItem(`customers_${selectedStore._id}`, JSON.stringify(updatedCusts));
      setSelectedCustomer(updatedCusts.find(c => c._id === selectedCustomer._id));
      setSyncQueue(prev => [...prev, { url: '/api/orders/pay-udhaar', body: payload }]);
      setPayUdhaarAmount('');
      setShowPayUdhaarModal(false);
      if (soundEnabled) playSuccessChime();
      if (talkbackEnabled) speakVoice(`₹${payVal} payment jama ho gaya.`);
    } else {
      try {
        setLoading(true);
        const res = await fetch('/api/orders/pay-udhaar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setPayUdhaarAmount('');
          setShowPayUdhaarModal(false);
          await fetchStoreData(selectedStore._id);
          setSelectedCustomer(prev => {
            const fresh = customers.find(c => c._id === prev._id);
            return fresh || prev;
          });
          if (soundEnabled) playSuccessChime();
          if (talkbackEnabled) speakVoice('Payment successfully recorded.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssistantQuery = (intent) => {
    let responseText = '';
    let chartData = null;

    if (intent === 'today_sales') {
      const todayTotal = bills.reduce((acc, b) => acc + b.totalAmount, 0);
      responseText = `Aaj ki total sale ₹${todayTotal} hui hai (${bills.length} orders total).`;
      chartData = bills.map((b) => ({
        name: b.invoiceNumber,
        Amount: b.totalAmount
      }));
      setChartType('bar');
    } else if (intent === 'top_products') {
      responseText = `Is hafte Basmati Rice aur Maggi sabse zyada bike hain!`;
      chartData = [
        { name: 'Basmati Rice', Sales: 450 },
        { name: 'Maggi Noodles', Sales: 280 },
        { name: 'Coca Cola', Sales: 160 },
        { name: 'Tata Salt', Sales: 120 }
      ];
      setChartType('bar');
    } else if (intent === 'low_stock') {
      const lowStockList = products.filter(p => p.stock <= p.lowStockAlertLimit);
      if (lowStockList.length > 0) {
        responseText = `⚠️ In products ka stock kam hai: ${lowStockList.map(p => `${p.name} (${p.stock} units)`).join(', ')}.`;
        chartData = lowStockList.map(p => ({
          name: p.name,
          Quantity: p.stock,
          Limit: p.lowStockAlertLimit
        }));
      } else {
        responseText = `Aapke sabhi products ka stock safe zone mein hai!`;
      }
      setChartType('bar');
    } else if (intent === 'compare_sales') {
      responseText = `Kal ki sale ke mukable aaj sale 24% zyada rahi hai! 🚀`;
      chartData = [
        { name: 'Kal (Yesterday)', Sales: 1800 },
        { name: 'Aaj (Today)', Sales: 2232 }
      ];
      setChartType('bar');
    } else if (intent === 'profit') {
      responseText = `Aapka computed gross profit margin ~18.5% hai (₹1,480 net profit estimate).`;
      chartData = [
        { name: 'Cost of Goods', Amount: 3200 },
        { name: 'Estimated Profit', Amount: 1480 }
      ];
      setChartType('bar');
    }

    setAssistantMessages(prev => [
      ...prev,
      { sender: 'user', text: assistantInput || 'Voice Query', type: 'text' },
      { sender: 'assistant', text: responseText, type: 'text' }
    ]);
    setAssistantInput('');
    if (chartData) {
      setAssistantChartData(chartData);
    }
    if (talkbackEnabled) speakVoice(responseText);
  };

  const handleAssistantSend = (e) => {
    e.preventDefault();
    if (!assistantInput) return;
    const txt = assistantInput.toLowerCase();
    
    let intent = 'general';
    if (txt.includes('aaj') || txt.includes('today') || txt.includes('sale')) intent = 'today_sales';
    if (txt.includes('kam') || txt.includes('stock') || txt.includes('low')) intent = 'low_stock';
    if (txt.includes('hafta') || txt.includes('week') || txt.includes('bika') || txt.includes('most')) intent = 'top_products';
    if (txt.includes('kal') || txt.includes('yesterday')) intent = 'compare_sales';
    if (txt.includes('profit') || txt.includes('kamai')) intent = 'profit';

    handleAssistantQuery(intent);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Grains', 'Packaged Foods', 'Beverages', 'Condiments', 'Personal Care'];

  // WhatsApp reminder message builder
  const buildWhatsAppReminderUrl = (customer) => {
    let msg = '';
    if (reminderTone === 'polite') {
      msg = `🙏 *सादर प्रणाम ${customer.name} ji*\n` +
            `Yeh *${selectedStore?.name}* ki taraf se vinamra sandesh hai.\n` +
            `Aapka pichhla baki udhaar: *₹${customer.pendingCredit}* hai.\n` +
            (selectedStore?.upiId ? `Kripya suvidha anusar UPI dwara bhugtan karein:\n📲 *${selectedStore.upiId}*\n\n` : '') +
            `Dhanyawad! Apka din shubh ho! 💐`;
    } else if (reminderTone === 'urgent') {
      msg = `⚠️ *Zaroori Suchna - ${selectedStore?.name}*\n` +
            `Shri *${customer.name}*, aapka baki udhaar *₹${customer.pendingCredit}* kripya aaj hi clear karne ka kasht karein.\n` +
            `UPI: *${selectedStore?.upiId}*\nDhanyawad.`;
    } else {
      msg = `Namaste ${customer.name} ji, *${selectedStore?.name}* se aapka ₹${customer.pendingCredit} ka udhaar balance pending hai. Kripya UPI (${selectedStore?.upiId}) dwara payment karein. Dhanyawad!`;
    }
    return `https://wa.me/91${customer.mobile}?text=${encodeURIComponent(msg)}`;
  };

  const voicePresets = [
    { label: '🛒 "Ramesh ko 2 kilo chawal aur 5 biscuit dena"', text: 'Ramesh ko do kilo chawal, ek kilo cheeni aur paanch biscuit dena' },
    { label: '🍜 "1 packet Maggi aur 2 Coke add karo"', text: 'Ek packet Maggi aur do Coke add karo' },
    { label: '⚠️ "Parle-G add karo" (Ambiguity Trigger)', text: 'Parle-G do packet add karo' },
    { label: '💵 "Customer ne 500 cash diya"', text: 'Customer ne 500 cash diya' },
    { label: '💳 "Ramesh ne 1000 rupaye udhaar liye"', text: 'Ramesh ne 1000 rupaye udhaar liye' },
    { label: '✂️ "Chawal hata do" (Voice Delete)', text: 'Chawal hata do' },
    { label: '⚡ "10 rupaye discount laga do"', text: '10 rupaye discount laga do' },
    { label: '📊 "Aaj ki sale kitni hui?"', text: 'Aaj ki sale kitni hui?' }
  ];

  // Theme styling helpers
  const getThemeBg = () => {
    if (currentTheme === 'saffron') return 'bg-[#0b0c16]';
    if (currentTheme === 'emerald') return 'bg-[#050e0a]';
    if (currentTheme === 'light') return 'bg-slate-100 text-slate-900';
    return 'bg-[#070a12]'; // cyber default
  };

  const getAccentGrad = () => {
    if (currentTheme === 'saffron') return 'from-amber-500 via-orange-500 to-rose-500';
    if (currentTheme === 'emerald') return 'from-emerald-500 via-teal-500 to-cyan-500';
    if (currentTheme === 'light') return 'from-indigo-600 via-blue-600 to-cyan-500';
    return 'from-violet-600 via-purple-500 to-cyan-400';
  };

  return (
    <div className={`min-h-screen ${getThemeBg()} flex flex-col font-sans select-none transition-colors duration-300 theme-${currentTheme}`}>
      
      {/* ========================================================================= */}
      {/* ULTRA-MODERN HEADER BAR                                                   */}
      {/* ========================================================================= */}
      <header className="bg-slate-900/80 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
        
        {/* Brand & Store Selector */}
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl bg-gradient-to-tr ${getAccentGrad()} text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/20`}>
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">VoiceBill AI</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO 2.5
              </span>
            </div>
            {/* Store dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Store className="h-3 w-3 text-cyan-400" />
              <select
                value={selectedStore ? selectedStore._id : ''}
                onChange={(e) => {
                  const match = stores.find(s => s._id === e.target.value);
                  if (match) setSelectedStore(match);
                }}
                className="bg-transparent font-bold text-slate-200 outline-none cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
              >
                {stores.map(store => (
                  <option key={store._id} value={store._id} className="bg-slate-900 text-white">{store.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center: Live Stats Ticker (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 px-5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Today's Sales</span>
              <span className="font-black text-white text-sm">₹{bills.reduce((acc, b) => acc + b.totalAmount, 0)}</span>
            </div>
          </div>
          <div className="h-7 w-px bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Udhaar Khata</span>
            <span className="font-black text-rose-400 text-sm">₹{customers.reduce((acc, c) => acc + (c.pendingCredit || 0), 0)}</span>
          </div>
          <div className="h-7 w-px bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoices</span>
            <span className="font-black text-cyan-400 text-sm">{bills.length}</span>
          </div>
        </div>

        {/* Right Tools Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Creative Theme Picker */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setCurrentTheme('cyber')}
              title="Cyber Neon Violet & Cyan"
              className={`h-6 w-6 rounded-xl flex items-center justify-center transition-all ${currentTheme === 'cyber' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50 scale-105' : 'text-slate-400 hover:text-white'}`}
            >
              🌌
            </button>
            <button
              onClick={() => setCurrentTheme('saffron')}
              title="Kirana Gold & Saffron"
              className={`h-6 w-6 rounded-xl flex items-center justify-center transition-all ${currentTheme === 'saffron' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50 scale-105' : 'text-slate-400 hover:text-white'}`}
            >
              🌅
            </button>
            <button
              onClick={() => setCurrentTheme('emerald')}
              title="Mint Jade Oasis"
              className={`h-6 w-6 rounded-xl flex items-center justify-center transition-all ${currentTheme === 'emerald' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 scale-105' : 'text-slate-400 hover:text-white'}`}
            >
              🌿
            </button>
            <button
              onClick={() => setCurrentTheme('light')}
              title="Crisp Daylight Mode"
              className={`h-6 w-6 rounded-xl flex items-center justify-center transition-all ${currentTheme === 'light' ? 'bg-white text-slate-900 shadow-lg scale-105' : 'text-slate-400 hover:text-white'}`}
            >
              ☀️
            </button>
          </div>

          {/* Sound & Talkback */}
          <button
            onClick={() => {
              setTalkbackEnabled(!talkbackEnabled);
              if (!talkbackEnabled) speakVoice('Voice talkback active.');
            }}
            title={talkbackEnabled ? 'Voice talkback active' : 'Voice talkback muted'}
            className={`p-2 rounded-2xl border text-xs flex items-center gap-1 transition-all ${
              talkbackEnabled
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : 'bg-white/5 text-slate-500 border-white/5'
            }`}
          >
            {talkbackEnabled ? <Volume2 className="h-4 w-4 text-purple-400" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Offline / Online toggle */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isOffline
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Layout Mode Switch (Mobile Phone vs POS Widescreen) */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setLayoutMode('pos')}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                layoutMode === 'pos' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Counter POS
            </button>
            <button
              onClick={() => setLayoutMode('mobile')}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                layoutMode === 'mobile' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Phone View
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => dispatch(logout())}
            className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/25 px-3 py-1.5 rounded-2xl font-bold"
          >
            Logout
          </button>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT (WIDESCREEN COUNTER vs PHONE PREVIEW)                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {layoutMode === 'pos' ? (
          /* ===================================================================== */
          /* 1. COUNTER POS WIDESCREEN WORKSPACE                                    */
          /* ===================================================================== */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 sm:p-5 gap-4">
            
            {/* LEFT COLUMN: GLOWING AI ORB, LIVE SPEECH, & PRODUCT CATALOG */}
            <div className="w-full lg:w-5/12 flex flex-col gap-4 overflow-y-auto">
              
              {/* Ethereal AI Voice Terminal Card */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[32px] p-5 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                
                {/* Glowing Aura Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-violet-600/20 to-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-center mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Voice Commander
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-400'
                  }`}>
                    {isRecording ? `RECORDING 0:0${recordingTime}` : 'STANDBY'}
                  </span>
                </div>

                {/* Glowing AI Voice Orb */}
                <div className="flex flex-col items-center justify-center my-3 relative z-10">
                  <div className="relative inline-flex items-center justify-center p-4">
                    {/* Pulsing halo */}
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/30 via-cyan-500/30 to-emerald-500/30 blur-xl animate-pulse" />
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`relative z-10 h-24 w-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all active:scale-95 group ${
                        isRecording 
                          ? 'bg-gradient-to-tr from-rose-600 to-orange-500 shadow-rose-500/40 animate-pulse' 
                          : 'bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-500 shadow-purple-500/30 hover:shadow-cyan-500/40 hover:scale-105'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="h-10 w-10 animate-bounce" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Mic className="h-10 w-10 group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                    </button>
                  </div>

                  <span className="text-xs font-extrabold text-white mt-1">
                    {isRecording ? 'Listening to speech...' : 'Tap Orb to Speak'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    "Ramesh ko 2 kilo chawal dena"
                  </span>
                </div>

                {/* Live Audio Waveform Canvas */}
                {isRecording && (
                  <div className="my-2 bg-slate-950/70 rounded-2xl p-2 border border-white/5 relative z-10">
                    <canvas ref={waveformRef} className="w-full h-11" />
                  </div>
                )}

                {/* Live Transcript / Speech bubble */}
                {(liveTranscript || speechText) && (
                  <div className="bg-slate-950/90 border border-purple-500/25 rounded-2xl p-3.5 mt-2 relative z-10">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                      Live Transcription
                    </span>
                    <p className="text-xs text-slate-200 font-medium italic">
                      "{liveTranscript || speechText}"
                    </p>
                  </div>
                )}

                {isProcessingAI && (
                  <div className="flex items-center gap-2 justify-center text-xs text-cyan-300 font-bold mt-2 animate-pulse relative z-10">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Parsing products, quantities & units...</span>
                  </div>
                )}
              </div>

              {/* Kirana Catalog with Category Tabs */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[32px] p-5 space-y-3.5 backdrop-blur-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-amber-400" /> Fast Touch Shelf
                  </span>
                  <button
                    onClick={() => setShowBarcodeModal(true)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg"
                  >
                    <Smartphone className="h-3 w-3" /> Barcode Scanner
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Product Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search Basmati, Maggi, Parle..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input text-white"
                  />
                </div>

                {/* Product Touch Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {filteredProducts.map(p => (
                    <button
                      key={p._id}
                      onClick={() => handleQuickAddProduct(p)}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 hover:border-purple-500/30 hover:bg-slate-850 text-left transition-all active:scale-95 group flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-purple-300">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500">{p.unit}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-emerald-400 font-black text-xs">₹{p.price}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          p.stock <= p.lowStockAlertLimit ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-400'
                        }`}>
                          {p.stock}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Testing Voice Preset Chips */}
              <div className="bg-slate-900/60 border border-white/10 rounded-[32px] p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  Testing Presets (One-Click)
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                  {voicePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerVoiceCommand(preset.text)}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-violet-500/10 text-left text-xs text-slate-300 font-medium border border-white/5 hover:border-violet-500/30 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{preset.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* CENTER/RIGHT COLUMN: LIVE BILL TAPE & REAL-TIME CHECKOUT LEDGER */}
            <div className="w-full lg:w-7/12 flex flex-col gap-4 overflow-y-auto">
              
              {/* POS Cart Container */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[32px] p-5 shadow-2xl flex-1 flex flex-col backdrop-blur-xl">
                
                {/* Cart Top Ribbon */}
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base">Active Register Tape</h3>
                      <span className="text-[10px] text-slate-400">
                        {cartItems.length} items listed
                      </span>
                    </div>
                  </div>

                  {cartItems.length > 0 && (
                    <button
                      onClick={() => {
                        setCartItems([]);
                        setCartCustomer(null);
                        if (soundEnabled) playDeleteSound();
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl"
                    >
                      Clear Bill
                    </button>
                  )}
                </div>

                {/* Customer Pill if identified */}
                {cartCustomer && (
                  <div className="bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 border border-purple-500/20 px-3.5 py-2 rounded-2xl flex justify-between items-center text-xs my-2.5">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-slate-300">Customer: <strong className="text-white font-bold">{cartCustomer.name}</strong></span>
                    </div>
                    {cartCustomer.mobile && (
                      <span className="text-slate-400 font-mono text-[11px]">{cartCustomer.mobile}</span>
                    )}
                  </div>
                )}

                {/* Cart Table Items */}
                <div className="flex-1 overflow-y-auto my-3 space-y-2 min-h-[170px]">
                  {cartItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs italic gap-2">
                      <ShoppingBag className="h-8 w-8 text-slate-700" />
                      <span>Empty bill tape. Tap the microphone or touch products to add.</span>
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-xs hover:border-purple-500/25 transition-all"
                      >
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-white block">{item.name}</span>
                          <span className="text-[10px] text-slate-400">₹{item.price} per {item.unit}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Qty Stepper */}
                          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-white/10">
                            <button
                              onClick={() => updateCartQty(item.productId, -1)}
                              className="px-2.5 py-1 text-slate-400 font-black hover:text-white"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold text-white text-xs">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.productId, 1)}
                              className="px-2.5 py-1 text-slate-400 font-black hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-black text-white text-sm min-w-[55px] text-right">
                            ₹{item.total}
                          </span>

                          <button
                            onClick={() => removeCartItem(item.productId)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Savings Pill */}
                {cartDiscount > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/25 py-1.5 px-3 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-amber-400" />
                    <span>Customer Savings: <strong>₹{cartDiscount} off applied!</strong></span>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="bg-slate-950/80 border border-white/10 p-4 rounded-3xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-200 font-bold">₹{cartSubtotal}</span>
                  </div>

                  {/* Fast Discount Buttons */}
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Discount</span>
                    <div className="flex items-center gap-1.5">
                      {[10, 20, 50].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCartDiscount(amt)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                            cartDiscount === amt ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-white/5 border-white/10 text-slate-400'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                      <input
                        type="number"
                        value={cartDiscount}
                        onChange={(e) => setCartDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="bg-slate-900 border border-white/10 rounded-lg w-16 py-0.5 px-1.5 text-right font-bold text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>GST Rate</span>
                    <select
                      value={cartTaxRate}
                      onChange={(e) => setCartTaxRate(parseInt(e.target.value))}
                      className="bg-slate-900 border border-white/10 rounded-lg py-0.5 px-2 font-bold text-white text-xs"
                    >
                      <option value={0}>0% GST</option>
                      <option value={5}>5% GST (Grocery)</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                    </select>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400">
                    <span>GST Tax</span>
                    <span className="text-slate-200 font-bold">₹{cartTax}</span>
                  </div>

                  <div className="border-t border-white/10 pt-2.5 flex justify-between items-center">
                    <span className="text-base font-black text-white">Grand Total</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                      ₹{cartTotal}
                    </span>
                  </div>
                </div>

                {/* Payment Selector & Cash Quick Presets */}
                <div className="mt-3 bg-slate-950/80 border border-white/10 p-4 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Payment Mode
                    </span>
                    <span className="text-xs font-bold text-cyan-400">{paymentMethod}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['Cash', 'UPI', 'Card', 'Credit/Udhaar'].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-1 rounded-2xl text-xs font-bold text-center border transition-all ${
                          paymentMethod === m
                            ? 'bg-gradient-to-r from-violet-600 to-cyan-500 border-transparent text-white shadow-lg'
                            : 'bg-slate-900 border-white/5 hover:bg-slate-850 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Cash' && (
                    <div className="space-y-2 bg-slate-900/90 p-3 rounded-2xl border border-white/5">
                      {/* Cash fast denomination pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                        <span className="text-slate-500 font-bold">Fast Cash:</span>
                        {[cartTotal, 100, 200, 500, 2000].filter(n => n >= cartTotal).slice(0, 4).map((cashVal, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCashReceived(cashVal.toString());
                              calculateChange(cashVal.toString());
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-bold hover:bg-white/10 text-slate-300"
                          >
                            ₹{cashVal}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Cash Received
                          </label>
                          <input
                            type="number"
                            value={cashReceived}
                            onChange={(e) => {
                              setCashReceived(e.target.value);
                              calculateChange(e.target.value);
                            }}
                            placeholder="₹ Given by customer"
                            className="bg-slate-950 border border-white/10 rounded-xl w-full py-1.5 px-3 font-bold text-white text-xs"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Change to Return
                          </span>
                          <span className="block text-base font-black text-amber-400 py-1">
                            ₹{changeToReturn}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instant Print / Bill Confirm Button */}
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={handleConfirmBill}
                  className="mt-3 w-full py-4 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/25 disabled:opacity-40 disabled:pointer-events-none text-sm tracking-wide"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Generate & Print Bill Slip (₹{cartTotal})</span>
                </button>

              </div>

            </div>

          </div>
        ) : (
          /* ===================================================================== */
          /* 2. MOBILE PHONE SIMULATOR SHELL                                       */
          /* ===================================================================== */
          <div className="flex-1 bg-slate-950 flex justify-center items-center py-4 px-2 sm:px-4">
            <div className="w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-[44px] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col max-h-[850px] relative backdrop-blur-2xl">
              
              {/* Phone Status Bar */}
              <div className="px-6 py-3 bg-slate-900 border-b border-white/5 flex justify-between items-center text-xs text-slate-400 font-semibold select-none z-20">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="h-4 w-24 bg-black rounded-full" />
                <div className="flex items-center gap-1.5">
                  {isOffline ? <WifiOff className="h-3.5 w-3.5 text-amber-500" /> : <Wifi className="h-3.5 w-3.5 text-emerald-400" />}
                  <span className="text-[10px]">100%</span>
                </div>
              </div>

              {/* Mobile Viewport Area */}
              <div className="flex-1 overflow-y-auto px-4 py-5 bg-slate-950/60 relative space-y-4">
                
                {/* Voice Orb in Mobile View */}
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 text-center space-y-3 relative overflow-hidden">
                  <div className="relative inline-flex items-center justify-center p-2">
                    {isRecording && (
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`h-18 w-18 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                        isRecording ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-600 to-cyan-500'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-8 w-8 animate-pulse" /> : <Mic className="h-8 w-8" />}
                    </button>
                  </div>
                  <span className="block text-xs font-bold text-white">
                    {isRecording ? 'Listening...' : 'Tap Orb to Voice Bill'}
                  </span>
                  {(liveTranscript || speechText) && (
                    <p className="text-[11px] text-slate-300 italic bg-slate-950 p-2 rounded-xl">
                      "{liveTranscript || speechText}"
                    </p>
                  )}
                </div>

                {/* Mobile Cart Items */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Current Bill ({cartItems.length})</span>
                    <span className="text-emerald-400 font-black">₹{cartTotal}</span>
                  </div>
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.quantity} {item.unit} × ₹{item.price}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">₹{item.total}</span>
                        <button onClick={() => removeCartItem(item.productId)} className="text-rose-400">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleConfirmBill}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs"
                    >
                      Confirm Bill (₹{cartTotal})
                    </button>
                  )}
                </div>

              </div>

              {/* Bottom Phone Bar */}
              <div className="px-6 py-2.5 bg-slate-900 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 select-none z-10">
                <button onClick={() => setLayoutMode('pos')} className="flex flex-col items-center gap-1 text-cyan-400 font-bold">
                  <Monitor className="h-4 w-4" />
                  <span>POS Desktop</span>
                </button>
                <button onClick={() => setShowBarcodeModal(true)} className="flex flex-col items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Scan</span>
                </button>
                <button onClick={() => handleAssistantQuery('today_sales')} className="flex flex-col items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Stats</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SECONDARY SCREENS / DRAWERS: INVENTORY, KHATA LEDGER, AI ASSISTANT        */}
      {/* ========================================================================= */}

      {/* AMBIGUITY CLARIFICATION MODAL */}
      {showClarificationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" /> Multiple Sizes Found
              </span>
              <button onClick={() => setShowClarificationModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Aapke bolne par multiple sizes mile hain. Kripya sahi item chunien:
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {clarifications.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    "{item.searchTerm}" ({item.quantity} units)
                  </span>

                  {item.notFound ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500">Inventory mein nahi mila. Naya product register karein?</p>
                      <button
                        onClick={() => addNewProductFromAmbiguity(item.searchTerm, item.quantity, idx)}
                        className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        + Add "{item.searchTerm}" to Stock
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {item.options.map(option => (
                        <button
                          key={option.productId}
                          onClick={() => selectAmbiguousProduct(option, item.quantity, idx)}
                          className="flex justify-between items-center p-3 rounded-xl bg-slate-900 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 text-xs font-semibold text-slate-200 transition-all"
                        >
                          <span>{option.name}</span>
                          <span className="text-emerald-400 font-bold">₹{option.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BARCODE SCANNER MODAL */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none backdrop-blur-md">
          <form onSubmit={handleBarcodeScanSubmit} className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            
            {/* Animated Red Laser Scan Line */}
            <div className="absolute left-6 right-6 h-0.5 bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-laser pointer-events-none" />

            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-cyan-400" /> Barcode Reader Scanner
              </span>
              <button type="button" onClick={() => setShowBarcodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Scan barcode or enter code to add product instantly:
            </p>

            <input
              type="text"
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              placeholder="111, 222, 333, 444"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-2xl text-white bg-slate-950 border border-white/10 font-mono font-black tracking-widest text-center text-lg focus:border-cyan-400"
            />

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-2xl border border-white/5 space-y-1">
              <span className="font-bold text-cyan-400 block">💡 Test Codes:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('111')}>• "111" - Rice</span>
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('222')}>• "222" - Maggi</span>
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('333')}>• "333" - Coke</span>
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('444')}>• "444" - Parle-G</span>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider">
                Scan Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD/EDIT INVENTORY PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none backdrop-blur-md">
          <form onSubmit={handleProductSubmit} className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Inventory Item'}
              </span>
              <button type="button" onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Tata Salt 1kg"
                  className="w-full px-3 py-2.5 rounded-xl text-white bg-slate-950 border border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="₹ 25"
                    className="w-full px-3 py-2.5 rounded-xl text-white bg-slate-950 border border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-white bg-slate-950 border border-white/10"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Grams)</option>
                    <option value="packet">packet</option>
                    <option value="bottle">bottle</option>
                    <option value="piece">piece</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2.5 rounded-xl text-white bg-slate-950 border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    required
                    value={productForm.lowStockAlertLimit}
                    onChange={(e) => setProductForm({ ...productForm, lowStockAlertLimit: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2.5 rounded-xl text-white bg-slate-950 border border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button type="submit" className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GENERATED INVOICE REVIEW MODAL (THERMAL RECEIPT + GST TAX INVOICE + UPI QR CODE) */}
      {generatedInvoice && (
        <ThermalReceipt
          invoice={generatedInvoice}
          store={selectedStore}
          onClose={() => setGeneratedInvoice(null)}
        />
      )}

    </div>
  );
}
