import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dashboardPath = path.resolve(__dirname, '../../frontend/src/pages/Dashboards/VendorDashboard.jsx');

let c = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add new imports if not present
if (!c.includes('CameraBarcodeScannerModal')) {
  c = c.replace(
    "import ThermalReceipt from '../../components/ThermalReceipt.jsx';",
    `import ThermalReceipt from '../../components/ThermalReceipt.jsx';
import CameraBarcodeScannerModal from '../../components/CameraBarcodeScannerModal.jsx';
import CashDrawerReconciliationModal from '../../components/CashDrawerReconciliationModal.jsx';
import { 
  exportInvoicesToCSV, 
  exportProductsToCSV, 
  exportCustomersToCSV, 
  exportExpensesToCSV 
} from '../../utils/csvExporter.js';`
  );
}

// 2. Add state variables: currency, voiceLang, showCashDrawerModal, redeemedPoints
if (!c.includes('const [currency, setCurrency]')) {
  c = c.replace(
    "const [globalSearch, setGlobalSearch] = useState('');",
    `const [globalSearch, setGlobalSearch] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [voiceLang, setVoiceLang] = useState('hi-IN');
  const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);
  const [redeemedPoints, setRedeemedPoints] = useState(0);`
  );
}

// 3. Update speech recognition language to use voiceLang
c = c.replace(
  "recognition.lang = selectedStore?.preferredLanguage === 'Hindi' ? 'hi-IN' : 'en-IN';",
  "recognition.lang = voiceLang || 'hi-IN';"
);

// 4. Add customerLoyaltyPoints computation
if (!c.includes('customerLoyaltyPoints')) {
  const loyaltyLogic = `
  // Calculate customer's earned loyalty points (1 point per 100 spent)
  const customerLoyaltyPoints = useMemo(() => {
    if (!cartCustomerInput.mobile || cartCustomerInput.mobile.trim().length < 10) return 0;
    const cPhone = cartCustomerInput.mobile.trim();
    const pastOrders = bills.filter(b => b.customerMobile && b.customerMobile.includes(cPhone) && b.status !== 'Cancelled');
    const totalSpent = pastOrders.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    return Math.floor(totalSpent / 100);
  }, [cartCustomerInput.mobile, bills]);
`;
  c = c.replace(
    "const handleAddCombo = (combo) => {",
    loyaltyLogic + "\n  const handleAddCombo = (combo) => {"
  );
}

// 5. Update computedTotals to factor in redeemedPoints
c = c.replace(
  "const discount = Math.round(Number(overallDiscount || 0) * 100) / 100;",
  "const loyaltyDiscount = Math.min(Number(redeemedPoints || 0), subtotal);\n    const discount = Math.round((Number(overallDiscount || 0) + loyaltyDiscount) * 100) / 100;"
);
c = c.replace(
  "[cartItems, overallDiscount, amountPaid, paymentMethod, cashReceived, isInterState]",
  "[cartItems, overallDiscount, redeemedPoints, amountPaid, paymentMethod, cashReceived, isInterState]"
);

// 6. Pass new props to TopNav
c = c.replace(
  `onOpenHelpModal={() => setShowHelpModal(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onNewBillClick={() => setActiveTab('billing')}
        />`,
  `onOpenHelpModal={() => setShowHelpModal(true)}
          onOpenCashDrawerModal={() => setShowCashDrawerModal(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onNewBillClick={() => setActiveTab('billing')}
          currency={currency}
          setCurrency={setCurrency}
          voiceLang={voiceLang}
          setVoiceLang={setVoiceLang}
        />`
);

// 7. Replace old barcode modal with CameraBarcodeScannerModal and add CashDrawerReconciliationModal
const modalReplacements = `
      {/* Live Camera & Webcam Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        products={products}
        onBarcodeDetected={(code, matchedProduct) => {
          if (matchedProduct) {
            addItemToCart(matchedProduct, 1);
            addToast(\`Scanned & Added: \${matchedProduct.name}\`, 'success');
          } else {
            addItemToCart({
              name: \`Scanned Item (\${code})\`,
              price: 50,
              barcode: code,
              quantity: 1,
              unit: 'piece',
              taxRate: 5
            }, 1);
            addToast(\`Added new item with barcode \${code}\`, 'info');
          }
          setShowBarcodeModal(false);
        }}
      />

      {/* Day-End Cash Drawer & Z-Report Modal */}
      <CashDrawerReconciliationModal
        isOpen={showCashDrawerModal}
        onClose={() => setShowCashDrawerModal(false)}
        store={selectedStore}
        orders={bills}
        expenses={expenses}
        activeRole={activeRole}
      />
`;

// Replace old showBarcodeModal block
c = c.replace(
  /{\/\* Barcode Simulator Modal \*\/}[\s\S]*?{\/\* Toast Notifications Overlay \*\//,
  modalReplacements + '\n      {/* Toast Notifications Overlay */'
);

fs.writeFileSync(dashboardPath, c, 'utf8');
console.log('VendorDashboard.jsx updated successfully with camera scanner, Z-report, loyalty points & currency!');
