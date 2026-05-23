import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart, Package, ShoppingBag, Moon, BarChart3,
  Search, Menu, Bell, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Minus, Check, X, Lock, TrendingUp, Wallet,
  Save, Trash2, Power, Filter, RotateCcw, Download, Share2
} from 'lucide-react';

/* ═══════════════════════════════════════════
   COLOR SYSTEM
   ═══════════════════════════════════════════ */
const C = {
  blue: '#2563EB',
  green: '#16A34A',
  orange: '#E67E00',
  red: '#DC2626',
  dark: '#1A1A1A',
  gray: '#888888',
  border: '#E8E8E8',
  bg: '#F5F5F7',
  card: '#FFFFFF',
  radius: 16,
  shadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const categoryColors = {
  'مشروبات': { bg: '#EBF4FF', accent: '#2563EB' },
  'أكل': { bg: '#FFF1F0', accent: '#E67E00' },
  'أخرى': { bg: '#F0FFF4', accent: '#16A34A' },
};

const fmt = (n) => Number(n).toLocaleString('en-US');

/* ═══════════════════════════════════════════
   PRODUCT IMAGE MAP
   ═══════════════════════════════════════════ */
const productImageMap = {
  1: '/imajes/orange_juice.png',
  2: '/imajes/water.png',
  3: '/imajes/soda.png',
  4: '/imajes/chips.png',
  5: '/imajes/biscuit.png',
  6: '/imajes/chocolate.png',
  7: '/imajes/milk.png',
  8: '/imajes/coffee.png',
  9: '/imajes/tissues.png',
};

/* ═══════════════════════════════════════════
   PRODUCT ENTITY COMPONENT
   ═══════════════════════════════════════════ */
function ProductEntity({ product, variant = 'grid', inCart = null, onClick = null, actionBtn = null }) {
  const imagePath = product.image || productImageMap[product.id];
  const catColor = categoryColors[product.category] || categoryColors['أخرى'];
  const outOfStock = product.qty === 0;

  const ImageComponent = ({ size }) => {
    const isGrid = size === 'grid' || size === 'form' || size === 'sheet';

    if (isGrid) {
      return (
        <div style={{
          width: '100%',
          maxWidth: size === 'form' ? '120px' : (size === 'sheet' ? '100px' : 'none'),
          aspectRatio: '1',
          overflow: 'hidden',
          borderRadius: '12px',
          backgroundColor: catColor?.bg || '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: size === 'sheet' ? '0 auto 12px' : '0 auto 8px'
        }}>
          {imagePath ? (
            <>
              <img
                src={imagePath}
                alt={product.name}
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <span style={{ display: 'none', fontSize: size === 'form' || size === 'sheet' ? 48 : 32, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{product.emoji}</span>
            </>
          ) : (
            <span style={{ display: 'flex', fontSize: size === 'form' || size === 'sheet' ? 48 : 32, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{product.emoji}</span>
          )}
        </div>
      );
    }

    const boxSize = size === 'list' ? '56px' : '72px';

    return (
      <div style={{
        width: boxSize,
        height: boxSize,
        minWidth: boxSize,
        minHeight: boxSize,
        maxWidth: boxSize,
        maxHeight: boxSize,
        overflow: 'hidden',
        borderRadius: '12px',
        backgroundColor: catColor?.bg || '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {imagePath ? (
          <>
            <img
              src={imagePath}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '6px',
                boxSizing: 'border-box',
                display: 'block'
              }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <span style={{ display: 'none', fontSize: 32, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{product.emoji}</span>
          </>
        ) : (
          <span style={{ display: 'flex', fontSize: 32, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{product.emoji}</span>
        )}
      </div>
    );
  };

  if (variant === 'grid') {
    return (
      <div
        onClick={onClick}
        style={{
          background: '#fff', borderRadius: C.radius,
          padding: '12px 8px 8px', textAlign: 'center',
          boxShadow: C.shadow, position: 'relative',
          cursor: outOfStock ? 'not-allowed' : 'pointer',
          opacity: outOfStock || !product.is_active ? 0.5 : 1,
          border: inCart ? `2px solid ${C.blue}` : '2px solid transparent',
          transition: 'all 0.2s ease',
        }}
      >
        {outOfStock && (
          <div style={{ position: 'absolute', top: 6, left: 6, background: C.red, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, zIndex: 2 }}>نفد</div>
        )}
        {inCart && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: C.green, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, zIndex: 2 }}>×{inCart.qty}</div>
        )}
        <ImageComponent size="grid" />
        <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.blue }}>{product.sellPrice} <span style={{ fontSize: 12 }}>DA</span></div>
        <div style={{ fontSize: 11, color: C.gray, marginTop: 4, textAlign: 'left', direction: 'ltr' }}>× {product.qty}</div>
      </div>
    );
  }

  if (variant === 'list') {
    const status = !product.is_active ? { text: 'معطل', color: C.gray, bg: '#F3F4F6' }
      : product.qty === 0 ? { text: 'نفد', color: C.red, bg: '#FEE2E2' }
      : product.qty <= 10 ? { text: 'منخفض', color: C.orange, bg: '#FFF7ED' }
      : { text: 'متوفر', color: C.green, bg: '#F0FDF4' };

    return (
      <div onClick={onClick} style={{
        background: '#fff', borderRadius: 16, padding: '16px 14px', marginBottom: 12, boxShadow: C.shadow,
        display: 'flex', alignItems: 'center', gap: 14, cursor: onClick ? 'pointer' : 'default',
        opacity: product.is_active ? 1 : 0.6,
      }}>
        <ImageComponent size="list" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: C.gray }}>{product.buyPrice} DA</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: status.bg, padding: '4px 10px', borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: status.color }}>{status.text}</span>
        </div>
        <div style={{ textAlign: 'center', marginLeft: 8, minWidth: 40 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.dark }}>{product.qty}</div>
        </div>
        {actionBtn || <ChevronLeft size={18} color={C.gray} />}
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ImageComponent size="small" />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</span>
      </div>
    );
  }

  if (variant === 'tiny') {
    return <ImageComponent size="tiny" />;
  }

  if (variant === 'sheet') {
    return (
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <ImageComponent size="sheet" />
        <div style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>{product.name}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.blue, marginTop: 4 }}>{product.sellPrice} DA</div>
      </div>
    );
  }

  if (variant === 'form') {
    return <ImageComponent size="form" />;
  }

  return null;
}

