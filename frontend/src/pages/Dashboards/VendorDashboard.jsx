import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice.js';
import { parseVoiceCommand } from '../../utils/nlpParser.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Store, Package, ShoppingBag, DollarSign, Plus, Edit2, 
  Trash2, ShoppingCart, Loader2, CheckCircle2, ChevronRight,
  Mic, MicOff, Search, Users, Settings, Smartphone, Wifi, WifiOff,
  Sparkles, Send, ArrowRight, Printer, RefreshCw, X, AlertTriangle, 
  Share2, ArrowLeft, Check, UserPlus, CreditCard, Landmark, BookOpen
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Active Bottom Tab: 'home' | 'billing' | 'inventory' | 'ledger' | 'assistant' | 'settings'
  const [activeTab, setActiveTab] = useState('home');

  // Unified voice billing states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
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

  // Voice recording timers and refs
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

  // Speech timer
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
        // Fallback store if none exists
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
      // Load from LocalStorage if offline
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
      // Fetch Products
      const prodRes = await fetch(`/api/products/store/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodRes.ok) {
        setProducts(prodData);
        localStorage.setItem(`products_${storeId}`, JSON.stringify(prodData));
      }

      // Fetch Customers
      const custRes = await fetch(`/api/orders/customers/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const custData = await custRes.json();
      if (custRes.ok) {
        setCustomers(custData);
        localStorage.setItem(`customers_${storeId}`, JSON.stringify(custData));
      }

      // Fetch Bills
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

  // Sync LocalStorage transactions back to database
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
    // Refresh database state
    if (selectedStore) {
      await fetchStoreData(selectedStore._id);
    }
    setLoading(false);
    alert(`Sync Complete! ${successCount} offline invoices and ledger modifications successfully synced.`);
  };

  // Waveform canvas helper
  const startWaveformAnimation = () => {
    const canvas = waveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 80;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#10b981'; // Tailwind emerald-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const sliceWidth = canvas.width / 50;
      let x = 0;

      for (let i = 0; i < 50; i++) {
        const amplitude = Math.sin(i * 0.15 + Date.now() * 0.01) * Math.sin(Date.now() * 0.005) * 20 + 40;
        if (i === 0) ctx.moveTo(x, amplitude);
        else ctx.lineTo(x, amplitude);
        x += sliceWidth;
      }
      ctx.stroke();
      canvasAnimationRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  // Simulated Voice Command Triggers (Testing Console Helper)
  const triggerVoiceCommand = async (text) => {
    setSpeechText(text);
    setIsProcessingAI(true);
    setActiveTab('billing');

    if (isOffline) {
      // Offline Local Javascript Parser
      setTimeout(() => {
        const result = parseVoiceCommand(text, products, customers);
        handleNLPResult(result);
        setIsProcessingAI(false);
      }, 800);
    } else {
      // Server-side AI Parser
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
          // Fallback to local parsing on server error
          const localRes = parseVoiceCommand(text, products, customers);
          handleNLPResult(localRes);
        }
      } catch (err) {
        console.error(err);
        const localRes = parseVoiceCommand(text, products, customers);
        handleNLPResult(localRes);
      } finally {
        setIsProcessingAI(false);
      }
    }
  };

  // Handle parsed result
  const handleNLPResult = (result) => {
    if (!result) return;

    if (result.intent === 'billing') {
      // Set customer if recognized
      if (result.customerName) {
        const match = customers.find(c => c.name.toLowerCase() === result.customerName.toLowerCase());
        if (match) setCartCustomer(match);
        else setCartCustomer({ name: result.customerName, mobile: '' });
      }

      // Add successfully matched items to cart
      if (result.items && result.items.length > 0) {
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
      }

      // Open Clarification dialog for ambiguous/missing products
      if (result.clarifications && result.clarifications.length > 0) {
        setClarifications(result.clarifications);
        setShowClarificationModal(true);
      }
    }

    else if (result.intent === 'payment') {
      setPaymentMethod(result.paymentMethod || 'Cash');
      if (result.cashReceived) {
        setCashReceived(result.cashReceived);
        calculateChange(result.cashReceived);
      }
    }

    else if (result.intent === 'discount') {
      setCartDiscount(result.discount);
    }

    else if (result.intent === 'credit') {
      setPaymentMethod('Credit/Udhaar');
      const match = customers.find(c => c.name.toLowerCase().includes(result.customerName.toLowerCase()));
      if (match) {
        setCartCustomer(match);
      } else {
        setCartCustomer({ name: result.customerName, mobile: '' });
      }
      alert(`Parsed Udhaar: Requesting ₹${result.amount} credit balance allocation for ${result.customerName}`);
    }

    else if (result.intent === 'add_product') {
      // Trigger new product form autofill
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

  // Quick mic toggle simulator
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Pick a random preset speech block or enter text
      const voiceInputs = [
        "Ramesh ko do kilo chawal, ek kilo cheeni aur paanch biscuit dena",
        "Ek packet Maggi aur do Coke add karo",
        "Parle-G do packet add karo",
        "10 rupaye discount laga do",
        "Customer ne 500 diye",
        "Ramesh ne 500 rupaye udhaar liye",
        "Is hafte sabse zyada kya bika?"
      ];
      const randomInput = voiceInputs[Math.floor(Math.random() * voiceInputs.length)];
      triggerVoiceCommand(randomInput);
    } else {
      setSpeechText('');
      setIsRecording(true);
    }
  };

  // Ambiguity Resolution handler
  const selectAmbiguousProduct = (option, quantity, index) => {
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

    // Remove this clarification card
    setClarifications(prev => prev.filter((_, idx) => idx !== index));
    if (clarifications.length <= 1) {
      setShowClarificationModal(false);
    }
  };

  // Add Product from Ambiguity (if not found in stock)
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
    
    // Clear item from clarification modal
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

  // Edit item quantity directly
  const updateCartQty = (productId, change) => {
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
    setCartItems(prev => prev.filter(item => item.productId !== productId));
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
      // Simulate Local Offline saving
      const mockId = `orde_${Math.random().toString(36).substr(2, 9)}`;
      const offlineBill = {
        _id: mockId,
        invoiceNumber: `VB-${1001 + bills.length} (Offline)`,
        createdAt: new Date().toISOString(),
        ...payload
      };

      // Add to local state
      const updatedBills = [offlineBill, ...bills];
      setBills(updatedBills);
      localStorage.setItem(`bills_${selectedStore._id}`, JSON.stringify(updatedBills));

      // Subtract inventory count locally
      const updatedProducts = products.map(p => {
        const itemInCart = cartItems.find(item => item.productId === p._id);
        if (itemInCart) {
          return { ...p, stock: Math.max(0, (p.stock || 0) - itemInCart.quantity) };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem(`products_${selectedStore._id}`, JSON.stringify(updatedProducts));

      // Add to Ledger Customer locally
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

      // Add task to sync queue
      setSyncQueue(prev => [...prev, { url: '/api/orders/create', body: payload }]);
      setGeneratedInvoice(offlineBill);
      
      // Clear Billing cart
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
          // Refresh statistics
          fetchStoreData(selectedStore._id);

          // Clear Billing cart
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
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
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

    // Simulate scanning: map barcode query codes to specific catalog products
    // For testing: Barcode "111" scans basmati rice, "222" scans Maggi, "333" scans Coke
    let targetId = null;
    if (barcodeSearch === '111') targetId = 'prod_rice';
    else if (barcodeSearch === '222') targetId = 'prod_maggi';
    else if (barcodeSearch === '333') targetId = 'prod_coke';
    else if (barcodeSearch === '444') targetId = 'prod_parleg_50g';

    const matchProd = products.find(p => p._id === targetId || p.name.toLowerCase().includes(barcodeSearch.toLowerCase()));
    
    if (matchProd) {
      setCartItems(prev => {
        const newCart = [...prev];
        const existingIdx = newCart.findIndex(item => item.productId === matchProd._id);
        if (existingIdx > -1) {
          newCart[existingIdx].quantity += 1;
          newCart[existingIdx].total = newCart[existingIdx].quantity * newCart[existingIdx].price;
        } else {
          newCart.push({
            productId: matchProd._id,
            name: matchProd.name,
            price: matchProd.price,
            quantity: 1,
            unit: matchProd.unit,
            total: matchProd.price
          });
        }
        return newCart;
      });
      alert(`Scanned Barcode: Added 1 unit of "${matchProd.name}" to cart.`);
      setBarcodeSearch('');
      setShowBarcodeModal(false);
      setActiveTab('billing');
    } else {
      alert(`No product matches barcode/search "${barcodeSearch}" in inventory.`);
    }
  };

  // Khata ledger actions
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
      // Local ledger update
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
      
      // Update local view selected profile
      setSelectedCustomer(updatedCusts.find(c => c._id === selectedCustomer._id));

      // Append sync action
      setSyncQueue(prev => [...prev, { url: '/api/orders/pay-udhaar', body: payload }]);

      setPayUdhaarAmount('');
      setShowPayUdhaarModal(false);
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
          // Refetch specific customer
          setSelectedCustomer(prev => {
            const fresh = customers.find(c => c._id === prev._id);
            return fresh || prev;
          });
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
      responseText = `Aaj ki total sale ₹${todayTotal} hui hai. Total orders counts ${bills.length} hain.`;
      
      // Seed nice chart
      chartData = bills.map((b, i) => ({
        name: b.invoiceNumber,
        Amount: b.totalAmount
      }));
    } 
    
    else if (intent === 'top_products') {
      responseText = `Is hafte Basmati Rice aur Maggi Noodles sabse zyada bika hai.`;
      chartData = [
        { name: 'Basmati Rice', Sales: 450 },
        { name: 'Maggi Noodles', Sales: 280 },
        { name: 'Coca Cola', Sales: 160 },
        { name: 'Tata Salt', Sales: 120 }
      ];
    }
    
    else if (intent === 'low_stock') {
      const lowStockList = products.filter(p => p.stock <= p.lowStockAlertLimit);
      if (lowStockList.length > 0) {
        responseText = `Aapka yeh products stock mein kam hain: ${lowStockList.map(p => `${p.name} (${p.stock} remaining)`).join(', ')}. Kripya stock update karein.`;
        chartData = lowStockList.map(p => ({
          name: p.name,
          Quantity: p.stock,
          Limit: p.lowStockAlertLimit
        }));
      } else {
        responseText = `Aapke sabhi products ka stock level safe hai! Koi bhi product low stock warning limit ke neeche nahi hai.`;
      }
    }

    else if (intent === 'compare_sales') {
      responseText = `Kal ki sale se aaj aapki sales 24% zyada rahi hai.`;
      chartData = [
        { name: 'Kal (Yesterday)', Sales: 1800 },
        { name: 'Aaj (Today)', Sales: 2232 }
      ];
    }

    else if (intent === 'profit') {
      responseText = `Aapka total computed gross profit margin 18.5% hai. Net estimated profit ₹1,480 hai.`;
      chartData = [
        { name: 'Product Cost', Amount: 3200 },
        { name: 'Gross Profit', Amount: 1480 }
      ];
    }

    else {
      responseText = `Mujhe aapki baat poori samajh nahi aayi. Aap simple terms mein pooch sakte hain, jaise "Aaj ki sale" ya "Stock alert".`;
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

  // Helper to trigger simulated voice triggers in side-panel
  const voicePresets = [
    { label: '🛒 Do kilo chawal aur teen packet biscuit dena', text: 'Ramesh ko do kilo chawal, ek kilo cheeni aur paanch biscuit dena' },
    { label: '🍜 Naya product add karo Maggi', text: 'Naya product add karo, Maggi Noodles, price 14 rupees, stock 100 packets' },
    { label: '💵 Customer paid ₹500 cash', text: 'Customer ne 500 cash diya' },
    { label: '💳 Ramesh ne ₹1000 udhaar liye', text: 'Ramesh ne 1000 rupaye udhaar liye' },
    { label: '💰 Aaj ki sale kitni hui?', text: 'Aaj ki sale kitni hui?' },
    { label: '⚠️ Ambiguity test: Parle-G add karo', text: 'Parle-G do packet add karo' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      
      {/* LEFT PANEL: SYSTEM CONTROLLER (Desktop testing sidebar) */}
      <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col shrink-0">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-white">VoiceBill AI Sandbox</h1>
          </div>
          <button 
            onClick={() => dispatch(logout())}
            className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/25 px-2.5 py-1 rounded-lg hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>

        {/* Network Toggle Simulator */}
        <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connection Mode</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isOffline ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {isOffline ? 'Offline' : 'Online'}
            </span>
          </div>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Switch to {isOffline ? 'Online Mode' : 'Offline Mode'}
          </button>

          {syncQueue.length > 0 && (
            <div className="mt-2 text-center">
              <span className="text-[10px] text-amber-500 font-bold block mb-1">
                ⚠️ {syncQueue.length} offline transactions buffered
              </span>
              {!isOffline && (
                <button
                  onClick={syncOfflineData}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400"
                >
                  Sync Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Speech Trigger presets */}
        <div className="flex-1 space-y-4">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simulated Voice Presets</span>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {voicePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => triggerVoiceCommand(preset.text)}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-emerald-500/5 text-left text-xs text-slate-300 font-semibold border border-white/5 hover:border-emerald-500/20 transition-all block hover:translate-x-1"
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 mt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Barcode Simulator</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400">
              <span className="bg-slate-900 p-1.5 rounded text-center cursor-pointer hover:bg-slate-800" onClick={() => { setBarcodeSearch('111'); handleBarcodeScanSubmit({ preventDefault: () => {} }); }}>
                "111" - Rice
              </span>
              <span className="bg-slate-900 p-1.5 rounded text-center cursor-pointer hover:bg-slate-800" onClick={() => { setBarcodeSearch('222'); handleBarcodeScanSubmit({ preventDefault: () => {} }); }}>
                "222" - Maggi
              </span>
              <span className="bg-slate-900 p-1.5 rounded text-center cursor-pointer hover:bg-slate-800" onClick={() => { setBarcodeSearch('333'); handleBarcodeScanSubmit({ preventDefault: () => {} }); }}>
                "333" - Coke
              </span>
              <span className="bg-slate-900 p-1.5 rounded text-center cursor-pointer hover:bg-slate-800" onClick={() => { setBarcodeSearch('444'); handleBarcodeScanSubmit({ preventDefault: () => {} }); }}>
                "444" - Parle-G
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
      <div className="flex-1 bg-slate-950 flex justify-center items-center py-6 px-4">
        
        {/* Mobile Bezel Mockup */}
        <div className="w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col max-h-[850px] relative">
          
          {/* Status Bar */}
          <div className="px-6 py-3.5 bg-slate-900 border-b border-white/5 flex justify-between items-center text-xs text-slate-400 font-semibold select-none z-20">
            <div className="flex items-center gap-1.5">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {isOffline && <WifiOff className="h-3 w-3 text-amber-500" />}
            </div>
            
            {/* Shop dropdown selector */}
            <div className="flex items-center gap-1 max-w-[150px]">
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <select
                value={selectedStore ? selectedStore._id : ''}
                onChange={(e) => {
                  const match = stores.find(s => s._id === e.target.value);
                  if (match) setSelectedStore(match);
                }}
                className="bg-transparent font-bold text-white text-xs border-none outline-none cursor-pointer max-w-[120px] truncate"
              >
                {stores.map(store => (
                  <option key={store._id} value={store._id} className="bg-slate-900 text-white">{store.name}</option>
                ))}
              </select>
            </div>

            <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
              {user?.role}
            </div>
          </div>

          {/* SCREEN PANEL DYNAMIC RENDERING */}
          <div className="flex-1 overflow-y-auto px-5 py-6 bg-slate-950/60 relative">

            {/* AI PROCESS PROCESSING OVERLAY */}
            {isProcessingAI && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-50 animate-fade-in">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
                <span className="text-sm font-bold text-white">AI Processing command...</span>
                <span className="text-[11px] text-slate-500 mt-1 mt-1 font-mono italic">"{speechText}"</span>
              </div>
            )}

            {/* TAB: HOME / DASHBOARD */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* Header Welcome */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Namaste, {user?.name.split(' ')[0]}!</h3>
                    <p className="text-xs text-slate-500">Apne kirana shop ko voice-bill se chalao.</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-sm font-bold text-white">
                    {user?.name.charAt(0)}
                  </div>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Sales</span>
                    <span className="text-xl font-black text-white mt-1">₹{bills.reduce((acc, b) => acc + b.totalAmount, 0)}</span>
                  </div>
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Udhaar Credit</span>
                    <span className="text-xl font-black text-red-400 mt-1">₹{customers.reduce((acc, c) => acc + (c.pendingCredit || 0), 0)}</span>
                  </div>
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Invoices</span>
                    <span className="text-xl font-black text-white mt-1">{bills.length}</span>
                  </div>
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock</span>
                    <span className="text-xl font-black text-amber-400 mt-1">
                      {products.filter(p => p.stock <= p.lowStockAlertLimit).length} items
                    </span>
                  </div>
                </div>

                {/* Microhone quick launch indicator */}
                <div 
                  onClick={() => setActiveTab('billing')}
                  className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 border border-emerald-500/20 p-5 rounded-3xl cursor-pointer text-center relative overflow-hidden group shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
                  <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500 text-slate-950 items-center justify-center shadow-lg shadow-emerald-500/25 mb-3 group-hover:scale-115 transition-transform animate-pulse">
                    <Mic className="h-6 w-6" />
                  </div>
                  <span className="block text-sm font-bold text-white">Press to Speak (Voice Bill)</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">"Ramesh ko 2 kilo chawal..."</span>
                </div>

                {/* Low Stock Alerts */}
                {products.filter(p => p.stock <= p.lowStockAlertLimit).length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-500">Low Stock Alert</span>
                    </div>
                    <div className="space-y-1.5">
                      {products.filter(p => p.stock <= p.lowStockAlertLimit).slice(0, 3).map(p => (
                        <div key={p._id} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-semibold">{p.name}</span>
                          <span className="text-slate-500">{p.stock} {p.unit} left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Invoices List */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recent Transactions</span>
                  {bills.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs italic">Koi recent billing nahi hui hai.</div>
                  ) : (
                    <div className="space-y-2">
                      {bills.slice(0, 4).map(bill => (
                        <div 
                          key={bill._id} 
                          onClick={() => setGeneratedInvoice(bill)}
                          className="bg-slate-900 hover:bg-slate-800 border border-white/5 p-3.5 rounded-2xl flex justify-between items-center cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block font-mono">{bill.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {bill.customerName} • {new Date(bill.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-white block">₹{bill.totalAmount}</span>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 ${
                              bill.paymentMethod === 'Credit/Udhaar' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>{bill.paymentMethod}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: VOICE BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                
                {/* Voice Interaction workspace */}
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4 text-center">
                  
                  <div className="relative inline-flex items-center justify-center p-2 mb-2">
                    {/* Ripple effects */}
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-ping"></div>
                      </>
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`relative z-10 h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                        isRecording 
                          ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' 
                          : 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-8 w-8 animate-pulse" /> : <Mic className="h-8 w-8" />}
                    </button>
                  </div>

                  <span className="block text-xs font-bold text-white uppercase tracking-wider">
                    {isRecording ? `Listening... (0:0${recordingTime})` : 'Press Microphone to Speak'}
                  </span>

                  {isRecording && (
                    <canvas ref={waveformRef} className="w-full h-12 bg-slate-950/20 rounded-xl" />
                  )}

                  {speechText && (
                    <div className="bg-slate-950 p-3.5 rounded-2xl text-left border border-white/5 relative">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">STT Transcription</span>
                      <p className="text-xs text-slate-200 italic leading-relaxed">"{speechText}"</p>
                    </div>
                  )}

                </div>

                {/* Billing items checkout list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billing Items</span>
                    {cartItems.length > 0 && (
                      <button 
                        onClick={() => { setCartItems([]); setCartCustomer(null); }}
                        className="text-[10px] text-red-400 font-bold hover:underline"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-xs italic flex flex-col items-center gap-1.5">
                      <ShoppingCart className="h-6 w-6 text-slate-700" />
                      <span>Empty draft. Use voice presets on the left or tap microphone to speak items.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      
                      {/* Customer info link */}
                      {cartCustomer && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-semibold">Customer: <strong className="text-white">{cartCustomer.name}</strong></span>
                          {cartCustomer.mobile && <span className="text-slate-500 text-[10px] font-mono">{cartCustomer.mobile}</span>}
                        </div>
                      )}

                      {/* Items Grid */}
                      <div className="bg-slate-900 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-850">
                            <div className="flex-1">
                              <span className="font-bold text-white block">{item.name}</span>
                              <span className="text-[10px] text-slate-500">₹{item.price} per {item.unit}</span>
                            </div>
                            <div className="flex items-center gap-3.5">
                              {/* Quantity Editor */}
                              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-white/5">
                                <button onClick={() => updateCartQty(item.productId, -1)} className="px-2 py-0.5 text-slate-400 font-black hover:text-white">-</button>
                                <span className="px-1.5 text-white font-bold text-xs">{item.quantity} {item.unit}</span>
                                <button onClick={() => updateCartQty(item.productId, 1)} className="px-2 py-0.5 text-slate-400 font-black hover:text-white">+</button>
                              </div>
                              <span className="font-bold text-white min-w-[50px] text-right">₹{item.total}</span>
                              <button onClick={() => removeCartItem(item.productId)} className="text-red-400 hover:text-red-300">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Financial Aggregations */}
                      <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl space-y-2">
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Subtotal</span>
                          <span className="text-slate-200 font-semibold">₹{cartSubtotal}</span>
                        </div>
                        
                        {/* Discount */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Discount (₹)</span>
                          <input 
                            type="number"
                            value={cartDiscount}
                            onChange={(e) => setCartDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="bg-slate-950 border border-white/10 rounded w-16 py-0.5 text-right px-1 font-bold text-white text-xs"
                          />
                        </div>

                        {/* GST Rate */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">GST Rate (%)</span>
                          <select 
                            value={cartTaxRate}
                            onChange={(e) => setCartTaxRate(parseInt(e.target.value))}
                            className="bg-slate-950 border border-white/10 rounded py-0.5 px-1 font-bold text-white text-xs"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                          </select>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">GST Tax ({cartTaxRate}%)</span>
                          <span className="text-slate-200 font-semibold">₹{cartTax}</span>
                        </div>

                        <div className="border-t border-white/5 pt-2 flex justify-between items-center font-bold text-sm">
                          <span className="text-white">Total Bill</span>
                          <span className="text-emerald-400 text-base">₹{cartTotal}</span>
                        </div>

                      </div>

                      {/* Payment Settings */}
                      <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Method</label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {['Cash', 'UPI', 'Card', 'Credit/Udhaar'].map(method => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                                  paymentMethod === method 
                                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                                    : 'bg-slate-950 border-white/5 hover:bg-slate-850 text-slate-400'
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cash calculator helper */}
                        {paymentMethod === 'Cash' && (
                          <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cash Received</label>
                              <input 
                                type="number" 
                                value={cashReceived}
                                onChange={(e) => {
                                  setCashReceived(e.target.value);
                                  calculateChange(e.target.value);
                                }}
                                placeholder="₹ Paid"
                                className="bg-slate-900 border border-white/10 rounded w-full py-1 px-2 font-bold text-white text-xs"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Change to Return</span>
                              <span className="block text-sm font-black text-amber-400 py-1">₹{changeToReturn}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Billing trigger */}
                      <button
                        type="button"
                        onClick={handleConfirmBill}
                        className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Generate & Print Bill</span>
                      </button>

                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                
                {/* Headers */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Stock Catalogue</h3>
                    <p className="text-xs text-slate-500">Products inventory levels and search options.</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setProductForm({ name: '', price: '', stock: '', unit: 'packet', category: 'General', lowStockAlertLimit: 10 });
                      setEditingProduct(null);
                      setShowProductModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </button>
                </div>

                {/* Scan Barcode Modal Switch */}
                <button
                  onClick={() => setShowBarcodeModal(true)}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/5 flex items-center justify-center gap-2 text-xs font-bold text-slate-300"
                >
                  <Smartphone className="h-4.5 w-4.5 text-emerald-400" />
                  Simulate Barcode Scanner
                </button>

                {/* Search Catalogs */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Basmati, Maggi, Parle..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    onChange={(e) => {
                      const searchStr = e.target.value.toLowerCase();
                      if (searchStr) {
                        setProducts(prev => prev.filter(p => p.name.toLowerCase().includes(searchStr)));
                      } else {
                        fetchStoreData(selectedStore._id);
                      }
                    }}
                  />
                </div>

                {/* Products Lists */}
                <div className="space-y-2">
                  {products.map(p => (
                    <div 
                      key={p._id}
                      className="bg-slate-900 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs hover:bg-slate-850"
                    >
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ₹{p.price} / {p.unit} • Category: {p.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          p.stock <= p.lowStockAlertLimit ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-950 text-slate-300'
                        }`}>
                          Qty: {p.stock}
                        </span>
                        
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name,
                              price: p.price,
                              stock: p.stock,
                              unit: p.unit,
                              category: p.category,
                              lowStockAlertLimit: p.lowStockAlertLimit
                            });
                            setShowProductModal(true);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        
                        <button onClick={() => deleteProduct(p._id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: LEDGER */}
            {activeTab === 'ledger' && (
              <div className="space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Khata Ledger</h3>
                    <p className="text-xs text-slate-500">Manage credit, ledger logs, and reminders.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setNewCustomerForm({ name: '', mobile: '' });
                      setShowAddCustomerModal(true);
                    }}
                    className="flex items-center gap-1 bg-emerald-500 text-slate-950 font-bold px-2.5 py-1.5 rounded-xl text-xs"
                  >
                    <UserPlus className="h-4 w-4" /> Add Khata
                  </button>
                </div>

                {/* Ledger profile preview vs Customers list switcher */}
                {selectedCustomer ? (
                  /* LEDGER PROFILE PAGE */
                  <div className="space-y-4 animate-fade-in">
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="flex items-center gap-1 text-slate-400 text-xs hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
                    </button>

                    <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-white block">{selectedCustomer.name}</span>
                        {selectedCustomer.mobile && <span className="text-[10px] text-slate-500 font-mono">{selectedCustomer.mobile}</span>}
                      </div>

                      <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-white/5">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Pending Credit (Udhaar)</span>
                          <span className="text-xl font-black text-red-400">₹{selectedCustomer.pendingCredit}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowPayUdhaarModal(true)}
                            className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[11px]"
                          >
                            Receive Cash
                          </button>
                          
                          {/* Send simulated whatsapp message */}
                          <a
                            href={`https://wa.me/91${selectedCustomer.mobile}?text=Namaste%20${selectedCustomer.name},%20Apne%20Apna%20Kirana%20Store%20par%20₹${selectedCustomer.pendingCredit}%20ka%20udhaar%20pending%20hai.%20Kripya%20UPI%20via%20${selectedStore.upiId}%20se%20pay%20karein.%20Dhanyawad!`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-800 text-slate-300 border border-white/5 px-2.5 py-1.5 rounded-xl text-[11px] flex items-center justify-center"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Ledger timeline */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Ledger Transactions</span>
                      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                        {selectedCustomer.ledger && selectedCustomer.ledger.map((log, idx) => (
                          <div key={idx} className="p-3 text-xs flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                              <span className="text-slate-300 font-semibold mt-0.5 block">{log.description}</span>
                            </div>
                            <span className={`font-bold ${log.type === 'credit' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {log.type === 'credit' ? '+' : '-'} ₹{log.amount}
                            </span>
                          </div>
                        ))}
                        {(!selectedCustomer.ledger || selectedCustomer.ledger.length === 0) && (
                          <div className="p-4 text-center text-slate-500 italic">No ledger transaction logged.</div>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* CUSTOMER DIRECTORY LIST */
                  <div className="space-y-2">
                    {customers.map(c => (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCustomer(c)}
                        className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-850"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{c.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{c.mobile || 'No phone'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black block text-red-400">₹{c.pendingCredit || 0}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wide block mt-0.5">Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB: AI SALES ASSISTANT */}
            {activeTab === 'assistant' && (
              <div className="space-y-4 flex flex-col h-full">
                <div>
                  <h3 className="text-lg font-bold text-white">AI Sales Assistant</h3>
                  <p className="text-xs text-slate-500">Ask voice billing analysis query metrics.</p>
                </div>

                {/* Dialog Chat messages */}
                <div className="flex-1 min-h-[220px] bg-slate-900 border border-white/5 rounded-3xl p-4 overflow-y-auto space-y-3.5">
                  {assistantMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-none'
                          : 'bg-slate-950 border border-white/5 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Display analytical charts if generated */}
                {assistantChartData && (
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Query Analytics Chart</span>
                      <button onClick={() => setAssistantChartData(null)} className="text-red-400"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="h-40 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={assistantChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                          <Bar dataKey={Object.keys(assistantChartData[0])[1]} fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Typing query drawer */}
                <form onSubmit={handleAssistantSend} className="relative flex gap-2">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    placeholder="e.g. Aaj ki sale kitni hui?"
                    className="flex-1 bg-slate-900 border border-white/5 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-emerald-500 text-white pr-10"
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                    <Send className="h-4 w-4" />
                  </button>
                </form>

              </div>
            )}

            {/* TAB: SETTINGS SHOP CONFIG */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Shop Settings</h3>
                  <p className="text-xs text-slate-500">Configure visual branding and settings.</p>
                </div>

                <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl space-y-3.5 text-xs text-slate-300">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shop Address</label>
                    <span className="block text-white font-semibold bg-slate-950 p-2 rounded-xl">{selectedStore?.address || 'Not Added'}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">GST Number</label>
                    <span className="block text-white font-mono bg-slate-950 p-2 rounded-xl">{selectedStore?.gstNumber || 'Not Added'}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">UPI Payee ID</label>
                    <span className="block text-white font-semibold bg-slate-950 p-2 rounded-xl">{selectedStore?.upiId || 'Not Added'}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred language</label>
                    <span className="block text-white font-semibold bg-slate-950 p-2 rounded-xl">{selectedStore?.preferredLanguage || 'Hinglish'}</span>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(logout())}
                  className="w-full py-3 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400 font-bold text-xs"
                >
                  Logout from Terminal
                </button>
              </div>
            )}

          </div>

          {/* Bottom Mobile Navigation Controller bar */}
          <div className="px-6 py-2.5 bg-slate-900 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 select-none z-10">
            <button onClick={() => { setActiveTab('home'); setGeneratedInvoice(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-emerald-400 font-bold' : ''}`}>
              <Store className="h-4.5 w-4.5" />
              <span>Dukaan</span>
            </button>
            <button onClick={() => { setActiveTab('billing'); setGeneratedInvoice(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'billing' ? 'text-emerald-400 font-bold' : ''}`}>
              <Mic className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              <span>Billing</span>
            </button>
            <button onClick={() => { setActiveTab('inventory'); setGeneratedInvoice(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'text-emerald-400 font-bold' : ''}`}>
              <Package className="h-4.5 w-4.5" />
              <span>Khaata</span>
            </button>
            <button onClick={() => { setActiveTab('ledger'); setGeneratedInvoice(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'ledger' ? 'text-emerald-400 font-bold' : ''}`}>
              <Users className="h-4.5 w-4.5" />
              <span>Udhaar</span>
            </button>
            <button onClick={() => { setActiveTab('assistant'); setGeneratedInvoice(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'assistant' ? 'text-emerald-400 font-bold' : ''}`}>
              <BookOpen className="h-4.5 w-4.5" />
              <span>Assistant</span>
            </button>
          </div>

        </div>

      </div>

      {/* CLARIFICATION MODAL (Ambiguity resolver) */}
      {showClarificationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Ambiguity Clarification
              </span>
              <button onClick={() => setShowClarificationModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400">
              Multiple products or missing products identified in the voice input. Please select the correct option:
            </p>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {clarifications.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
                    Term: "{item.searchTerm}" ({item.quantity} units)
                  </span>

                  {item.notFound ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 italic">This product is not in catalog. Do you want to register it?</p>
                      <button
                        onClick={() => addNewProductFromAmbiguity(item.searchTerm, item.quantity, idx)}
                        className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px]"
                      >
                        + Add "{item.searchTerm}" to Inventory
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                      {item.options.map(option => (
                        <button
                          key={option.productId}
                          onClick={() => selectAmbiguousProduct(option, item.quantity, idx)}
                          className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-emerald-500/20 text-xs text-slate-300 font-semibold"
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

      {/* GENERATED INVOICE REVIEW MODAL */}
      {generatedInvoice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Printer className="h-4.5 w-4.5 text-emerald-400" /> Invoice Bill Generated
              </span>
              <button onClick={() => setGeneratedInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Invoice Card */}
            <div className="bg-white text-slate-950 p-5 rounded-2xl text-[11px] font-mono shadow-xl space-y-3 print-bill border border-slate-300">
              
              {/* Header shop details */}
              <div className="text-center">
                <h4 className="font-extrabold text-sm">{selectedStore?.name}</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">{selectedStore?.address}</p>
                {selectedStore?.gstNumber && <p className="text-[9px] text-slate-500">GSTIN: {selectedStore.gstNumber}</p>}
                <p className="text-[9px] mt-1 border-t border-dashed border-slate-300 pt-1">
                  Bill No: {generatedInvoice.invoiceNumber} • Date: {new Date(generatedInvoice.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Customer */}
              <div className="border-t border-b border-dashed border-slate-300 py-1.5 text-[10px]">
                <span>Customer: <strong>{generatedInvoice.customerName}</strong></span>
                {generatedInvoice.customerMobile && <span className="block">Mobile: {generatedInvoice.customerMobile}</span>}
              </div>

              {/* Items List */}
              <div className="space-y-1">
                {generatedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span>{item.name} ({item.quantity} {item.unit})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Financials totals */}
              <div className="border-t border-dashed border-slate-300 pt-1.5 space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{generatedInvoice.subtotal}</span>
                </div>
                {generatedInvoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{generatedInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>₹{generatedInvoice.tax}</span>
                </div>
                <div className="flex justify-between font-extrabold text-xs text-slate-950 border-t border-slate-300 pt-1">
                  <span>Grand Total:</span>
                  <span>₹{generatedInvoice.totalAmount}</span>
                </div>
              </div>

              {/* Footer / QR Pay details */}
              <div className="border-t border-dashed border-slate-300 pt-2 text-center text-[9px] text-slate-500">
                <p>Payment: {generatedInvoice.paymentMethod}</p>
                {generatedInvoice.paymentMethod === 'UPI' && selectedStore?.upiId && (
                  <div className="my-2 flex flex-col items-center">
                    {/* Simulated small QR Code */}
                    <div className="h-16 w-16 bg-slate-950 text-white flex items-center justify-center text-[7px] font-mono p-1 rounded">
                      UPI QR SCAN
                    </div>
                    <span className="text-[7px] block mt-1">{selectedStore.upiId}</span>
                  </div>
                )}
                <p className="mt-1 font-bold">Dhanyawad! Phir aaiyega.</p>
              </div>

            </div>

            {/* Print & share redirects */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4 text-emerald-400" /> Print Bill
              </button>
              <a
                href={`https://wa.me/91${generatedInvoice.customerMobile}?text=Apka%20Invoice%20Bill%20${generatedInvoice.invoiceNumber}%20tayyar%20hai.%20Grand%20Total%20₹${generatedInvoice.totalAmount}%20hai.`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Share2 className="h-4 w-4" /> WhatsApp Bill
              </a>
            </div>

          </div>
        </div>
      )}

      {/* CREATE/EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form onSubmit={handleProductSubmit} className="w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Inventory Product'}
              </span>
              <button type="button" onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Tata Salt 1kg"
                  className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="₹ 25"
                    className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Measuring Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-semibold"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Grams)</option>
                    <option value="packet">packet</option>
                    <option value="bottle">bottle</option>
                    <option value="piece">piece</option>
                    <option value="strip">strip</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Low Stock Warning Limit</label>
                  <input
                    type="number"
                    required
                    value={productForm.lowStockAlertLimit}
                    onChange={(e) => setProductForm({ ...productForm, lowStockAlertLimit: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save Product
              </button>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MOCK BARCODE MODAL */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form onSubmit={handleBarcodeScanSubmit} className="w-full max-w-[360px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="h-4.5 w-4.5 text-emerald-400" /> Barcode Reader Scanner
              </span>
              <button type="button" onClick={() => setShowBarcodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Enter product UPC barcode number or keyword to simulate physical camera scanner search:
            </p>

            <input
              type="text"
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              placeholder="Enter barcode e.g., 111, 222, 333"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-bold tracking-widest text-center text-sm"
            />

            <div className="text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded-xl border border-white/5">
              💡 Presets: <strong>111</strong> (Rice), <strong>222</strong> (Maggi), <strong>333</strong> (Coke), <strong>444</strong> (Parle-G)
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                Scan Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECEIVE PAY UDHAAR MODAL */}
      {showPayUdhaarModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form onSubmit={handlePayUdhaar} className="w-full max-w-[360px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Landmark className="h-4.5 w-4.5 text-emerald-400" /> Payoff credit ledger balance
              </span>
              <button type="button" onClick={() => setShowPayUdhaarModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Customer Profile</label>
                <span className="block text-white font-bold py-1">{selectedCustomer.name} (Credit: ₹{selectedCustomer.pendingCredit})</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Receipt Cash (₹)</label>
                <input
                  type="number"
                  required
                  value={payUdhaarAmount}
                  onChange={(e) => setPayUdhaarAmount(e.target.value)}
                  placeholder="₹ Amount to pay"
                  className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Receipt Mode</label>
                <select
                  value={payUdhaarMode}
                  onChange={(e) => setPayUdhaarMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-bold"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Bank Card</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                Log Receipt Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE NEW LEDGER CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form onSubmit={handleAddCustomerSubmit} className="w-full max-w-[360px] bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus className="h-4.5 w-4.5 text-emerald-400" /> Create customer khata profile
              </span>
              <button type="button" onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">10-Digit Mobile Phone</label>
                <input
                  type="tel"
                  value={newCustomerForm.mobile}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="e.g. 9988776655"
                  className="w-full px-3.5 py-2.5 rounded-xl text-white bg-slate-950 border border-white/5 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                Create ledger account
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
