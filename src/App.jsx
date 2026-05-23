import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart, Package, ShoppingBag, Moon, BarChart3,
  Search, Menu, Bell, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Minus, Check, X, Lock, TrendingUp, Wallet,
  Save, Trash2, Power, Filter
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
   INITIAL DATA
   ═══════════════════════════════════════════ */
const initialProducts = [
  { id:1, name:"عصير برتقال", emoji:"🥤", category:"مشروبات", sellPrice:25, buyPrice:18, qty:24, minAlert:5, disabled:false },
  { id:2, name:"ماء 0.5L",    emoji:"💧", category:"مشروبات", sellPrice:15, buyPrice:10, qty:40, minAlert:10, disabled:false },
  { id:3, name:"مشروب غازي",  emoji:"🥫", category:"مشروبات", sellPrice:20, buyPrice:13, qty:0,  minAlert:5, disabled:false },
  { id:4, name:"شيبس",        emoji:"🍟", category:"أكل",     sellPrice:30, buyPrice:20, qty:8,  minAlert:5, disabled:false },
  { id:5, name:"بسكويت",      emoji:"🍪", category:"أكل",     sellPrice:20, buyPrice:12, qty:16, minAlert:5, disabled:false },
  { id:6, name:"شوكولاتة",    emoji:"🍫", category:"أكل",     sellPrice:35, buyPrice:20, qty:18, minAlert:5, disabled:false },
  { id:7, name:"حليب",        emoji:"🥛", category:"أكل",     sellPrice:40, buyPrice:28, qty:10, minAlert:5, disabled:false },
  { id:8, name:"قهوة",        emoji:"☕", category:"أكل",     sellPrice:50, buyPrice:35, qty:12, minAlert:5, disabled:false },
  { id:9, name:"مناديل",      emoji:"🧻", category:"أخرى",   sellPrice:10, buyPrice:5,  qty:25, minAlert:10, disabled:false },
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
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [todaySales, setTodaySales] = useState([]);
  const [todayPurchases, setTodayPurchases] = useState([]);
  const [allPurchases, setAllPurchases] = useState([
    { id: 100, productId: 1, productName: 'عصير برتقال', emoji: '🥤', qty: 24, unitPrice: 18, total: 432, date: 'أمس' },
    { id: 101, productId: 2, productName: 'ماء 0.5L', emoji: '💧', qty: 48, unitPrice: 5, total: 240, date: 'الاثنين' },
    { id: 102, productId: 4, productName: 'شيبس', emoji: '🍟', qty: 30, unitPrice: 15, total: 450, date: 'السبت' },
  ]);
  const [dayRecord, setDayRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    openingQty: {},
    sales: [],
    purchases: [],
    closingQty: {},
    isClosed: false,
  });
  const [closeStep, setCloseStep] = useState(1);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [reportView, setReportView] = useState('overview');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize opening qty
  useEffect(() => {
    const oq = {};
    products.forEach(p => { oq[p.id] = p.qty; });
    setDayRecord(prev => ({ ...prev, openingQty: oq }));
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
    allPurchases.reduce((s, r) => s + r.total, 0) + todayPurchasesTotal,
    [allPurchases, todayPurchasesTotal]);

  const todayProfit = useMemo(() =>
    todaySales.reduce((s, r) => {
      const p = products.find(pr => pr.id === r.productId);
      if (!p) return s;
      return s + r.qty * (p.sellPrice - p.buyPrice);
    }, 0), [todaySales, products]);

  const stockValue = useMemo(() =>
    products.reduce((s, p) => s + p.qty * p.buyPrice, 0), [products]);

  // Sale handler
  const handleSell = useCallback(() => {
    if (cart.length === 0) return;
    const newProducts = [...products];
    const newSales = [...todaySales];
    cart.forEach(item => {
      const idx = newProducts.findIndex(p => p.id === item.productId);
      if (idx >= 0) {
        newProducts[idx] = { ...newProducts[idx], qty: newProducts[idx].qty - item.qty };
        newSales.push({ productId: item.productId, qty: item.qty, total: item.qty * newProducts[idx].sellPrice + item.qty * (products[idx].sellPrice - newProducts[idx].sellPrice) });
      }
    });
    // Recalculate sales properly
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
  }, [cart, products, todaySales]);

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

  // Close day handler
  const handleCloseDay = useCallback(() => {
    const closingQty = {};
    products.forEach(p => { closingQty[p.id] = p.qty; });
    setDayRecord(prev => ({
      ...prev,
      sales: todaySales,
      purchases: todayPurchases,
      closingQty,
      isClosed: true,
    }));
    showSuccess('تم إغلاق اليوم بنجاح ✓');
  }, [products, todaySales, todayPurchases]);

  // Product CRUD
  const handleSaveProduct = useCallback((productData) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      const newId = Math.max(...products.map(p => p.id)) + 1;
      setProducts(prev => [...prev, { ...productData, id: newId, disabled: false }]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess(editingProduct ? 'تم حفظ التغييرات ✓' : 'تم إضافة المنتج ✓');
  }, [editingProduct, products]);

  const handleDeleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess('تم حذف المنتج ✓');
  }, []);

  const handleToggleProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, disabled: !p.disabled } : p));
    setShowProductForm(false);
    setEditingProduct(null);
  }, []);

  // Render screens
  const renderScreen = () => {
    if (showProductForm) {
      return <ProductFormScreen
        product={editingProduct}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
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
    switch(activeTab) {
      case 0: return <SellScreen products={products} cart={cart} setCart={setCart} onSell={handleSell} />;
      case 1: return <InventoryScreen
        products={products}
        onAddProduct={() => { setEditingProduct(null); setShowProductForm(true); }}
        onEditProduct={(p) => { setEditingProduct(p); setShowProductForm(true); }}
      />;
      case 2: return <PurchaseScreen
        products={products}
        onPurchase={handlePurchase}
        monthTotal={monthPurchasesTotal}
        recentPurchases={[...todayPurchases, ...allPurchases].slice(0, 5)}
      />;
      case 3: return <CloseDayScreen
        step={closeStep}
        setStep={setCloseStep}
        todaySalesTotal={todaySalesTotal}
        todayPurchasesTotal={todayPurchasesTotal}
        todayProfit={todayProfit}
        stockValue={stockValue}
        isClosed={dayRecord.isClosed}
        onClose={handleCloseDay}
      />;
      case 4: return <ReportsScreen
        products={products}
        todaySales={todaySales}
        todaySalesTotal={todaySalesTotal}
        todayPurchasesTotal={todayPurchasesTotal}
        todayProfit={todayProfit}
        onShowDetails={() => setReportView('details')}
      />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: 80, background: C.bg }}>
      {/* Success Toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: C.green, color: '#fff', padding: '12px 24px',
          borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'fadeIn 0.3s ease',
        }}>
          {successMsg}
        </div>
      )}

      {renderScreen()}

      {/* Bottom Nav */}
      {!showProductForm && reportView !== 'details' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} dayRecord={dayRecord} />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOTTOM NAV
   ═══════════════════════════════════════════ */
function BottomNav({ activeTab, setActiveTab, dayRecord }) {
  const tabs = [
    { icon: ShoppingCart, label: 'البيع' },
    { icon: Package, label: 'المخزون' },
    { icon: ShoppingBag, label: 'الشراء' },
    { icon: Moon, label: 'إغلاق اليوم' },
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
            position: 'relative', padding: '4px 8px',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={22} color={isActive ? C.blue : '#999'} strokeWidth={isActive ? 2.5 : 1.8} />
              {i === 3 && !dayRecord.isClosed && (
                <div style={{
                  position: 'absolute', top: -2, right: -4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: C.orange,
                }} />
              )}
            </div>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? C.blue : '#999',
            }}>{tab.label}</span>
            {isActive && (
              <div style={{
                position: 'absolute', top: -9, width: 30, height: 3,
                background: C.blue, borderRadius: 2,
              }} />
            )}
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
    let list = products.filter(p => !p.disabled);
    if (category !== 'الكل') list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.name.includes(search));
    return list;
  }, [products, category, search]);

  const cartTotal = useMemo(() =>
    cart.reduce((s, c) => {
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
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ width: 40 }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>البيع</h1>
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={24} color={C.dark} />
          {cartCount > 0 && (
            <div style={{
              position: 'absolute', top: -8, right: -8,
              background: C.red, color: '#fff', fontSize: 10, fontWeight: 700,
              width: 18, height: 18, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cartCount}</div>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', borderRadius: 12, padding: '10px 14px',
          border: `1px solid ${C.border}`,
        }}>
          <Search size={18} color={C.gray} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            style={{
              border: 'none', outline: 'none', flex: 1,
              fontSize: 14, background: 'transparent', textAlign: 'right',
              direction: 'rtl',
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px',
        overflowX: 'auto', direction: 'rtl',
      }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 20px', borderRadius: 24, fontSize: 13, fontWeight: 600,
            border: category === cat ? 'none' : `1px solid ${C.border}`,
            background: category === cat ? C.blue : '#fff',
            color: category === cat ? '#fff' : C.dark,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{cat}</button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, padding: '8px 12px', paddingBottom: cart.length > 0 ? 80 : 16,
      }}>
        {filtered.map(p => {
          const inCart = cart.find(c => c.productId === p.id);
          const outOfStock = p.qty === 0;
          const catColor = categoryColors[p.category] || categoryColors['أخرى'];
          return (
            <div
              key={p.id}
              onClick={() => openSheet(p)}
              style={{
                background: '#fff', borderRadius: C.radius,
                padding: '12px 8px 8px', textAlign: 'center',
                boxShadow: C.shadow, position: 'relative',
                cursor: outOfStock ? 'not-allowed' : 'pointer',
                opacity: outOfStock ? 0.5 : 1,
                border: inCart ? `2px solid ${C.blue}` : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Out of stock badge */}
              {outOfStock && (
                <div style={{
                  position: 'absolute', top: 6, left: 6,
                  background: C.red, color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 6,
                }}>نفد</div>
              )}
              {/* Cart qty badge */}
              {inCart && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  background: C.green, color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 6,
                }}>×{inCart.qty}</div>
              )}
              {/* Emoji bg */}
              <div style={{
                width: 64, height: 64, margin: '0 auto 8px',
                background: catColor.bg, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}>{p.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4, lineHeight: 1.3 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.blue }}>
                {p.sellPrice} <span style={{ fontSize: 12 }}>DA</span>
              </div>
              <div style={{
                fontSize: 11, color: C.gray, marginTop: 4,
                textAlign: 'left', direction: 'ltr',
              }}>× {p.qty}</div>
            </div>
          );
        })}
      </div>

      {/* Cart Bottom Bar */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 390, background: '#fff',
          borderTop: `1px solid ${C.border}`, padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 90,
        }}>
          <span style={{ fontSize: 13, color: C.gray }}>{cart.length} منتجات</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>
            {fmt(cartTotal)} <span style={{ fontSize: 14 }}>DA</span>
          </span>
          <button onClick={onSell} style={{
            background: C.green, color: '#fff', border: 'none',
            borderRadius: 12, padding: '10px 24px', fontSize: 15,
            fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Check size={18} /> بيع
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      {selectedProduct && (
        <>
          <div onClick={() => setSelectedProduct(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 200, animation: 'fadeInBg 0.3s ease',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 390, background: '#fff',
            borderRadius: '24px 24px 0 0', padding: '12px 24px 32px',
            zIndex: 201, animation: 'slideUp 0.3s ease',
          }}>
            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, background: '#ddd', borderRadius: 2,
              margin: '0 auto 20px',
            }} />
            {/* Product info */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{selectedProduct.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>{selectedProduct.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.blue, marginTop: 4 }}>
                {selectedProduct.sellPrice} DA
              </div>
            </div>
            {/* Stepper */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
              marginBottom: 24,
            }}>
              <button onClick={() => setSheetQty(Math.max(1, sheetQty - 1))} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#f0f0f0', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Minus size={20} color={C.gray} /></button>
              <span style={{ fontSize: 36, fontWeight: 800, color: C.dark, minWidth: 50, textAlign: 'center' }}>
                {sheetQty}
              </span>
              <button onClick={() => setSheetQty(Math.min(selectedProduct.qty, sheetQty + 1))} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: C.blue, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Plus size={20} color="#fff" /></button>
            </div>
            {/* Add to cart button */}
            <button onClick={addToCart} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: C.green, color: '#fff', border: 'none',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Check size={20} /> إضافة للسلة
            </button>
            <button onClick={() => setSelectedProduct(null)} style={{
              width: '100%', padding: '12px', marginTop: 8,
              background: 'transparent', color: C.gray, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>إلغاء</button>
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

  const stats = useMemo(() => ({
    total: products.length,
    low: products.filter(p => p.qty > 0 && p.qty <= 10).length,
    out: products.filter(p => p.qty === 0).length,
    value: products.reduce((s, p) => s + p.qty * p.buyPrice, 0),
  }), [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.includes(search));
    if (filter === 'منخفضة المخزون') list = list.filter(p => p.qty > 0 && p.qty <= 10);
    else if (filter === 'نفدت الكمية') list = list.filter(p => p.qty === 0);
    return list;
  }, [products, search, filter]);

  const getStatus = (qty) => {
    if (qty === 0) return { text: 'نفد', color: C.red, bg: '#FEE2E2' };
    if (qty <= 10) return { text: 'منخفض', color: C.orange, bg: '#FFF7ED' };
    return { text: 'متوفر', color: C.green, bg: '#F0FDF4' };
  };

  const filters = ['الكل', 'نفدت الكمية', 'منخفضة المخزون', 'الأكثر مبيعاً'];

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Menu size={22} color={C.dark} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>المخزون</h1>
        <div style={{ position: 'relative' }}>
          <Bell size={22} color={C.dark} />
          <div style={{
            position: 'absolute', top: -6, right: -6,
            background: C.red, color: '#fff', fontSize: 9, fontWeight: 700,
            width: 16, height: 16, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{stats.low}</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', borderRadius: 12, padding: '10px 14px',
          border: `1px solid ${C.border}`,
        }}>
          <Search size={16} color={C.gray} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن منتج..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent', textAlign: 'right', direction: 'rtl' }}
          />
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#fff', borderRadius: 12, padding: '10px 14px',
          border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          <Filter size={14} color={C.dark} /> فلترة
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '8px 16px' }}>
        {[
          { label: 'قيمة المخزون', value: fmt(stats.value), sub: 'DA', color: C.green, icon: '✓' },
          { label: 'نفدت الكمية', value: stats.out, sub: 'منتجات', color: C.red, icon: '📦' },
          { label: 'منخفضة المخزون', value: stats.low, sub: 'منتج', color: C.orange, icon: '⚠️' },
          { label: 'إجمالي المنتجات', value: stats.total, sub: 'منتج', color: C.blue, icon: '📦' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: C.radius, padding: '14px',
            boxShadow: C.shadow, border: `1px solid ${C.border}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.gray }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: filter === f ? C.dark : '#fff',
            color: filter === f ? '#fff' : C.dark,
            border: filter === f ? 'none' : `1px solid ${C.border}`,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{f}</button>
        ))}
      </div>

      {/* Section header */}
      <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: C.gray }}>كل المنتجات ({filtered.length})</span>
        <span style={{ fontSize: 12, color: C.gray }}>ترتيب: الاسم</span>
      </div>

      {/* Product List */}
      <div style={{ padding: '0 16px', paddingBottom: 100 }}>
        {filtered.map(p => {
          const status = getStatus(p.qty);
          const catColor = categoryColors[p.category] || categoryColors['أخرى'];
          return (
            <div key={p.id} onClick={() => onEditProduct(p)} style={{
              background: '#fff', borderRadius: 14, padding: '14px',
              marginBottom: 8, boxShadow: C.shadow,
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: catColor.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
              }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{p.buyPrice} DA</div>
              </div>
              <div style={{ textAlign: 'center', marginLeft: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.dark }}>{p.qty}</div>
                <div style={{ fontSize: 11, color: C.gray }}>باقي</div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: status.bg, padding: '4px 10px', borderRadius: 20,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: status.color }}>{status.text}</span>
              </div>
              <ChevronLeft size={16} color={C.gray} />
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button onClick={onAddProduct} style={{
        position: 'fixed', bottom: 90, right: 'calc(50% - 175px)',
        width: 52, height: 52, borderRadius: '50%',
        background: C.dark, color: '#fff', border: 'none',
        fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80,
      }}>
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

  useEffect(() => {
    if (selectedProduct) setPrice(String(selectedProduct.buyPrice));
  }, [selectedProductId]);

  const handleSave = () => {
    if (!selectedProduct || qty <= 0) return;
    onPurchase(selectedProductId, qty, Number(price) || selectedProduct.buyPrice);
    setQty(12);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Menu size={22} color={C.dark} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>الشراء</h1>
          <p style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>سجّل ما اشتريته اليوم</p>
        </div>
        <ShoppingBag size={22} color={C.dark} />
      </div>

      {/* Month total card */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          background: '#fff', borderRadius: C.radius, padding: '20px',
          boxShadow: C.shadow, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: C.dark }}>هذا الشهر:</span>
            <span style={{ fontSize: 32, fontWeight: 800, color: C.dark }}>
              {fmt(monthTotal)} <span style={{ fontSize: 16, color: C.dark }}>DA</span>
            </span>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#f5f5f5', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={22} color={C.dark} />
          </div>
        </div>
      </div>

      {/* New purchase form */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          background: '#fff', borderRadius: C.radius, padding: '20px',
          boxShadow: C.shadow,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16, textAlign: 'center' }}>
            إضافة شراء جديد
          </h3>

          {/* Product selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 6, display: 'block' }}>المنتج</label>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowDropdown(!showDropdown)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12,
                border: `1px solid ${C.border}`, cursor: 'pointer',
                background: '#FAFAFA',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: categoryColors[selectedProduct?.category]?.bg || '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{selectedProduct?.emoji}</div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedProduct?.name}</span>
                </div>
                <ChevronDown size={18} color={C.gray} />
              </div>
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#fff', borderRadius: 12, marginTop: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 50,
                  maxHeight: 200, overflowY: 'auto',
                }}>
                  {products.map(p => (
                    <div key={p.id} onClick={() => { setSelectedProductId(p.id); setShowDropdown(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', cursor: 'pointer',
                      background: p.id === selectedProductId ? '#F0F7FF' : 'transparent',
                    }}>
                      <span style={{ fontSize: 20 }}>{p.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity stepper */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 6, display: 'block' }}>الكمية</label>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
              padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA',
            }}>
              <button onClick={() => setQty(Math.max(1, qty + 1))} style={{
                width: 40, height: 40, borderRadius: '50%',
                background: C.blue, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Plus size={18} color="#fff" /></button>
              <button onClick={() => setQty(Math.min(qty + 12, 999))} style={{
                width: 40, height: 40, borderRadius: 20,
                background: C.blue, border: 'none', cursor: 'pointer', color: '#fff',
                fontSize: 12, fontWeight: 700,
              }}>+12</button>
              <span style={{ fontSize: 36, fontWeight: 800, color: C.dark, minWidth: 60, textAlign: 'center' }}>
                {qty}
              </span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#f0f0f0', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Minus size={18} color={C.gray} /></button>
              <button style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#f0f0f0', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: C.gray,
              }}>N</button>
            </div>
          </div>

          {/* Price input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 6, display: 'block' }}>السعر للوحدة</label>
            <div style={{
              padding: '12px 14px', borderRadius: 12,
              border: `1px solid ${C.border}`, background: '#FAFAFA',
            }}>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                style={{
                  border: 'none', outline: 'none', width: '100%',
                  fontSize: 16, fontWeight: 700, background: 'transparent',
                  textAlign: 'right', direction: 'rtl',
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>
              السعر المحفوظ: {selectedProduct?.buyPrice} DA
            </p>
          </div>

          {/* Save button */}
          <button onClick={handleSave} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: C.blue, color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Save size={18} /> حفظ الشراء
          </button>
        </div>
      </div>

      {/* Recent purchases */}
      <div style={{ padding: '4px 16px 100px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 12 }}>آخر المشتريات</h3>
        {recentPurchases.map((r, i) => (
          <div key={r.id || i} style={{
            background: '#fff', borderRadius: 14, padding: '14px',
            marginBottom: 8, boxShadow: C.shadow,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#FFF5EB', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>{r.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{r.productName}</div>
              <div style={{ fontSize: 11, color: C.gray }}>+{r.qty} وحدة — {r.date}</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.blue }}>{fmt(r.total)} DA</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: C.green, justifyContent: 'flex-end',
              }}>
                <Check size={12} /> محفوظ
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 4: CLOSE DAY (إغلاق اليوم)
   ═══════════════════════════════════════════ */
function CloseDayScreen({ step, setStep, todaySalesTotal, todayPurchasesTotal, todayProfit, stockValue, isClosed, onClose }) {
  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Menu size={22} color={C.dark} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>إغلاق اليوم</h1>
          <p style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{getArabicDate()}</p>
        </div>
        <div style={{ width: 22 }} />
      </div>

      {/* Steps indicator */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {[
          { num: 1, label: 'المبيعات' },
          { num: 2, label: 'المشتريات' },
          { num: 3, label: 'الإغلاق' },
        ].map((s, i) => {
          const isCompleted = step > s.num;
          const isCurrent = step >= s.num;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: isCurrent ? C.blue : '#E5E7EB',
                  color: isCurrent ? '#fff' : C.gray,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                }}>{s.num}</div>
                <span style={{
                  fontSize: 11, fontWeight: 600, marginTop: 6,
                  color: isCurrent ? C.dark : C.gray,
                }}>{s.label}</span>
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: 3, margin: '0 8px',
                  background: isCompleted ? C.blue : '#E5E7EB',
                  borderRadius: 2, marginTop: -12,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 2: Purchases question */}
      {step <= 2 && (
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{
            background: '#fff', borderRadius: C.radius, padding: '24px 20px',
            boxShadow: C.shadow,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16, textAlign: 'right' }}>
              مشتريات اليوم
            </h3>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.dark, textAlign: 'center', marginBottom: 20 }}>
              هل اشتريت شيئاً اليوم؟
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)} style={{
                flex: 1, padding: '14px', borderRadius: 14,
                background: C.green, color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Check size={18} /> نعم
              </button>
              <button onClick={() => setStep(3)} style={{
                flex: 1, padding: '14px', borderRadius: 14,
                background: '#fff', color: C.dark, border: `1.5px solid ${C.border}`,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <X size={18} /> لا
              </button>
            </div>
            <p style={{ fontSize: 12, color: C.gray, textAlign: 'center', marginTop: 12 }}>
              يمكنك تسجيل المشتريات لاحقاً
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Summary */}
      {step >= 3 && (
        <div style={{ padding: '0 16px' }}>
          {/* Purchases question (completed) */}
          <div style={{
            background: '#fff', borderRadius: C.radius, padding: '24px 20px',
            boxShadow: C.shadow, marginBottom: 16, opacity: 0.7,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, textAlign: 'right' }}>مشتريات اليوم</h3>
            <p style={{ fontSize: 14, color: C.gray, textAlign: 'center', marginTop: 8 }}>تم ✓</p>
          </div>

          {/* Summary card */}
          <div style={{
            background: '#fff', borderRadius: C.radius, padding: '24px 20px',
            boxShadow: C.shadow,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, textAlign: 'right' }}>
              ملخص اليوم
            </h3>
            {[
              { icon: <TrendingUp size={20} color={C.green} />, label: 'إجمالي المبيعات', value: todaySalesTotal, color: C.green, bg: '#F0FDF4' },
              { icon: <ShoppingBag size={20} color={C.orange} />, label: 'إجمالي المشتريات', value: todayPurchasesTotal, color: C.orange, bg: '#FFF7ED' },
              { icon: <Package size={20} color={C.blue} />, label: 'قيمة المخزون الختامي', value: stockValue, color: C.blue, bg: '#EFF6FF' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: row.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{row.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: row.color }}>
                  {fmt(row.value)} <span style={{ fontSize: 12, fontWeight: 600 }}>DA</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close day button */}
      {step >= 3 && (
        <div style={{ padding: '20px 16px 100px' }}>
          <button
            onClick={onClose}
            disabled={isClosed}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              background: isClosed ? '#ccc' : C.dark, color: '#fff', border: 'none',
              fontSize: 16, fontWeight: 700, cursor: isClosed ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Lock size={18} />
            {isClosed ? 'تم إغلاق اليوم ✓' : 'إغلاق اليوم نهائياً'}
          </button>
          {!isClosed && (
            <p style={{ fontSize: 12, color: C.red, textAlign: 'center', marginTop: 8 }}>
              لا يمكن التراجع عن هذا الإجراء
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 5: REPORTS (التقارير)
   ═══════════════════════════════════════════ */
function ReportsScreen({ products, todaySales, todaySalesTotal, todayPurchasesTotal, todayProfit, onShowDetails }) {
  const [period, setPeriod] = useState('اليوم');

  const salesCount = todaySales.length;

  // Simulated bar data for 7 days
  const barData = useMemo(() => {
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => ({
      day: arabicDays[(today - 6 + i + 7) % 7],
      value: i === 6 ? todaySalesTotal : Math.floor(Math.random() * 2000 + 500),
    }));
  }, [todaySalesTotal]);

  const maxBar = Math.max(...barData.map(d => d.value), 1);

  // Best products
  const bestProducts = useMemo(() => {
    const map = {};
    todaySales.forEach(s => {
      if (!map[s.productId]) map[s.productId] = { qty: 0, profit: 0 };
      map[s.productId].qty += s.qty;
      const p = products.find(pr => pr.id === s.productId);
      if (p) map[s.productId].profit += s.qty * (p.sellPrice - p.buyPrice);
    });
    return Object.entries(map)
      .map(([id, data]) => {
        const p = products.find(pr => pr.id === Number(id));
        return p ? { ...p, soldQty: data.qty, profit: data.profit } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.soldQty - a.soldQty);
  }, [todaySales, products]);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Menu size={22} color={C.dark} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>التقارير</h1>
        <ShoppingBag size={22} color={C.dark} />
      </div>

      {/* Period tabs */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{
          display: 'flex', borderRadius: 14, overflow: 'hidden',
          border: `1px solid ${C.border}`, background: '#fff',
        }}>
          {['الشهر', 'الأسبوع', 'اليوم'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '10px', fontSize: 13, fontWeight: 600,
              background: period === p ? C.blue : 'transparent',
              color: period === p ? '#fff' : C.dark,
              border: 'none', cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '8px 16px' }}>
        {[
          { label: 'إجمالي المبيعات', value: `${fmt(todaySalesTotal)} DA`, color: C.green },
          { label: 'إجمالي المشتريات', value: `${fmt(todayPurchasesTotal)} DA`, color: C.orange },
          { label: 'صافي الربح', value: `${fmt(todayProfit)} DA`, color: C.blue },
          { label: 'عدد المبيعات', value: salesCount, color: C.dark },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: C.radius, padding: '16px',
            boxShadow: C.shadow,
          }}>
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            {i === 2 && todayProfit > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: C.green,
                background: '#F0FDF4', padding: '2px 8px', borderRadius: 10,
                marginTop: 4, display: 'inline-block',
              }}>+{Math.round((todayProfit / Math.max(todaySalesTotal, 1)) * 100)}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ padding: '16px', background: '#fff', margin: '12px 16px', borderRadius: C.radius, boxShadow: C.shadow }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: C.dark }}>المبيعات - آخر 7 أيام</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 6 }}>
          {barData.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '100%', maxWidth: 30,
                height: Math.max(8, (d.value / maxBar) * 100),
                background: i === 6 ? C.blue : '#DBEAFE',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.5s ease',
              }} />
              <span style={{ fontSize: 9, color: C.gray, marginTop: 6 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best products */}
      <div style={{ padding: '4px 16px 8px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: C.dark }}>أفضل المنتجات مبيعاً</h3>
        {bestProducts.length === 0 && (
          <p style={{ fontSize: 13, color: C.gray, textAlign: 'center', padding: 20 }}>لا توجد مبيعات بعد</p>
        )}
        {bestProducts.map((p, i) => (
          <div key={p.id} style={{
            background: '#fff', borderRadius: 14, padding: '12px',
            marginBottom: 8, boxShadow: C.shadow,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%',
              background: i === 0 ? '#FEF3C7' : '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ fontSize: 22 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: C.gray, marginRight: 6 }}>×{p.soldQty}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{fmt(p.profit)} DA</span>
          </div>
        ))}
      </div>

      {/* Details button */}
      <div style={{ padding: '12px 16px 100px' }}>
        <button onClick={onShowDetails} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: '#fff', color: C.blue, border: `1.5px solid ${C.blue}`,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          تفاصيل الأرباح حسب المنتج ←
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 5b: PROFIT DETAILS (تفاصيل الأرباح)
   ═══════════════════════════════════════════ */
function ProfitDetailsScreen({ products, todaySales, dayRecord, onBack }) {
  const [period, setPeriod] = useState('اليوم');
  const [expanded, setExpanded] = useState({ 'مشروبات': true, 'أكل': true, 'أخرى': true });

  const categories = ['مشروبات', 'أكل', 'أخرى'];
  const categoryEmojis = { 'مشروبات': '🥤', 'أكل': '🍟', 'أخرى': '🧴' };

  // Calculate profit data per product
  const profitData = useMemo(() => {
    const data = {};
    products.forEach(p => {
      const openQty = dayRecord.openingQty[p.id] || p.qty;
      const purchasedQty = (dayRecord.purchases || [])
        .filter(r => r.productId === p.id)
        .reduce((s, r) => s + r.qty, 0);
      const soldQty = todaySales
        .filter(s => s.productId === p.id)
        .reduce((s, r) => s + r.qty, 0);
      const profit = soldQty * (p.sellPrice - p.buyPrice);

      data[p.id] = {
        product: p,
        ownedQty: p.qty,
        soldQty,
        profit,
        openQty,
      };
    });
    return data;
  }, [products, todaySales, dayRecord]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    categories.forEach(cat => {
      totals[cat] = products
        .filter(p => p.category === cat)
        .reduce((s, p) => s + (profitData[p.id]?.profit || 0), 0);
    });
    return totals;
  }, [products, profitData]);

  const totalProfit = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  const categoriesWithProducts = categories.filter(cat =>
    products.some(p => p.category === cat)
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Menu size={22} color={C.dark} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>تفاصيل الأرباح</h1>
        <ShoppingBag size={22} color={C.dark} />
      </div>

      {/* Period tabs */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{
          display: 'flex', borderRadius: 14, overflow: 'hidden',
          border: `1px solid ${C.border}`, background: '#fff',
        }}>
          {['الشهر', 'الأسبوع', 'اليوم'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '10px', fontSize: 13, fontWeight: 600,
              background: period === p ? C.blue : 'transparent',
              color: period === p ? '#fff' : C.dark,
              border: 'none', cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Blue banner */}
      <div style={{
        margin: '8px 16px', padding: '24px 20px',
        background: `linear-gradient(135deg, ${C.blue}, #1D4ED8)`,
        borderRadius: C.radius, textAlign: 'center', color: '#fff',
      }}>
        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>إجمالي الربح الصافي</p>
        <p style={{ fontSize: 42, fontWeight: 800, marginBottom: 4 }}>
          {fmt(totalProfit)} <span style={{ fontSize: 18 }}>DA</span>
        </p>
        <p style={{ fontSize: 12, opacity: 0.8 }}>
          من {categoriesWithProducts.length} فئات | {products.length} منتج
        </p>
      </div>

      {/* Category cards */}
      {categoriesWithProducts.map(cat => (
        <div key={cat} style={{
          margin: '12px 16px', background: '#fff',
          borderRadius: C.radius, boxShadow: C.shadow, overflow: 'hidden',
        }}>
          {/* Category header */}
          <div
            onClick={() => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{categoryEmojis[cat]}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{cat}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{fmt(categoryTotals[cat])} DA</span>
              {expanded[cat] ? <ChevronUp size={18} color={C.gray} /> : <ChevronDown size={18} color={C.gray} />}
            </div>
          </div>

          {/* Product table */}
          {expanded[cat] && (
            <div style={{ padding: '0 16px 16px' }}>
              {/* Header row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr',
                padding: '8px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>المنتج</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'center' }}>المخزون المملوك</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'center' }}>المخزون المبيع</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'left' }}>الربح</span>
              </div>
              {/* Product rows */}
              {products.filter(p => p.category === cat).map(p => {
                const d = profitData[p.id];
                return (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr',
                    padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                    alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>{p.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                    </div>
                    {p.qty === 0 ? (
                      <>
                        <span style={{ fontSize: 11, color: C.red, fontWeight: 600, textAlign: 'center' }}>نفد المخزون</span>
                        <span style={{ fontSize: 11, textAlign: 'center' }}>-</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, textAlign: 'center' }}>{d?.ownedQty} وحدة</span>
                        <span style={{ fontSize: 12, textAlign: 'center' }}>{d?.soldQty} وحدة</span>
                      </>
                    )}
                    <span style={{
                      fontSize: 13, fontWeight: 700, textAlign: 'left',
                      color: d?.profit > 0 ? C.green : C.red,
                    }}>
                      {fmt(d?.profit || 0)} DA
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Sticky bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 390, background: C.blue,
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', zIndex: 100,
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>إجمالي كل الفئات:</span>
        <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
          {fmt(totalProfit)} <span style={{ fontSize: 14 }}>DA</span>
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 6: ADD/EDIT PRODUCT
   ═══════════════════════════════════════════ */
function ProductFormScreen({ product, onSave, onDelete, onToggle, onBack }) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [emoji, setEmoji] = useState(product?.emoji || '📦');
  const [buyPrice, setBuyPrice] = useState(String(product?.buyPrice || '0'));
  const [sellPrice, setSellPrice] = useState(String(product?.sellPrice || '0'));
  const [qty, setQty] = useState(product?.qty || 0);
  const [barcode, setBarcode] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const profit = (Number(sellPrice) || 0) - (Number(buyPrice) || 0);

  const handleSave = () => {
    if (!name || !category) return;
    onSave({
      name, category, emoji,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      qty, minAlert: 5,
    });
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 14, color: C.dark,
        }}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>
          {isEdit ? 'تعديل المنتج' : 'إضافة منتج'}
        </h1>
        <button onClick={handleSave} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, color: C.dark,
        }}>حفظ</button>
      </div>

      <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
        {/* Image area */}
        <div style={{
          background: '#F9FAFB', borderRadius: C.radius, padding: '32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', marginBottom: 20,
          border: `1px dashed ${C.border}`, position: 'relative',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
          <div style={{ fontSize: 13, color: C.gray }}>
            {isEdit ? '' : 'إضافة صورة'}
          </div>
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff', boxShadow: C.shadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✏️</div>
        </div>

        {/* Product name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6, display: 'block' }}>
            اسم المنتج
          </label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="أدخل اسم المنتج"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: `1px solid ${C.border}`, fontSize: 14,
              outline: 'none', textAlign: 'right', direction: 'rtl',
              background: '#FAFAFA',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6, display: 'block' }}>
            التصنيف
          </label>
          <div onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: `1px solid ${C.border}`, fontSize: 14,
            background: '#FAFAFA', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <ChevronDown size={16} color={C.gray} />
            <span style={{ color: category ? C.dark : C.gray }}>
              {category || 'اختر التصنيف'}
            </span>
          </div>
          {showCategoryDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff', borderRadius: 12, marginTop: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 50,
            }}>
              {['مشروبات', 'أكل', 'أخرى'].map(c => (
                <div key={c} onClick={() => { setCategory(c); setShowCategoryDropdown(false); }} style={{
                  padding: '12px 16px', cursor: 'pointer', fontSize: 14,
                  background: category === c ? '#F0F7FF' : 'transparent',
                }}>{c}</div>
              ))}
            </div>
          )}
        </div>

        {/* Barcode */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6, display: 'block' }}>
            الباركود
          </label>
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '12px 14px', borderRadius: 12,
            border: `1px solid ${C.border}`, background: '#FAFAFA',
          }}>
            <input
              value={barcode} onChange={e => setBarcode(e.target.value)}
              placeholder="الباركود"
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 14,
                background: 'transparent', textAlign: 'right', direction: 'rtl',
              }}
            />
            <span style={{ fontSize: 18 }}>📊</span>
          </div>
        </div>

        {/* Two columns: Buy price + Stock management */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {/* Buy price */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 6, display: 'block' }}>
              سعر الشراء (DA)
            </label>
            <input
              type="number" value={buyPrice}
              onChange={e => setBuyPrice(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700,
                outline: 'none', textAlign: 'center', background: '#FAFAFA',
              }}
            />
          </div>
          {/* Stock management */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 2, display: 'block' }}>
              إدارة المخزون
            </label>
            <label style={{ fontSize: 10, color: C.gray, marginBottom: 4, display: 'block' }}>
              الكمية المتوفرة
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '6px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA',
            }}>
              <button onClick={() => setQty(Math.max(0, qty - 1))} style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#f0f0f0', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Minus size={14} /></button>
              <span style={{ fontSize: 24, fontWeight: 800, minWidth: 40, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#f0f0f0', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Plus size={14} /></button>
            </div>
            <div style={{ fontSize: 11, color: C.gray, textAlign: 'center', marginTop: 4 }}>
              {qty} باقي
            </div>
          </div>
        </div>

        {/* Sell price */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 6, display: 'block' }}>
            سعر البيع (DA)
          </label>
          <input
            type="number" value={sellPrice}
            onChange={e => setSellPrice(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700,
              outline: 'none', textAlign: 'center', background: '#FAFAFA',
            }}
          />
        </div>

        {/* Profit (read only) */}
        <div style={{
          padding: '8px 14px', marginBottom: 24,
          fontSize: 13, color: C.gray,
        }}>
          الربح المحقق (DA): <span style={{ fontWeight: 700, color: profit >= 0 ? C.green : C.red }}>{profit.toFixed(2)}</span>
          <br />
          <span style={{ fontSize: 11 }}>= سعر البيع − سعر الشراء</span>
        </div>

        {/* Buttons */}
        {isEdit ? (
          <>
            <button onClick={handleSave} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: C.green, color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Save size={18} /> حفظ التغييرات
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => onToggle(product.id)} style={{
                flex: 1, padding: '12px', borderRadius: 14,
                background: '#f0f0f0', color: C.gray, border: `1px solid ${C.border}`,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Power size={16} /> تعطيل المنتج
              </button>
              <button onClick={() => onDelete(product.id)} style={{
                flex: 1, padding: '12px', borderRadius: 14,
                background: C.red, color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Trash2 size={16} /> حذف المنتج
              </button>
            </div>
          </>
        ) : (
          <button onClick={handleSave} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: C.blue, color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Save size={18} /> حفظ المنتج
          </button>
        )}
      </div>
    </div>
  );
}