/* ═══════════════════════════════════════════
   useLocalStorage HOOK
   ═══════════════════════════════════════════ */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/* ═══════════════════════════════════════════
   INITIAL DATA
   ═══════════════════════════════════════════ */
const initialProducts = [
  { id:1, name:"عصير برتقال", emoji:"🥤", image:"/imajes/orange_juice.png", category:"مشروبات", sellPrice:25, buyPrice:18, qty:24, minAlert:5, is_active:true },
  { id:2, name:"ماء 0.5L",    emoji:"💧", image:"/imajes/water.png",        category:"مشروبات", sellPrice:15, buyPrice:10, qty:40, minAlert:10, is_active:true },
  { id:3, name:"مشروب غازي",  emoji:"🥫", image:"/imajes/soda.png",         category:"مشروبات", sellPrice:20, buyPrice:13, qty:0,  minAlert:5, is_active:true },
  { id:4, name:"شيبس",        emoji:"🍟", image:"/imajes/chips.png",        category:"أكل",     sellPrice:30, buyPrice:20, qty:8,  minAlert:5, is_active:true },
  { id:5, name:"بسكويت",      emoji:"🍪", image:"/imajes/biscuit.png",      category:"أكل",     sellPrice:20, buyPrice:12, qty:16, minAlert:5, is_active:true },
  { id:6, name:"شوكولاتة",    emoji:"🍫", image:"/imajes/chocolate.png",    category:"أكل",     sellPrice:35, buyPrice:20, qty:18, minAlert:5, is_active:true },
  { id:7, name:"حليب",        emoji:"🥛", image:"/imajes/milk.png",         category:"أكل",     sellPrice:40, buyPrice:28, qty:10, minAlert:5, is_active:true },
  { id:8, name:"قهوة",        emoji:"☕", image:"/imajes/coffee.png",       category:"أكل",     sellPrice:50, buyPrice:35, qty:12, minAlert:5, is_active:true },
  { id:9, name:"مناديل",      emoji:"🧻", image:"/imajes/tissues.png",      category:"أخرى",   sellPrice:10, buyPrice:5,  qty:25, minAlert:10, is_active:true },
];

