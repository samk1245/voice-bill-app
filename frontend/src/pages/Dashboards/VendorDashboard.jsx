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
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Store, Package, ShoppingBag, DollarSign, Plus, Edit2, 
  Trash2, ShoppingCart, Loader2, CheckCircle2, ChevronRight,
  Mic, MicOff, Search, Users, Settings, Smartphone, Wifi, WifiOff,
  Sparkles, Send, ArrowRight, Printer, RefreshCw, X, AlertTriangle, 
  Share2, ArrowLeft, Check, UserPlus, CreditCard, Landmark, BookOpen,
  Volume2, VolumeX, Monitor, LayoutGrid, Zap, HelpCircle, ArrowUpRight
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mode View: 'mobile' (Phone Bezel Mockup) vs 'pos' (Full Desktop POS Counter)
  const [layoutMode, setLayoutMode] = useState('pos');

  // Audio & Talkback settings
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

  // Active Bottom Tab: 'home' | 'billing' | 'inventory' | 'ledger' | 'assistant' | 'settings'
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
  const [cartTaxRate, setCartTaxRate] = useState(5); // default 5% GST
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [changeToReturn, setChangeToReturn] = useState(0);

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

  // Assistant chatbot states
  const [assistantMessages, setAssistantMessages] = useState([
    { sender: 'assistant', text: 'Namaste! Main aapka VoiceBill AI assistant hoon. Aaj ki sales ya stock details ke baare mein kuch bhi poochiye.', type: 'text' }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantChartData, setAssistantChartData] = useState(null);

  // Web Speech Recognition ref
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const waveformRef = useRef(null);
  const canvasAnimationRef = useRef(null);

  // Fetch initial profile & stores
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStores();
  }, [user]);

  // Handle active store changes
  useEffect(() => {
    if (selectedStore) {
      fetchStoreData(selectedStore._id);
    }
  }, [selectedStore, isOffline]);

  // Sync offline queue when coming back online
  useEffect(() => {
    if (!isOffline && syncQueue.length > 0) {
      syncOfflineData();
    }
  }, [isOffline]);

  // Initialize Web Speech Recognition
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
        console.warn('Speech recognition error:', event.error);
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

  // Handle speech timer & waveform animation
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
          address: 'Rohini, New Delhi',
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
      console.error('Error fetching store data:', err);
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
        console.error('Sync failed for item:', action, err);
      }
    }
    setSyncQueue([]);
    if (selectedStore) {
      await fetchStoreData(selectedStore._id);
    }
    setLoading(false);
    if (soundEnabled) playSuccessChime();
    alert(`Sync Complete! ${successCount} offline invoices and ledger modifications successfully synced.`);
  };

  // Canvas visualizer with dynamic wave
  const startWaveformAnimation = () => {
    const canvas = waveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = 70;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const sliceWidth = canvas.width / 40;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        const amplitude = Math.sin(i * 0.2 + Date.now() * 0.012) * Math.sin(Date.now() * 0.006) * 22 + 35;
        if (i === 0) ctx.moveTo(x, amplitude);
        else ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      ctx.stroke();
      canvasAnimationRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  // Trigger speech recognition or fallback simulation
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
          console.warn('Native speech recognition unavailable, falling back:', err);
        }
      }
      // Browser fallback simulation if speech recognition not allowed
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const voicePresets = [
          "Ramesh ko do kilo chawal, ek kilo cheeni aur paanch biscuit dena",
          "Ek packet Maggi aur do Coke add karo",
          "Parle-G do packet add karo",
          "10 rupaye discount laga do",
          "Customer ne 500 cash diya",
          "Ramesh ne 500 rupaye udhaar liye"
        ];
        const randomPreset = voicePresets[Math.floor(Math.random() * voicePresets.length)];
        triggerVoiceCommand(randomPreset);
      }, 2500);
    }
  };

  // Execute Voice Command
  const triggerVoiceCommand = async (text) => {
    setSpeechText(text);
    setIsProcessingAI(true);
    setActiveTab('billing');

    if (isOffline) {
      setTimeout(() => {
        const result = parseVoiceCommand(text, products, customers);
        handleNLPResult(result);
        setIsProcessingAI(false);
      }, 400);
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

  // Process NLP Result
  const handleNLPResult = (result) => {
    if (!result) return;

    // 1. Direct Action Commands
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

    // 2. Item Removal Command
    if (result.intent === 'remove_item') {
      if (result.productId) {
        removeCartItem(result.productId);
      } else {
        const target = result.productName?.toLowerCase();
        setCartItems(prev => prev.filter(i => !i.name.toLowerCase().includes(target)));
      }
      if (soundEnabled) playDeleteSound();
      if (talkbackEnabled) speakVoice(`${result.productName} cart se hata diya gaya hai.`);
      return;
    }

    // 3. Update Quantity Command
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
      if (talkbackEnabled) speakVoice(`${result.productName} quantity ${result.quantity} kar di gayi hai.`);
      return;
    }

    // 4. Core Billing
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
          const itemNames = result.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(' aur ');
          speakVoice(`${itemNames} bill mein add ho gaya.`);
        }
      }

      if (result.clarifications && result.clarifications.length > 0) {
        setClarifications(result.clarifications);
        setShowClarificationModal(true);
        if (talkbackEnabled) speakVoice('Kripya product size select karein.');
      }
    }

    // 5. Payments
    else if (result.intent === 'payment') {
      setPaymentMethod(result.paymentMethod || 'Cash');
      if (result.cashReceived) {
        setCashReceived(result.cashReceived);
        calculateChange(result.cashReceived);
        if (talkbackEnabled) {
          const change = Math.max(0, result.cashReceived - cartTotal);
          speakVoice(`Cash mila ₹${result.cashReceived}. Wapas karne hain ₹${change}.`);
        }
      }
    }

    // 6. Discounts
    else if (result.intent === 'discount') {
      setCartDiscount(result.discount);
      if (soundEnabled) playScanBeep();
      if (talkbackEnabled) speakVoice(`₹${result.discount} ka discount lagaya gaya.`);
    }

    // 7. Credit/Udhaar
    else if (result.intent === 'credit') {
      setPaymentMethod('Credit/Udhaar');
      const match = customers.find(c => c.name.toLowerCase().includes(result.customerName.toLowerCase()));
      if (match) setCartCustomer(match);
      else setCartCustomer({ name: result.customerName, mobile: '' });

      if (talkbackEnabled) speakVoice(`${result.customerName} ke khate mein ₹${result.amount} ka udhaar note kiya gaya.`);
      alert(`Parsed Udhaar: ₹${result.amount} credit allocation for ${result.customerName}`);
    }

    // 8. Add Product
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

    // 9. Add Customer
    else if (result.intent === 'add_customer') {
      setNewCustomerForm({
        name: result.customer.name,
        mobile: result.customer.mobile || ''
      });
      setShowAddCustomerModal(true);
    }

    // 10. Sales Query
    else if (result.intent === 'sales_query') {
      handleAssistantQuery(result.salesIntent);
    }
  };

  // Ambiguity Resolution handler
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

  // Totals calculations
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

  // Quick product addition from touch bar
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

  // Confirm Order / Print Bill
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
          alert(data.message || 'Error processing invoice');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Inventory Save
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

  // Barcode search simulation
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
      alert(`No product matches barcode/search "${barcodeSearch}" in inventory.`);
    }
  };

  // Customer ledger actions
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
      if (talkbackEnabled) speakVoice(`₹${payVal} ka payment record kiya gaya.`);
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
          if (talkbackEnabled) speakVoice(`Payment recorded successfully.`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Assistant Logic
  const handleAssistantQuery = (intent) => {
    let responseText = '';
    let chartData = null;

    if (intent === 'today_sales') {
      const todayTotal = bills.reduce((acc, b) => acc + b.totalAmount, 0);
      responseText = `Aaj ki total sale ₹${todayTotal} hui hai (${bills.length} orders).`;
      chartData = bills.map((b) => ({
        name: b.invoiceNumber,
        Amount: b.totalAmount
      }));
    } else if (intent === 'top_products') {
      responseText = `Is hafte Basmati Rice aur Maggi Noodles sabse zyada bike hain.`;
      chartData = [
        { name: 'Basmati Rice', Sales: 450 },
        { name: 'Maggi Noodles', Sales: 280 },
        { name: 'Coca Cola', Sales: 160 },
        { name: 'Tata Salt', Sales: 120 }
      ];
    } else if (intent === 'low_stock') {
      const lowStockList = products.filter(p => p.stock <= p.lowStockAlertLimit);
      if (lowStockList.length > 0) {
        responseText = `In products ka stock kam hai: ${lowStockList.map(p => `${p.name} (${p.stock} bache)`).join(', ')}.`;
        chartData = lowStockList.map(p => ({
          name: p.name,
          Quantity: p.stock,
          Limit: p.lowStockAlertLimit
        }));
      } else {
        responseText = `Aapke sabhi products ka stock level safe hai!`;
      }
    } else if (intent === 'compare_sales') {
      responseText = `Kal ki sale ke mukable aaj sale 24% zyada rahi hai.`;
      chartData = [
        { name: 'Kal (Yesterday)', Sales: 1800 },
        { name: 'Aaj (Today)', Sales: 2232 }
      ];
    } else if (intent === 'profit') {
      responseText = `Aapka computed gross profit margin 18.5% hai (~₹1,480).`;
      chartData = [
        { name: 'Product Cost', Amount: 3200 },
        { name: 'Gross Profit', Amount: 1480 }
      ];
    } else {
      responseText = `Aap simple terms mein pooch sakte hain, jaise "Aaj ki sale" ya "Stock alert".`;
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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none">
      
      {/* GLOBAL TOP NAVIGATION & CONTROL BAR */}
      <header className="bg-[#0b1120] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        
        {/* Brand & Store Selector */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">VoiceBill AI</span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO POS
              </span>
            </div>
            {/* Store dropdown */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Store className="h-3 w-3 text-emerald-400" />
              <select
                value={selectedStore ? selectedStore._id : ''}
                onChange={(e) => {
                  const match = stores.find(s => s._id === e.target.value);
                  if (match) setSelectedStore(match);
                }}
                className="bg-transparent font-semibold text-slate-200 outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
              >
                {stores.map(store => (
                  <option key={store._id} value={store._id} className="bg-slate-900 text-white">{store.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center: Live Stats Quick Ticker (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 px-4 py-1 rounded-2xl bg-slate-900/80 border border-white/5 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Today's Sales</span>
            <span className="font-black text-white text-sm">₹{bills.reduce((acc, b) => acc + b.totalAmount, 0)}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Udhaar Khata</span>
            <span className="font-black text-red-400 text-sm">₹{customers.reduce((acc, c) => acc + (c.pendingCredit || 0), 0)}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Bills</span>
            <span className="font-black text-emerald-400 text-sm">{bills.length}</span>
          </div>
        </div>

        {/* Right Tools Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sound & Talkback toggles */}
          <button
            onClick={() => {
              setTalkbackEnabled(!talkbackEnabled);
              if (!talkbackEnabled) speakVoice('Voice feedback enabled.');
            }}
            title={talkbackEnabled ? 'Voice talkback enabled' : 'Voice talkback muted'}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
              talkbackEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/5 text-slate-500 border-white/5'
            }`}
          >
            {talkbackEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Offline / Online toggle */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              isOffline
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Layout Mode Switch (Mobile Frame vs Widescreen POS) */}
          <div className="hidden md:flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setLayoutMode('pos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                layoutMode === 'pos' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> POS Counter
            </button>
            <button
              onClick={() => setLayoutMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                layoutMode === 'mobile' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile View
            </button>
          </div>

          {/* User profile / Logout */}
          <button
            onClick={() => dispatch(logout())}
            className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1.5 rounded-xl font-semibold"
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. WIDESCREEN POS COUNTER MODE (TABLET / DESKTOP SPLIT VIEW)            */}
        {/* ========================================================================= */}
        {layoutMode === 'pos' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 sm:p-5 gap-4">
            
            {/* LEFT COLUMN: VOICE INTERACTION & QUICK TOUCH ITEMS */}
            <div className="w-full lg:w-5/12 flex flex-col gap-4 overflow-y-auto">
              
              {/* Voice Listening Card */}
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                      Smart Voice Terminal
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isRecording ? `REC 0:0${recordingTime}` : 'READY TO LISTEN'}
                  </span>
                </div>

                {/* Big Center Microphone Button */}
                <div className="flex flex-col items-center justify-center my-3">
                  <div className="relative inline-flex items-center justify-center p-3">
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                        <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-pulse" />
                      </>
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 ${
                        isRecording 
                          ? 'bg-red-500 shadow-red-500/40 hover:bg-red-600 scale-105' 
                          : 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400 hover:scale-105'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="h-9 w-9 animate-pulse" />
                      ) : (
                        <Mic className="h-9 w-9" />
                      )}
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-200 mt-2">
                    {isRecording ? 'Listening... Speak now' : 'Click to Speak (or pick preset)'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Hindi • Hinglish • English
                  </span>
                </div>

                {/* Live Audio Waveform Canvas */}
                {isRecording && (
                  <div className="my-2 bg-slate-950/60 rounded-2xl p-2 border border-white/5">
                    <canvas ref={waveformRef} className="w-full h-12" />
                  </div>
                )}

                {/* Live Speech Recognition text preview */}
                {(liveTranscript || speechText) && (
                  <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl p-3 mt-3">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
                      Transcription
                    </span>
                    <p className="text-xs text-slate-200 font-medium italic">
                      "{liveTranscript || speechText}"
                    </p>
                  </div>
                )}

                {/* AI Processing Banner */}
                {isProcessingAI && (
                  <div className="flex items-center gap-2 justify-center text-xs text-emerald-400 font-bold mt-2 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing natural language items...</span>
                  </div>
                )}
              </div>

              {/* Quick Touch Bar (Top Selling Indian Kirana Items) */}
              <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap className="h-4 w-4 text-amber-400" /> Fast Touch POS
                  </span>
                  <button
                    onClick={() => setShowBarcodeModal(true)}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Smartphone className="h-3 w-3" /> Scan Barcode
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {products.slice(0, 8).map(p => (
                    <button
                      key={p._id}
                      onClick={() => handleQuickAddProduct(p)}
                      className="p-2.5 rounded-2xl bg-slate-950 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-850 text-left transition-all active:scale-95 group flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-400">
                        {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                      </span>
                      <div className="flex justify-between items-center mt-2 text-[10px]">
                        <span className="text-emerald-400 font-extrabold">₹{p.price}</span>
                        <span className="text-slate-500">{p.unit}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Simulator Presets Drawer */}
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-4 flex-1 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quick Voice Presets (Testing)
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {voicePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerVoiceCommand(preset.text)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-500/10 text-left text-xs text-slate-300 font-medium border border-white/5 hover:border-emerald-500/20 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{preset.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* CENTER/RIGHT COLUMN: LIVE BILL CART & CHECKOUT LEDGER */}
            <div className="w-full lg:w-7/12 flex flex-col gap-4 overflow-y-auto">
              
              {/* Cart Items Table */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl flex-1 flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">Current Bill Counter</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/5 text-slate-300">
                      {cartItems.length} items
                    </span>
                  </div>

                  {cartItems.length > 0 && (
                    <button
                      onClick={() => {
                        setCartItems([]);
                        setCartCustomer(null);
                        if (soundEnabled) playDeleteSound();
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-bold"
                    >
                      Clear Bill
                    </button>
                  )}
                </div>

                {/* Customer Info row */}
                {cartCustomer && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-2xl flex justify-between items-center text-xs my-3">
                    <span className="text-slate-300 font-semibold">
                      Customer: <strong className="text-white">{cartCustomer.name}</strong>
                    </span>
                    {cartCustomer.mobile && (
                      <span className="text-slate-400 font-mono text-[11px]">{cartCustomer.mobile}</span>
                    )}
                  </div>
                )}

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto my-3 space-y-2 min-h-[180px]">
                  {cartItems.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs italic gap-2">
                      <ShoppingBag className="h-8 w-8 text-slate-700" />
                      <span>No items added. Speak or tap products to build customer bill.</span>
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-xs hover:border-white/10 transition-colors"
                      >
                        <div className="flex-1">
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

                          <span className="font-black text-white text-sm min-w-[60px] text-right">
                            ₹{item.total}
                          </span>

                          <button
                            onClick={() => removeCartItem(item.productId)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Financial Summary & Calculations */}
                <div className="bg-slate-950/80 border border-white/10 p-4 rounded-3xl space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-200 font-bold">₹{cartSubtotal}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Discount (₹)</span>
                    <input
                      type="number"
                      value={cartDiscount}
                      onChange={(e) => setCartDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="bg-slate-900 border border-white/10 rounded-lg w-20 py-1 px-2 text-right font-bold text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>GST Rate</span>
                    <select
                      value={cartTaxRate}
                      onChange={(e) => setCartTaxRate(parseInt(e.target.value))}
                      className="bg-slate-900 border border-white/10 rounded-lg py-1 px-2 font-bold text-white text-xs"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5% (Kirana)</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                    </select>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400">
                    <span>GST Tax ({cartTaxRate}%)</span>
                    <span className="text-slate-200 font-bold">₹{cartTax}</span>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Grand Total</span>
                    <span className="text-xl font-black text-emerald-400">₹{cartTotal}</span>
                  </div>
                </div>

                {/* Payment Mode Selector & Cash Change Calculator */}
                <div className="mt-3 bg-slate-950/80 border border-white/10 p-4 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Payment Mode
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{paymentMethod}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['Cash', 'UPI', 'Card', 'Credit/Udhaar'].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                          paymentMethod === m
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-900 border-white/5 hover:bg-slate-850 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Cash' && (
                    <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-2xl border border-white/5 text-xs">
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
                          Change To Return
                        </span>
                        <span className="block text-base font-black text-amber-400 py-1">
                          ₹{changeToReturn}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Bill Button */}
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={handleConfirmBill}
                  className="mt-3 w-full py-4 rounded-2xl font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-40 disabled:pointer-events-none text-sm tracking-wide"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Generate & Print Invoice Slip (₹{cartTotal})</span>
                </button>

              </div>

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* 2. MOBILE PHONE VIEW (APP SHELL SIMULATOR)                              */
          /* ========================================================================= */
          <div className="flex-1 bg-slate-950 flex justify-center items-center py-4 px-2 sm:px-4">
            <div className="w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-[44px] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col max-h-[850px] relative">
              
              {/* Phone Status Bar */}
              <div className="px-6 py-3 bg-slate-900 border-b border-white/5 flex justify-between items-center text-xs text-slate-400 font-semibold select-none z-20">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="h-4 w-24 bg-black rounded-full" />
                <div className="flex items-center gap-1.5">
                  {isOffline ? <WifiOff className="h-3.5 w-3.5 text-amber-500" /> : <Wifi className="h-3.5 w-3.5 text-emerald-400" />}
                  <span className="text-[10px]">100%</span>
                </div>
              </div>

              {/* Active Tab Screen inside phone shell */}
              <div className="flex-1 overflow-y-auto px-4 py-5 bg-slate-950/60 relative space-y-4">
                
                {/* Voice Record Box in Mobile View */}
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-4 text-center space-y-3">
                  <div className="relative inline-flex items-center justify-center p-2">
                    {isRecording && (
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                        isRecording ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-8 w-8 animate-pulse" /> : <Mic className="h-8 w-8" />}
                    </button>
                  </div>
                  <span className="block text-xs font-bold text-white">
                    {isRecording ? 'Listening...' : 'Tap Mic to Bill'}
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
                    <span>Bill Items ({cartItems.length})</span>
                    <span>Total: ₹{cartTotal}</span>
                  </div>
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.quantity} {item.unit} × ₹{item.price}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">₹{item.total}</span>
                        <button onClick={() => removeCartItem(item.productId)} className="text-red-400">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleConfirmBill}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Confirm Bill (₹{cartTotal})
                    </button>
                  )}
                </div>

              </div>

              {/* Bottom Mobile Navigation Bar */}
              <div className="px-6 py-2.5 bg-slate-900 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 select-none z-10">
                <button onClick={() => setLayoutMode('pos')} className="flex flex-col items-center gap-1 text-emerald-400 font-bold">
                  <Monitor className="h-4 w-4" />
                  <span>POS Counter</span>
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

      {/* AMBIGUITY CLARIFICATION MODAL */}
      {showClarificationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Which variant did you mean?
              </span>
              <button onClick={() => setShowClarificationModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Multiple products or sizes matched your speech. Tap the exact item you want:
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {clarifications.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    "{item.searchTerm}" ({item.quantity} units)
                  </span>

                  {item.notFound ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500">Not found in stock. Add to inventory?</p>
                      <button
                        onClick={() => addNewProductFromAmbiguity(item.searchTerm, item.quantity, idx)}
                        className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        + Register "{item.searchTerm}" in Stock
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {item.options.map(option => (
                        <button
                          key={option.productId}
                          onClick={() => selectAmbiguousProduct(option, item.quantity, idx)}
                          className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-xs font-semibold text-slate-200 transition-all"
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

      {/* GENERATED INVOICE MODAL (THERMAL RECEIPT + TAX INVOICE + UPI QR CODE) */}
      {generatedInvoice && (
        <ThermalReceipt
          invoice={generatedInvoice}
          store={selectedStore}
          onClose={() => setGeneratedInvoice(null)}
        />
      )}

      {/* BARCODE SCANNER MODAL */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form onSubmit={handleBarcodeScanSubmit} className="w-full max-w-[380px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-emerald-400" /> Barcode Reader Scanner
              </span>
              <button type="button" onClick={() => setShowBarcodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter product barcode code or search term to simulate physical laser scanning:
            </p>

            <input
              type="text"
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              placeholder="e.g. 111, 222, 333, 444"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-white bg-slate-950 border border-white/10 font-mono font-bold tracking-widest text-center text-base"
            />

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400 block">💡 Quick Test Barcodes:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('111')}>• "111" - Basmati Rice</span>
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('222')}>• "222" - Maggi Noodles</span>
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('333')}>• "333" - Coca Cola</span>
                <span className="cursor-pointer hover:underline" onClick={() => setBarcodeSearch('444')}>• "444" - Parle-G Biscuit</span>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                Scan & Add to Bill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD INVENTORY PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form onSubmit={handleProductSubmit} className="w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Inventory Product'}
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
              <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                Save to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