const getArabicDate = () => {
  const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const d = new Date();
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const arabicDays = ['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useLocalStorage('pos_products', initialProducts);
  const [cart, setCart] = useState([]);
  const [todaySales, setTodaySales] = useLocalStorage('pos_todaySales', []);
  const [todayPurchases, setTodayPurchases] = useLocalStorage('pos_todayPurchases', []);
  const [allPurchases, setAllPurchases] = useLocalStorage('pos_allPurchases', [
    { id: 100, productId: 1, productName: 'عصير برتقال', emoji: '🥤', qty: 24, unitPrice: 18, total: 432, date: 'أمس' },
    { id: 101, productId: 2, productName: 'ماء 0.5L', emoji: '💧', qty: 48, unitPrice: 5, total: 240, date: 'الاثنين' },
    { id: 102, productId: 4, productName: 'شيبس', emoji: '🍟', qty: 30, unitPrice: 15, total: 450, date: 'السبت' },
  ]);
  const [dayRecord, setDayRecord] = useLocalStorage('pos_dayRecord', {
    date: new Date().toISOString().split('T')[0],
    openingQty: {},
    sales: [],
    purchases: [],
    closingQty: {},
    isClosed: false,
  });
  const [pastDays, setPastDays] = useLocalStorage('pos_pastDays', []);
  
  const [closeStep, setCloseStep] = useState(1);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [reportView, setReportView] = useState('overview');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCloseDay, setShowCloseDay] = useState(false);

  // Initialize opening qty if empty
  useEffect(() => {
    if (Object.keys(dayRecord.openingQty).length === 0) {
      const oq = {};
      products.forEach(p => { oq[p.id] = p.qty; });
      setDayRecord(prev => ({ ...prev, openingQty: oq }));
    }
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const todaySalesTotal = useMemo(() =>
    todaySales.reduce((s, r) => s + r.total, 0), [todaySales]);

  const todayPurchasesTotal = useMemo(() =>
    todayPurchases.reduce((s, r) => s + r.total, 0), [todayPurchases]);

  const monthPurchasesTotal = useMemo(() =>
    allPurchases.reduce((s, r) => s + r.total, 0),
    [allPurchases]);

  const todayProfit = useMemo(() =>
    todaySales.reduce((s, r) => {
      const p = products.find(pr => pr.id === r.productId);
      if (!p) return s;
      return s + r.qty * (p.sellPrice - p.buyPrice);
    }, 0), [todaySales, products]);

  const stockValue = useMemo(() =>
    products.reduce((s, p) => s + p.qty * p.buyPrice, 0), [products]);

  const lowStockCount = useMemo(() => 
    products.filter(p => p.is_active && p.qty <= p.minAlert).length, [products]);

  // Sale handler
  const handleSell = useCallback(() => {
    if (cart.length === 0) return;
    const salesRecords = cart.map(item => {
      const p = products.find(pr => pr.id === item.productId);
      return { productId: item.productId, qty: item.qty, total: item.qty * p.sellPrice };
    });
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (cartItem) return { ...p, qty: p.qty - cartItem.qty };
      return p;
    });
    setProducts(updatedProducts);
    setTodaySales(prev => [...prev, ...salesRecords]);
    setCart([]);
    showSuccess('تمت عملية البيع بنجاح ✓');
  }, [cart, products]);

  // Purchase handler
  const handlePurchase = useCallback((productId, qty, unitPrice) => {
    const p = products.find(pr => pr.id === productId);
    if (!p) return;
    setProducts(prev => prev.map(pr =>
      pr.id === productId ? { ...pr, qty: pr.qty + qty } : pr
    ));
    const record = {
      id: Date.now(),
      productId,
      productName: p.name,
      emoji: p.emoji,
      qty,
      unitPrice,
      total: qty * unitPrice,
      date: 'اليوم',
    };
    setTodayPurchases(prev => [...prev, record]);
    setAllPurchases(prev => [record, ...prev]);
    showSuccess('تم حفظ الشراء بنجاح ✓');
  }, [products]);

  // Close day handler: Save to past days and RESET today's arrays
  const handleCloseDay = useCallback(() => {
    const closingQty = {};
    products.forEach(p => { closingQty[p.id] = p.qty; });
    
    const finalDayRecord = {
      ...dayRecord,
      sales: todaySales,
      purchases: todayPurchases,
      closingQty,
      isClosed: true,
      closedAt: new Date().toISOString(),
    };
    
    // Save to historical days
    setPastDays(prev => [finalDayRecord, ...prev]);
    
    // Reset app for the new day
    setTodaySales([]);
    setTodayPurchases([]);
    setCart([]);
    setDayRecord({
      date: new Date().toISOString().split('T')[0],
      openingQty: closingQty,
      sales: [],
      purchases: [],
      closingQty: {},
      isClosed: false,
    });
    
    setShowCloseDay(false);
    showSuccess('تم إغلاق اليوم وبدء يوم جديد ✓');
  }, [products, todaySales, todayPurchases, dayRecord]);

  // Product CRUD
  const handleSaveProduct = useCallback((productData) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      setProducts(prev => [...prev, { ...productData, id: newId, is_active: true }]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess(editingProduct ? 'تم حفظ التغييرات ✓' : 'تم إضافة المنتج ✓');
  }, [editingProduct, products]);

  const handleDeleteProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p));
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess('تم تعطيل المنتج ✓');
  }, []);

  const handleRestoreProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: true } : p));
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess('تم تفعيل المنتج ✓');
  }, []);

  const handleToggleProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
    setShowProductForm(false);
    setEditingProduct(null);
  }, []);

  // Export Data Feature
  const handleExportData = () => {
    const data = { products, todaySales, todayPurchases, allPurchases, pastDays, dayRecord };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess('تم تحميل نسخة احتياطية ✓');
  };

  // WhatsApp Share Feature
  const handleWhatsAppShare = () => {
    const text = `📊 *تقرير المبيعات - ${getArabicDate()}* 📊\n\n` +
      `💰 إجمالي المبيعات: ${fmt(todaySalesTotal)} DA\n` +
      `🛒 إجمالي المشتريات: ${fmt(todayPurchasesTotal)} DA\n` +
      `📈 صافي الربح: ${fmt(todayProfit)} DA\n\n` +
      `📦 عمليات البيع اليوم: ${todaySales.length} مرة\n` +
      `*تطبيق إدارة الأعمال*`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Render screens
  const renderScreen = () => {
    if (showProductForm) {
      return <ProductFormScreen
        product={editingProduct}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        onRestore={handleRestoreProduct}
        onToggle={handleToggleProduct}
        onBack={() => { setShowProductForm(false); setEditingProduct(null); }}
      />;
    }
    if (reportView === 'details') {
      return <ProfitDetailsScreen
        products={products}
        todaySales={todaySales}
        dayRecord={dayRecord}
        onBack={() => setReportView('overview')}
      />;
    }
    if (showCloseDay) {
      return <CloseDayScreen
        step={closeStep}
        setStep={setCloseStep}
        todaySalesTotal={todaySalesTotal}
        todayPurchasesTotal={todayPurchasesTotal}
        stockValue={stockValue}
        onClose={handleCloseDay}
        onBack={() => setShowCloseDay(false)}
      />;
    }
    switch(activeTab) {
      case 0: return <SellScreen products={products} cart={cart} setCart={setCart} onSell={handleSell} />;
      case 1: return <InventoryScreen
        products={products}
        onAddProduct={() => { setEditingProduct(null); setShowProductForm(true); }}
        onEditProduct={(p) => { setEditingProduct(p); setShowProductForm(true); }}
      />;
      case 2: return <PurchaseScreen
        products={products.filter(p => p.is_active)}
        onPurchase={handlePurchase}
        monthTotal={monthPurchasesTotal}
        recentPurchases={allPurchases.slice(0, 5)}
      />;
      case 3: return <ReportsScreen
        products={products}
        todaySales={todaySales}
        todaySalesTotal={todaySalesTotal}
        todayPurchasesTotal={todayPurchasesTotal}
        todayProfit={todayProfit}
        onShowDetails={() => setReportView('details')}
        onShowCloseDay={() => setShowCloseDay(true)}
        onExport={handleExportData}
        onShare={handleWhatsAppShare}
      />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: 80, background: C.bg }}>
      {successMsg && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: C.green, color: '#fff', padding: '12px 24px',
          borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'fadeIn 0.3s ease',
        }}>{successMsg}</div>
      )}
      {renderScreen()}
      {!showProductForm && reportView !== 'details' && !showCloseDay && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lowStockCount={lowStockCount} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOTTOM NAV
   ═══════════════════════════════════════════ */
function BottomNav({ activeTab, setActiveTab, lowStockCount }) {
  const tabs = [
    { icon: ShoppingCart, label: 'البيع' },
    { icon: Package, label: 'المخزون', badge: lowStockCount },
    { icon: ShoppingBag, label: 'الشراء' },
    { icon: BarChart3, label: 'التقارير' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 390, background: '#fff',
      borderTop: `1px solid ${C.border}`, display: 'flex',
      justifyContent: 'space-around', alignItems: 'center',
      padding: '8px 0 12px', zIndex: 100,
    }}>
      {tabs.map((tab, i) => {
        const isActive = activeTab === i;
        const Icon = tab.icon;
        return (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            position: 'relative', padding: '4px 12px',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={22} color={isActive ? C.blue : '#999'} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.badge > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -6,
                  background: C.red, color: '#fff', fontSize: 9, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{tab.badge}</div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? C.blue : '#999' }}>{tab.label}</span>
            {isActive && <div style={{ position: 'absolute', top: -9, width: 30, height: 3, background: C.blue, borderRadius: 2 }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 1: SELL (البيع)
   ═══════════════════════════════════════════ */
function SellScreen({ products, cart, setCart, onSell }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sheetQty, setSheetQty] = useState(1);

  const categories = ['الكل', 'مشروبات', 'أكل', 'أخرى'];

  const filtered = useMemo(() => {
    let list = products.filter(p => p.is_active);
    if (category !== 'الكل') list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.name.includes(search));
    return list;
  }, [products, category, search]);

  const cartTotal = useMemo(() => cart.reduce((s, c) => {
    const p = products.find(pr => pr.id === c.productId);
    return s + (p ? c.qty * p.sellPrice : 0);
  }, 0), [cart, products]);
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);

  const openSheet = (p) => {
    if (p.qty === 0) return;
    const existing = cart.find(c => c.productId === p.id);
    setSheetQty(existing ? existing.qty : 1);
    setSelectedProduct(p);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    setCart(prev => {
      const existing = prev.findIndex(c => c.productId === selectedProduct.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: sheetQty };
        return updated;
      }
      return [...prev, { productId: selectedProduct.id, qty: sheetQty }];
    });
    setSelectedProduct(null);
  };

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 40 }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>البيع</h1>
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={24} color={C.dark} />
          {cartCount > 0 && (
            <div style={{ position: 'absolute', top: -8, right: -8, background: C.red, color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</div>
          )}
        </div>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
          <Search size={18} color={C.gray} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent', textAlign: 'right', direction: 'rtl' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', overflowX: 'auto', direction: 'rtl' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 20px', borderRadius: 24, fontSize: 13, fontWeight: 600, border: category === cat ? 'none' : `1px solid ${C.border}`,
            background: category === cat ? C.blue : '#fff', color: category === cat ? '#fff' : C.dark, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '8px 12px', paddingBottom: cart.length > 0 ? 80 : 16 }}>
        {filtered.map(p => (
          <ProductEntity key={p.id} product={p} variant="grid" inCart={cart.find(c => c.productId === p.id)} onClick={() => openSheet(p)} />
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderTop: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 90 }}>
          <span style={{ fontSize: 13, color: C.gray }}>{cart.length} منتجات</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{fmt(cartTotal)} <span style={{ fontSize: 14 }}>DA</span></span>
          <button onClick={onSell} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={18} /> بيع
          </button>
        </div>
      )}

      {selectedProduct && (
        <>
          <div onClick={() => setSelectedProduct(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, animation: 'fadeInBg 0.3s ease' }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', padding: '12px 24px 32px', zIndex: 201, animation: 'slideUp 0.3s ease' }}>
            <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 20px' }} />
            <ProductEntity product={selectedProduct} variant="sheet" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
              <button onClick={() => setSheetQty(Math.max(1, sheetQty - 1))} style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={20} color={C.gray} /></button>
              <span style={{ fontSize: 36, fontWeight: 800, color: C.dark, minWidth: 50, textAlign: 'center' }}>{sheetQty}</span>
              <button onClick={() => setSheetQty(Math.min(selectedProduct.qty, sheetQty + 1))} style={{ width: 44, height: 44, borderRadius: '50%', background: C.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color="#fff" /></button>
            </div>
            <button onClick={addToCart} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Check size={20} /> إضافة للسلة
            </button>
            <button onClick={() => setSelectedProduct(null)} style={{ width: '100%', padding: '12px', marginTop: 8, background: 'transparent', color: C.gray, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>إلغاء</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 2: INVENTORY (المخزون)
   ═══════════════════════════════════════════ */
function InventoryScreen({ products, onAddProduct, onEditProduct }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');

  const activeProducts = useMemo(() => products.filter(p => p.is_active), [products]);
  const stats = useMemo(() => ({
    total: activeProducts.length,
    low: activeProducts.filter(p => p.qty > 0 && p.qty <= p.minAlert).length,
    out: activeProducts.filter(p => p.qty === 0).length,
    value: activeProducts.reduce((s, p) => s + p.qty * p.buyPrice, 0),
  }), [activeProducts]);

  const filtered = useMemo(() => {
    let list = [...activeProducts];
    if (search) list = list.filter(p => p.name.includes(search));
    if (filter === 'منخفضة المخزون') list = list.filter(p => p.qty > 0 && p.qty <= p.minAlert);
    else if (filter === 'نفدت الكمية') list = list.filter(p => p.qty === 0);
    else if (filter === 'معطلة') list = products.filter(p => !p.is_active);
    return list;
  }, [products, activeProducts, search, filter]);

  const filters = ['الكل', 'الأكثر مبيعاً', 'منخفضة المخزون', 'نفدت الكمية', 'فئات ▾'];

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Menu size={22} color={C.dark} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>المخزون</h1>
        <div style={{ position: 'relative' }}>
          <Bell size={22} color={C.dark} />
          {stats.low > 0 && (
            <div style={{ position: 'absolute', top: -6, right: -6, background: C.red, color: '#fff', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.low}</div>
          )}
        </div>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
          <Search size={16} color={C.gray} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن منتج..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent', textAlign: 'right', direction: 'rtl' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <Filter size={14} color={C.dark} /> فلترة
        </button>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', gap: 12, padding: '8px 16px', direction: 'rtl', scrollbarWidth: 'none' }}>
        {[
          { label: 'إجمالي المنتجات', value: stats.total, sub: 'منتج', color: C.blue, icon: <img src="/imajes/icons/total-products.png" style={{width:'72px', height:'72px', objectFit:'contain'}} /> },
          { label: 'منخفضة المخزون', value: stats.low, sub: 'منتج', color: C.orange, icon: <img src="/imajes/icons/low-stock.png" style={{width:'72px', height:'72px', objectFit:'contain'}} /> },
          { label: 'نفدت الكمية', value: stats.out, sub: 'منتجات', color: C.red, icon: <img src="/imajes/icons/out-of-stock.png" style={{width:'72px', height:'72px', objectFit:'contain'}} /> },
          { label: 'قيمة المخزون', value: fmt(stats.value), sub: 'DA', color: C.green, icon: <img src="/imajes/icons/stock-value.png" style={{width:'72px', height:'72px', objectFit:'contain'}} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '16px 12px', minWidth: 140, flexShrink: 0, boxShadow: C.shadow, border: `1px solid ${C.border}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {filters.map(f => {
          const isActive = filter === f;
          const isAll = f === 'الكل';
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 24, fontSize: 13, fontWeight: 600,
              background: isAll || isActive ? '#1A1A1A' : '#fff',
              color: isAll || isActive ? '#fff' : C.dark,
              border: isAll || isActive ? 'none' : `1px solid ${C.border}`,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.2s ease'
            }}>{f}</button>
          );
        })}
      </div>

      <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: C.gray }}>كل المنتجات ({filtered.length})</span>
        <span style={{ fontSize: 12, color: C.gray }}>ترتيب: الاسم</span>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 100 }}>
        {filtered.map(p => (
          <ProductEntity key={p.id} product={p} variant="list" onClick={() => onEditProduct(p)} />
        ))}
      </div>

      <button onClick={onAddProduct} style={{ position: 'fixed', bottom: 90, right: 'calc(50% - 175px)', width: 52, height: 52, borderRadius: '50%', background: C.dark, color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
        <Plus size={24} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 3: PURCHASE (الشراء)
   ═══════════════════════════════════════════ */
function PurchaseScreen({ products, onPurchase, monthTotal, recentPurchases }) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 1);
  const [qty, setQty] = useState(12);
  const [price, setPrice] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => { if (selectedProduct) setPrice(String(selectedProduct.buyPrice)); }, [selectedProductId]);

  const handleSave = () => {
    if (!selectedProduct || qty <= 0) return;
    onPurchase(selectedProductId, qty, Number(price) || selectedProduct.buyPrice);
    setQty(12);
  };

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Menu size={22} color={C.dark} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>الشراء</h1>
          <p style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>سجّل ما اشتريته اليوم</p>
        </div>
        <ShoppingBag size={22} color={C.dark} />
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div style={{ background: '#fff', borderRadius: C.radius, padding: '20px', boxShadow: C.shadow, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: C.dark }}>هذا الشهر:</span>
            <span style={{ fontSize: 32, fontWeight: 800, color: C.dark }}>{fmt(monthTotal)} <span style={{ fontSize: 16, color: C.dark }}>DA</span></span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wallet size={22} color={C.dark} /></div>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ background: '#fff', borderRadius: C.radius, padding: '20px', boxShadow: C.shadow }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16, textAlign: 'center' }}>إضافة شراء جديد</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 6, display: 'block' }}>المنتج</label>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, cursor: 'pointer', background: '#FAFAFA' }}>
                <ProductEntity product={selectedProduct || { emoji: '📦', category: 'أخرى' }} variant="small" />
                <ChevronDown size={18} color={C.gray} />
              </div>
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 12, marginTop: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 50, maxHeight: 200, overflowY: 'auto' }}>
                  {products.map(p => (
                    <div key={p.id} onClick={() => { setSelectedProductId(p.id); setShowDropdown(false); }} style={{ padding: '10px 14px', cursor: 'pointer', background: p.id === selectedProductId ? '#F0F7FF' : 'transparent' }}>
                      <ProductEntity product={p} variant="small" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 6, display: 'block' }}>الكمية</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA' }}>
              <button onClick={() => setQty(Math.max(1, qty + 1))} style={{ width: 40, height: 40, borderRadius: '50%', background: C.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} color="#fff" /></button>
              <button onClick={() => setQty(Math.min(qty + 12, 999))} style={{ width: 40, height: 40, borderRadius: 20, background: C.blue, border: 'none', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700 }}>+12</button>
              <span style={{ fontSize: 36, fontWeight: 800, color: C.dark, minWidth: 60, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={18} color={C.gray} /></button>
              <button style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: C.gray }}>N</button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 6, display: 'block' }}>السعر للوحدة</label>
            <div style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA' }}>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: 16, fontWeight: 700, background: 'transparent', textAlign: 'right', direction: 'rtl' }} />
            </div>
            <p style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>السعر المحفوظ: {selectedProduct?.buyPrice} DA</p>
          </div>

          <button onClick={handleSave} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.blue, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Save size={18} /> حفظ الشراء
          </button>
        </div>
      </div>

      <div style={{ padding: '4px 16px 100px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 12 }}>آخر المشتريات</h3>
        {recentPurchases.map((r, i) => {
          const rProduct = products.find(p => p.id === r.productId) || { emoji: r.emoji, category: 'أخرى', name: r.productName };
          return (
            <div key={r.id ? `${r.id}-${i}` : i} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 8, boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ProductEntity product={rProduct} variant="tiny" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{r.productName}</div>
                <div style={{ fontSize: 11, color: C.gray }}>+{r.qty} وحدة — {r.date}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.blue }}>{fmt(r.total)} DA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.green, justifyContent: 'flex-end' }}><Check size={12} /> محفوظ</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 4: CLOSE DAY (إغلاق اليوم)
   ═══════════════════════════════════════════ */
function CloseDayScreen({ step, setStep, todaySalesTotal, todayPurchasesTotal, stockValue, onClose, onBack }) {
  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={22} color={C.dark} /></button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>إغلاق اليوم</h1>
          <p style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{getArabicDate()}</p>
        </div>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {[ { num: 1, label: 'المبيعات' }, { num: 2, label: 'المشتريات' }, { num: 3, label: 'الإغلاق' } ].map((s, i) => {
          const isCompleted = step > s.num;
          const isCurrent = step >= s.num;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: isCurrent ? C.blue : '#E5E7EB', color: isCurrent ? '#fff' : C.gray, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{s.num}</div>
                <span style={{ fontSize: 11, fontWeight: 600, marginTop: 6, color: isCurrent ? C.dark : C.gray }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 3, margin: '0 8px', background: isCompleted ? C.blue : '#E5E7EB', borderRadius: 2, marginTop: -12 }} />}
            </div>
          );
        })}
      </div>

      {step <= 2 && (
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: C.radius, padding: '24px 20px', boxShadow: C.shadow }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16, textAlign: 'right' }}>مشتريات اليوم</h3>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.dark, textAlign: 'center', marginBottom: 20 }}>هل اشتريت شيئاً اليوم؟</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Check size={18} /> نعم</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#fff', color: C.dark, border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><X size={18} /> لا</button>
            </div>
          </div>
        </div>
      )}

      {step >= 3 && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: C.radius, padding: '24px 20px', boxShadow: C.shadow }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, textAlign: 'right' }}>ملخص اليوم</h3>
            {[
              { icon: <TrendingUp size={20} color={C.green} />, label: 'إجمالي المبيعات', value: todaySalesTotal, color: C.green, bg: '#F0FDF4' },
              { icon: <ShoppingBag size={20} color={C.orange} />, label: 'إجمالي المشتريات', value: todayPurchasesTotal, color: C.orange, bg: '#FFF7ED' },
              { icon: <Package size={20} color={C.blue} />, label: 'قيمة المخزون الختامي', value: stockValue, color: C.blue, bg: '#EFF6FF' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{row.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: row.color }}>{fmt(row.value)} <span style={{ fontSize: 12, fontWeight: 600 }}>DA</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step >= 3 && (
        <div style={{ padding: '20px 16px 100px' }}>
          <button onClick={onClose} className="close-day-btn">
            <Lock size={18} /> إغلاق اليوم وبدء يوم جديد
          </button>
          <p style={{ fontSize: 12, color: C.red, textAlign: 'center', marginTop: 8 }}>إغلاق اليوم سيقوم بتصفير المبيعات لبدء يوم جديد</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 5: REPORTS (التقارير)
   ═══════════════════════════════════════════ */
function ReportsScreen({ products, todaySales, todaySalesTotal, todayPurchasesTotal, todayProfit, onShowDetails, onShowCloseDay, onExport, onShare }) {
  const [period, setPeriod] = useState('اليوم');
  const salesCount = todaySales.length;

  const barData = useMemo(() => {
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => ({
      day: arabicDays[(today - 6 + i + 7) % 7],
      value: i === 6 ? todaySalesTotal : Math.floor(Math.random() * 2000 + 500),
    }));
  }, [todaySalesTotal]);

  const maxBar = Math.max(...barData.map(d => d.value), 1);

  const bestProducts = useMemo(() => {
    const map = {};
    todaySales.forEach(s => {
      if (!map[s.productId]) map[s.productId] = { qty: 0, profit: 0 };
      map[s.productId].qty += s.qty;
      const p = products.find(pr => pr.id === s.productId);
      if (p) map[s.productId].profit += s.qty * (p.sellPrice - p.buyPrice);
    });
    return Object.entries(map).map(([id, data]) => {
      const p = products.find(pr => pr.id === Number(id));
      return p ? { ...p, soldQty: data.qty, profit: data.profit } : null;
    }).filter(Boolean).sort((a, b) => b.soldQty - a.soldQty);
  }, [todaySales, products]);

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Menu size={22} color={C.dark} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>التقارير</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <Share2 size={22} color={C.dark} onClick={onShare} style={{ cursor: 'pointer' }} />
          <Download size={22} color={C.dark} onClick={onExport} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <button onClick={onShowCloseDay} style={{ width: '100%', padding: '14px 20px', borderRadius: 14, background: 'linear-gradient(135deg, #1A1A1A, #374151)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' }}>
          <Moon size={18} /> إغلاق اليوم
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange, marginRight: 4 }} />
        </button>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, background: '#fff' }}>
          {['الشهر', 'الأسبوع', 'اليوم'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, background: period === p ? C.blue : 'transparent', color: period === p ? '#fff' : C.dark, border: 'none', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '8px 16px' }}>
        {[
          { label: 'إجمالي المبيعات', value: `${fmt(todaySalesTotal)} DA`, color: C.green },
          { label: 'إجمالي المشتريات', value: `${fmt(todayPurchasesTotal)} DA`, color: C.orange },
          { label: 'صافي الربح', value: `${fmt(todayProfit)} DA`, color: C.blue },
          { label: 'عدد المبيعات', value: salesCount, color: C.dark },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: C.radius, padding: '16px', boxShadow: C.shadow }}>
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            {i === 2 && todayProfit > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: '#F0FDF4', padding: '2px 8px', borderRadius: 10, marginTop: 4, display: 'inline-block' }}>+{Math.round((todayProfit / Math.max(todaySalesTotal, 1)) * 100)}%</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', background: '#fff', margin: '12px 16px', borderRadius: C.radius, boxShadow: C.shadow }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: C.dark }}>المبيعات - آخر 7 أيام</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 6 }}>
          {barData.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: '100%', maxWidth: 30, height: Math.max(8, (d.value / maxBar) * 100), background: i === 6 ? C.blue : '#DBEAFE', borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
              <span style={{ fontSize: 9, color: C.gray, marginTop: 6 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '4px 16px 8px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: C.dark }}>أفضل المنتجات مبيعاً</h3>
        {bestProducts.length === 0 && <p style={{ fontSize: 13, color: C.gray, textAlign: 'center', padding: 20 }}>لا توجد مبيعات بعد</p>}
        {bestProducts.map((p, i) => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: '12px', marginBottom: 8, boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#FEF3C7' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
            <ProductEntity product={p} variant="small" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: C.gray, marginRight: 6 }}>×{p.soldQty}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{fmt(p.profit)} DA</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 100px' }}>
        <button onClick={onShowDetails} style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#fff', color: C.blue, border: `1.5px solid ${C.blue}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>تفاصيل الأرباح حسب المنتج ←</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 5b: PROFIT DETAILS
   ═══════════════════════════════════════════ */
function ProfitDetailsScreen({ products, todaySales, dayRecord, onBack }) {
  const [period, setPeriod] = useState('اليوم');
  const [expanded, setExpanded] = useState({ 'مشروبات': true, 'أكل': true, 'أخرى': true });

  const categories = ['مشروبات', 'أكل', 'أخرى'];
  const categoryEmojis = { 'مشروبات': '🥤', 'أكل': '🍟', 'أخرى': '🧴' };

  const profitData = useMemo(() => {
    const data = {};
    products.forEach(p => {
      const openQty = dayRecord.openingQty[p.id] || p.qty;
      const soldQty = todaySales.filter(s => s.productId === p.id).reduce((s, r) => s + r.qty, 0);
      data[p.id] = { product: p, ownedQty: p.qty, soldQty, profit: soldQty * (p.sellPrice - p.buyPrice), openQty };
    });
    return data;
  }, [products, todaySales, dayRecord]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    categories.forEach(cat => {
      totals[cat] = products.filter(p => p.category === cat).reduce((s, p) => s + (profitData[p.id]?.profit || 0), 0);
    });
    return totals;
  }, [products, profitData]);

  const totalProfit = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const categoriesWithProducts = categories.filter(cat => products.some(p => p.category === cat));

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#fff', padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={22} color={C.dark} /></button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>تفاصيل الأرباح</h1>
        <ShoppingBag size={22} color={C.dark} />
      </div>

      <div style={{ margin: '8px 16px', padding: '24px 20px', background: `linear-gradient(135deg, ${C.blue}, #1D4ED8)`, borderRadius: C.radius, textAlign: 'center', color: '#fff' }}>
        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>إجمالي الربح الصافي</p>
        <p style={{ fontSize: 42, fontWeight: 800, marginBottom: 4 }}>{fmt(totalProfit)} <span style={{ fontSize: 18 }}>DA</span></p>
        <p style={{ fontSize: 12, opacity: 0.8 }}>من {categoriesWithProducts.length} فئات | {products.length} منتج</p>
      </div>

      {categoriesWithProducts.map(cat => (
        <div key={cat} style={{ margin: '12px 16px', background: '#fff', borderRadius: C.radius, boxShadow: C.shadow, overflow: 'hidden' }}>
          <div onClick={() => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{categoryEmojis[cat]}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{cat}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{fmt(categoryTotals[cat])} DA</span>
              {expanded[cat] ? <ChevronUp size={18} color={C.gray} /> : <ChevronDown size={18} color={C.gray} />}
            </div>
          </div>

          {expanded[cat] && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>المنتج</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'center' }}>المخزون المملوك</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'center' }}>المخزون المبيع</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'left' }}>الربح</span>
              </div>
              {products.filter(p => p.category === cat).map(p => {
                const d = profitData[p.id];
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr', padding: '10px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                    <ProductEntity product={p} variant="small" />
                    {p.qty === 0 ? (
                      <><span style={{ fontSize: 11, color: C.red, fontWeight: 600, textAlign: 'center' }}>نفد</span><span style={{ fontSize: 11, textAlign: 'center' }}>-</span></>
                    ) : (
                      <><span style={{ fontSize: 12, textAlign: 'center' }}>{d?.ownedQty} وحدة</span><span style={{ fontSize: 12, textAlign: 'center' }}>{d?.soldQty} وحدة</span></>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'left', color: d?.profit > 0 ? C.green : C.red }}>{fmt(d?.profit || 0)} DA</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 6: ADD/EDIT PRODUCT
   ═══════════════════════════════════════════ */
function ProductFormScreen({ product, onSave, onDelete, onRestore, onToggle, onBack }) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [emoji, setEmoji] = useState(product?.emoji || '📦');
  const [buyPrice, setBuyPrice] = useState(String(product?.buyPrice || '0'));
  const [sellPrice, setSellPrice] = useState(String(product?.sellPrice || '0'));
  const [qty, setQty] = useState(product?.qty || 0);
  const [minAlert, setMinAlert] = useState(product?.minAlert || 5);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const profit = (Number(sellPrice) || 0) - (Number(buyPrice) || 0);
  const isInactive = isEdit && !product.is_active;
  const productForPreview = { ...product, name, emoji, category, image: product?.image };

  const handleSave = () => {
    if (!name || !category) return;
    onSave({ name, category, emoji, buyPrice: Number(buyPrice) || 0, sellPrice: Number(sellPrice) || 0, qty, minAlert, image: product?.image || '' });
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: C.dark }}><ChevronLeft size={20} /></button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>{isEdit ? 'تعديل المنتج' : 'إضافة منتج'}</h1>
        <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.dark }}>حفظ</button>
      </div>

      <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
        {isInactive && (
          <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>هذا المنتج معطل حالياً</span>
            <button onClick={() => onRestore(product.id)} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={14} /> تفعيل</button>
          </div>
        )}

        {/* Image upload area */}
        <div style={{ background: '#F9FAFB', borderRadius: C.radius, padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px dashed ${C.border}`, position: 'relative', alignSelf: 'flex-start', width: 'fit-content', minWidth: 140 }}>
          {isEdit && productForPreview ? <ProductEntity product={productForPreview} variant="form" /> : (
            <>
              <Plus size={32} color={C.gray} strokeWidth={1.5} />
              <div style={{ fontSize: 13, color: C.gray, marginTop: 8 }}>إضافة صورة</div>
            </>
          )}
          <div style={{ position: 'absolute', bottom: -8, left: -8, width: 32, height: 32, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✏️</div>
        </div>

        {/* اسم المنتج */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>اسم المنتج</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسم المنتج" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
        </div>

        {/* التصنيف */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>التصنيف</label>
          <div onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, background: '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <ChevronDown size={16} color={C.gray} />
            <span style={{ color: category ? C.dark : C.gray }}>{category || 'اختر التصنيف'}</span>
          </div>
          {showCategoryDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 12, marginTop: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 50 }}>
              {['مشروبات', 'أكل', 'أخرى'].map(c => (
                <div key={c} onClick={() => { setCategory(c); setShowCategoryDropdown(false); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 14, background: category === c ? '#F0F7FF' : 'transparent' }}>{c}</div>
              ))}
            </div>
          )}
        </div>

        {/* الباركود */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>الباركود</label>
          <div style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', color: C.gray }}>
            <span style={{ fontSize: 16, letterSpacing: 1 }}>⦀⦀⦀⦀</span>
            <span>الباركود</span>
          </div>
        </div>

        {/* سعر الشراء + إدارة المخزون row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>سعر الشراء (ر.س)</label>
            <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>إدارة المخزون</label>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', textAlign: 'right', marginBottom: 4 }}>الكمية المتوفرة</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '6px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA' }}>
              <button onClick={() => setQty(Math.max(0, qty - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
              <span style={{ fontSize: 24, fontWeight: 800, minWidth: 40, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
            </div>
          </div>
        </div>

        {/* سعر البيع + تنبيه نقص row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>سعر البيع (ر.س)</label>
            <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>تنبيه نقص (أقل من)</label>
            <input type="number" value={minAlert} onChange={e => setMinAlert(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* الربح المحقق */}
        <div style={{ padding: '8px 14px', marginBottom: 24, fontSize: 13, color: C.gray, textAlign: 'right' }}>
          الربح المحقق (ر.س): <span style={{ fontWeight: 700, color: profit >= 0 ? C.green : C.red }}>{profit.toFixed(2)}</span>
        </div>

        {isEdit ? (
          <>
            <button onClick={handleSave} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Save size={18} /> حفظ التغييرات</button>
            <div style={{ display: 'flex', gap: 10 }}>
              {product.is_active ? (
                <button onClick={() => onToggle(product.id)} style={{ flex: 1, padding: '12px', borderRadius: 14, background: '#f0f0f0', color: C.gray, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Power size={16} /> تعطيل</button>
              ) : (
                <button onClick={() => onRestore(product.id)} style={{ flex: 1, padding: '12px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><RotateCcw size={16} /> تفعيل</button>
              )}
              <button onClick={() => onDelete(product.id)} style={{ flex: 1, padding: '12px', borderRadius: 14, background: product.is_active ? C.orange : C.red, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Power size={16} /> {product.is_active ? 'حذف (تعطيل)' : 'معطل بالفعل'}</button>
            </div>
          </>
        ) : (
          <button onClick={handleSave} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.blue, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Save size={18} /> حفظ المنتج</button>
        )}
      </div>
    </div>
  );
}
