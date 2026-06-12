import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ShoppingCart, Package, ShoppingBag, Moon, BarChart3,
  Search, Menu, Bell, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Minus, Check, X, Lock, TrendingUp, Wallet,
  Save, Trash2, Power, Filter, RotateCcw, Download, Share2, User,
  Truck, Receipt, Pencil, ImagePlus,
  LayoutGrid, Printer, Settings, HelpCircle, BookOpen, Users,
  CreditCard, Hand, ClipboardCheck, MessageCircle
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

const DEFAULT_CATEGORIES = ['مشروبات', 'أكل', 'أخرى'];
const ALL_FILTER = 'الكل';
const CATEGORY_FILTER_PREFIX = 'category:';
const MANAGE_CATEGORIES_LABEL = 'فئات ▾';

const uniqueCategories = (items) => [
  ...new Set(
    items
      .map(item => String(item || '').trim())
      .filter(Boolean)
  )
];

const getCategoryFilter = (category) => `${CATEGORY_FILTER_PREFIX}${category}`;
const isCategoryFilter = (filter) => String(filter || '').startsWith(CATEGORY_FILTER_PREFIX);
const categoryFromFilter = (filter) => String(filter || '').slice(CATEGORY_FILTER_PREFIX.length);

const getDaysAgo = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 0;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.max(0, Math.floor((todayStart - start) / 86400000));
};

const categoryColors = {
  'مشروبات': { bg: '#EBF4FF', accent: '#2563EB' },
  'أكل': { bg: '#FFF1F0', accent: '#E67E00' },
  'أخرى': { bg: '#F0FFF4', accent: '#16A34A' },
};

const fmt = (n) => Number(n).toLocaleString('en-US');

const UNITS = ['غ', 'مل', 'قطعة'];
const VARIANCE_REASONS = ['هدر', 'أشك في سرقة', 'أنا أخذته', 'خطأ في العد'];
const getExpectedQty = (ing) =>
  (Number(ing.starting_stock) || 0) - (Number(ing.sales_deducted) || 0) - (Number(ing.taken_deducted) || 0);

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
          padding: '16px 12px 12px', textAlign: 'center',
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
        <div style={{ fontSize: 15, fontWeight: 600, color: C.dark, marginBottom: 6, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.blue }}>{product.sellPrice} <span style={{ fontSize: 13 }}>DA</span></div>
        <div style={{ fontSize: 13, color: C.gray, marginTop: 6, textAlign: 'left', direction: 'ltr' }}>× {product.qty}</div>
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
  const [categories, setCategories] = useLocalStorage('pos_categories', DEFAULT_CATEGORIES);
  const [cart, setCart] = useState([]);
  const [todaySales, setTodaySales] = useLocalStorage('pos_todaySales', []);
  const [todayPurchases, setTodayPurchases] = useLocalStorage('pos_todayPurchases', []);
  const [debts] = useLocalStorage('pos_debts', []);
  const [ingredients, setIngredients] = useLocalStorage('pos_ingredients', []);
  const [stockSessions, setStockSessions] = useLocalStorage('pos_stock_sessions', []);
  const [stockEntries, setStockEntries] = useLocalStorage('pos_stock_entries', []);
  const [ownerTookLog, setOwnerTookLog] = useLocalStorage('pos_owner_took_log', []);
  const [productRecipes, setProductRecipes] = useLocalStorage('pos_product_recipes', []);
  const [settings] = useLocalStorage('pos_settings', { shopName: 'متجري' });
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
  const [detailProductId, setDetailProductId] = useState(null);
  const [showProductsList, setShowProductsList] = useState(false);
  const [morePage, setMorePage] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);

  // Initialize opening qty if empty
  useEffect(() => {
    if (Object.keys(dayRecord.openingQty).length === 0) {
      const oq = {};
      products.forEach(p => { oq[p.id] = p.qty; });
      setDayRecord(prev => ({ ...prev, openingQty: oq }));
    }
  }, []);

  useEffect(() => {
    setCategories(prev => {
      const merged = uniqueCategories([...DEFAULT_CATEGORIES, ...prev, ...products.map(product => product.category)]);
      return merged.length === prev.length && merged.every((category, index) => category === prev[index]) ? prev : merged;
    });
  }, [products, setCategories]);

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
    // Recipe products: deduct ingredients instead of product stock
    const ingredientDeductions = {};
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (!cartItem) return p;
      const recipe = productRecipes.filter(r => r.product_id === p.id);
      if (p.has_recipe && recipe.length > 0) {
        recipe.forEach(r => {
          ingredientDeductions[r.ingredient_id] = (ingredientDeductions[r.ingredient_id] || 0) + r.quantity_used * cartItem.qty;
        });
        return p;
      }
      return { ...p, qty: p.qty - cartItem.qty };
    });
    if (Object.keys(ingredientDeductions).length > 0) {
      setIngredients(prev => prev.map(ing => ingredientDeductions[ing.id]
        ? { ...ing, sales_deducted: (Number(ing.sales_deducted) || 0) + ingredientDeductions[ing.id] }
        : ing));
    }
    setProducts(updatedProducts);
    setTodaySales(prev => [...prev, ...salesRecords]);
    const d = new Date();
    setLastReceipt({
      number: `R-${d.getTime().toString().slice(-8)}`,
      dateText: getArabicDate(),
      timeText: d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      items: cart.map(item => {
        const p = products.find(pr => pr.id === item.productId);
        return { name: p.name, qty: item.qty, price: p.sellPrice, total: item.qty * p.sellPrice };
      }),
      total: salesRecords.reduce((s, r) => s + r.total, 0),
    });
    setCart([]);
    showSuccess('تمت عملية البيع بنجاح ✓');
  }, [cart, products, productRecipes, setIngredients]);

  // Purchase handler
  const handlePurchase = useCallback((supplier, items, totalAmount) => {
    if (!items || items.length === 0) return null;
    
    // Add purchased quantities to each ingredient's starting stock
    setIngredients(prev => prev.map(ing => {
      const purchasedItem = items.find(i => i.productId === ing.id);
      if (purchasedItem) {
        return { ...ing, starting_stock: (Number(ing.starting_stock) || 0) + purchasedItem.qty };
      }
      return ing;
    }));
    
    const d = new Date();
    const timeString = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const record = {
      id: Date.now(),
      date: `${getArabicDate().split('،')[0]} ${d.getDate()} ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()]} — ${timeString}`,
      supplier: supplier || 'غير محدد',
      items: items,
      total: totalAmount,
    };
    
    setTodayPurchases(prev => [...prev, record]);
    setAllPurchases(prev => [record, ...prev]);
    showSuccess('تم حفظ المشتريات بنجاح ✓');
    return record;
  }, []);

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

  const handleAddCategory = useCallback((name) => {
    const clean = name.trim();
    if (!clean) return false;
    let changed = false;
    setCategories(prev => {
      const next = uniqueCategories([...DEFAULT_CATEGORIES, ...prev, clean]);
      changed = next.length !== prev.length;
      return next;
    });
    return changed;
  }, [setCategories]);

  const handleRenameCategory = useCallback((oldName, newName) => {
    const clean = newName.trim();
    if (!oldName || !clean) return false;
    setCategories(prev => uniqueCategories([...DEFAULT_CATEGORIES, ...prev.map(category => category === oldName ? clean : category)]));
    setProducts(prev => prev.map(product => product.category === oldName ? { ...product, category: clean } : product));
    return true;
  }, [setCategories]);

  const handleDeleteCategory = useCallback((name) => {
    if (DEFAULT_CATEGORIES.includes(name) || products.some(product => product.category === name)) return false;
    setCategories(prev => uniqueCategories([...DEFAULT_CATEGORIES, ...prev.filter(category => category !== name)]));
    return true;
  }, [products, setCategories]);

  // Export Data Feature
  const handleExportData = () => {
    const data = { products, categories, todaySales, todayPurchases, allPurchases, pastDays, dayRecord, debts };
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
        categories={categories}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        onRestore={handleRestoreProduct}
        onToggle={handleToggleProduct}
        onBack={() => { setShowProductForm(false); setEditingProduct(null); }}
      />;
    }
    const detailProduct = detailProductId ? products.find(p => p.id === detailProductId) : null;
    if (detailProduct) {
      return <ProductDetailScreen
        product={detailProduct}
        products={products}
        setProducts={setProducts}
        ingredients={ingredients}
        productRecipes={productRecipes}
        setProductRecipes={setProductRecipes}
        todaySales={todaySales}
        showSuccess={showSuccess}
        onBack={() => setDetailProductId(null)}
      />;
    }
    if (showProductsList) {
      return <InventoryScreen
        products={products}
        categories={categories}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddProduct={() => { setEditingProduct(null); setShowProductForm(true); }}
        onEditProduct={(p) => setDetailProductId(p.id)}
        onBack={() => setShowProductsList(false)}
      />;
    }
    if (morePage) {
      return <PlaceholderScreen title={morePage} onBack={() => setMorePage(null)} />;
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
      case 0: return <SellScreen products={products} categories={categories} cart={cart} setCart={setCart} onSell={handleSell} />;
      case 1: return <StockScreen
        ingredients={ingredients}
        setIngredients={setIngredients}
        stockSessions={stockSessions}
        setStockSessions={setStockSessions}
        stockEntries={stockEntries}
        setStockEntries={setStockEntries}
        ownerTookLog={ownerTookLog}
        setOwnerTookLog={setOwnerTookLog}
        setProductRecipes={setProductRecipes}
        showSuccess={showSuccess}
        onOpenProducts={() => setShowProductsList(true)}
      />;
      case 2: return <PurchaseScreen
        products={ingredients.map(ing => ({ id: ing.id, name: ing.name, buyPrice: Number(ing.cost_per_unit) || 0, emoji: '🧺', unit: ing.unit }))}
        categories={[]}
        onPurchase={handlePurchase}
        monthTotal={monthPurchasesTotal}
        recentPurchases={allPurchases.slice(0, 3)}
        allPurchases={allPurchases}
      />;
      case 3: return <ReportsScreen
        products={products}
        todaySales={todaySales}
        todaySalesTotal={todaySalesTotal}
        todayPurchasesTotal={todayPurchasesTotal}
        todayProfit={todayProfit}
        debts={debts}
        onShowDetails={() => setReportView('details')}
        onShowCloseDay={() => setShowCloseDay(true)}
        onExport={handleExportData}
        onShare={handleWhatsAppShare}
        onOpenProduct={(p) => setDetailProductId(p.id)}
      />;
      case 4: return <MoreScreen
        onOpenReports={() => setActiveTab(3)}
        onOpenPage={(title) => setMorePage(title)}
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
      {lastReceipt && (
        <ReceiptModal
          receipt={lastReceipt}
          shopName={settings?.shopName || 'متجري'}
          onClose={() => setLastReceipt(null)}
        />
      )}
      {!showProductForm && reportView !== 'details' && !showCloseDay && !detailProductId && (
        <BottomNav activeTab={activeTab} setActiveTab={(i) => { setMorePage(null); setShowProductsList(false); setActiveTab(i); }} lowStockCount={lowStockCount} />
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
    { icon: LayoutGrid, label: 'المزيد' },
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
function HeaderIconButton({ onClick, children, label, badge }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        border: 'none',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        padding: 0,
      }}
    >
      {children}
      {badge > 0 && (
        <span style={{
          position: 'absolute',
          top: 2,
          right: 2,
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          borderRadius: 999,
          background: C.red,
          color: '#fff',
          fontSize: 9,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}>{badge}</span>
      )}
    </button>
  );
}

function AppHeader({ title, subtitle, left, right, border = false }) {
  return (
    <div style={{
      background: '#fff',
      padding: '16px 20px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: border ? `1px solid ${C.border}` : 'none',
      direction: 'ltr',
    }}>
      <div style={{ width: 80, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
        {left}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'center', direction: 'rtl' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.dark, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: C.gray, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>}
      </div>
      <div style={{ width: 80, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        {right}
      </div>
    </div>
  );
}

function CategoryManagerSheet({ open, categories, products, selectedFilter, onSelectCategory, onAddCategory, onRenameCategory, onDeleteCategory, onClose }) {
  const [mode, setMode] = useState('list');
  const [draft, setDraft] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!open) return;
    setMode('list');
    setDraft('');
    setEditingCategory(null);
  }, [open]);

  const counts = useMemo(() => {
    const map = {};
    categories.forEach(category => { map[category] = 0; });
    products.forEach(product => {
      if (!product.category) return;
      map[product.category] = (map[product.category] || 0) + 1;
    });
    return map;
  }, [categories, products]);

  if (!open) return null;

  const submit = () => {
    const clean = draft.trim();
    if (!clean) return;
    const saved = mode === 'edit'
      ? onRenameCategory(editingCategory, clean)
      : onAddCategory(clean);
    if (saved === false) return;
    setMode('list');
    setDraft('');
    setEditingCategory(null);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 220, animation: 'fadeInBg 0.2s ease' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, maxHeight: '85vh', background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 221, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color={C.dark} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>الفئات</h2>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
          {categories.map(category => {
            const count = counts[category] || 0;
            const active = selectedFilter === getCategoryFilter(category);
            const canDelete = count === 0 && !DEFAULT_CATEGORIES.includes(category);
            const isEditing = mode === 'edit' && editingCategory === category;

            if (isEditing) {
              return (
                <div key={category} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <input value={draft} onChange={event => setDraft(event.target.value)} autoFocus style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, textAlign: 'right', direction: 'rtl', boxSizing: 'border-box', marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={submit} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>حفظ</button>
                    <button onClick={() => { setMode('list'); setEditingCategory(null); }} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.dark, fontWeight: 800, cursor: 'pointer' }}>إلغاء</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <button onClick={() => { onSelectCategory(category); onClose(); }} style={{ flex: 1, border: active ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: active ? '#EFF6FF' : '#fff', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{category}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>{count} منتج</span>
                </button>
                <button onClick={() => { setMode('edit'); setDraft(category); setEditingCategory(category); }} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Pencil size={16} color={C.dark} />
                </button>
                {canDelete && (
                  <button onClick={() => onDeleteCategory(category)} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={16} color={C.red} />
                  </button>
                )}
              </div>
            );
          })}

          {mode === 'add' ? (
            <div style={{ paddingTop: 14 }}>
              <input value={draft} onChange={event => setDraft(event.target.value)} autoFocus placeholder="اسم الفئة" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, textAlign: 'right', direction: 'rtl', boxSizing: 'border-box', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={submit} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>حفظ</button>
                <button onClick={() => setMode('list')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.dark, fontWeight: 800, cursor: 'pointer' }}>إلغاء</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setMode('add'); setDraft(''); setEditingCategory(null); }} style={{ width: '100%', marginTop: 14, padding: '14px', borderRadius: 14, border: 'none', background: C.dark, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>إضافة فئة جديدة +</button>
          )}
        </div>
      </div>
    </>
  );
}

function CartDetailsSheet({ open, cart, products, setCart, onSell, onClose }) {
  const items = useMemo(() => cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean), [cart, products]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.product.sellPrice, 0), [items]);

  if (!open) return null;

  const updateQty = (productId, nextQty) => {
    setCart(prev => prev.flatMap(item => {
      if (item.productId !== productId) return [item];
      const product = products.find(p => p.id === productId);
      const maxQty = product?.qty || item.qty;
      const qty = Math.max(0, Math.min(maxQty, nextQty));
      return qty === 0 ? [] : [{ ...item, qty }];
    }));
  };

  const completeSale = () => {
    if (items.length === 0) return;
    onSell();
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 220, animation: 'fadeInBg 0.2s ease' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, maxHeight: '85vh', background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 221, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color={C.dark} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>السلة</h2>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>السلة فارغة</div>
          ) : items.map(item => (
            <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => updateQty(item.productId, 0)} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Trash2 size={15} color={C.red} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ProductEntity product={item.product} variant="small" />
                <div style={{ fontSize: 12, color: C.blue, fontWeight: 800, marginTop: 4, textAlign: 'right' }}>{fmt(item.qty * item.product.sellPrice)} DA</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FAFAFA', borderRadius: 10, padding: 4, flexShrink: 0 }}>
                <button onClick={() => updateQty(item.productId, item.qty - 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Minus size={14} color={C.dark} />
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: 800 }}>{item.qty}</span>
                <button onClick={() => updateQty(item.productId, item.qty + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={14} color="#fff" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px 22px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{fmt(total)} <span style={{ fontSize: 13 }}>DA</span></span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>الإجمالي</span>
          </div>
          <button onClick={completeSale} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.green, color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <Check size={20} /> بيع
          </button>
        </div>
      </div>
    </>
  );
}

function ReportsDrawer({ open, onClose, products, todaySales, debts }) {
  const [activeTab, setActiveTab] = useState('sales');
  const safeDebts = Array.isArray(debts) ? debts : [];

  useEffect(() => {
    if (open) setActiveTab('sales');
  }, [open]);

  const salesTotal = useMemo(() => todaySales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0), [todaySales]);
  const pendingDebts = useMemo(() => safeDebts.filter(debt => {
    const status = String(debt.status || '').toLowerCase();
    return status !== 'paid' && status !== 'done' && !debt.paid && !debt.isPaid;
  }), [safeDebts]);
  const debtsTotal = useMemo(() => pendingDebts.reduce((sum, debt) => sum + Number(debt.amount ?? debt.total ?? debt.balance ?? 0), 0), [pendingDebts]);

  if (!open) return null;

  const openWhatsApp = (debt) => {
    const phone = String(debt.phone || debt.whatsapp || debt.mobile || '').replace(/[^\d+]/g, '');
    if (!phone) return;
    const amount = Number(debt.amount ?? debt.total ?? debt.balance ?? 0);
    const name = debt.customerName || debt.customer || debt.name || 'زبون';
    const text = encodeURIComponent(`سلام ${name}، المبلغ المتبقي هو ${fmt(amount)} DA`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 240, animation: 'fadeInBg 0.2s ease' }} />
      <div style={{ position: 'fixed', top: '7.5vh', right: 'max(0px, calc((100vw - 390px) / 2))', width: 'min(360px, 92vw)', height: '85vh', background: '#fff', borderRadius: '24px 0 0 24px', zIndex: 241, animation: 'slideInRight 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-10px 0 30px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color={C.dark} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>تفاصيل اليوم</h2>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          {[
            { id: 'sales', label: 'المبيعات اليوم' },
            { id: 'debts', label: 'شحال يسالوك' },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '9px 10px', borderRadius: 999, border: active ? 'none' : `1px solid ${C.border}`, background: active ? C.blue : '#fff', color: active ? '#fff' : C.dark, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{tab.label}</button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 18px' }}>
          {activeTab === 'sales' ? (
            <>
              {todaySales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>لا توجد مبيعات اليوم</div>
              ) : todaySales.map((sale, index) => {
                const product = products.find(p => p.id === sale.productId) || { id: sale.productId || index, name: sale.productName || 'منتج', emoji: sale.emoji || '📦', image: sale.image || '', category: sale.category || 'أخرى' };
                return (
                  <div key={`${sale.productId}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                    <ProductEntity product={product} variant="tiny" />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>× {sale.qty}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.blue }}>{fmt(sale.total)} DA</div>
                  </div>
                );
              })}
              {todaySales.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, fontSize: 17, fontWeight: 900 }}>
                  <span style={{ color: C.blue }}>{fmt(salesTotal)} DA</span>
                  <span style={{ color: C.dark }}>الإجمالي:</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ color: C.red, fontSize: 17, fontWeight: 900, padding: '10px 0 14px', textAlign: 'right' }}>إجمالي الديون: {fmt(debtsTotal)} DA</div>
              {pendingDebts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>لا توجد ديون حالياً</div>
              ) : pendingDebts.map((debt, index) => {
                const amount = Number(debt.amount ?? debt.total ?? debt.balance ?? 0);
                const name = debt.customerName || debt.customer || debt.name || 'زبون';
                const phone = debt.phone || debt.whatsapp || debt.mobile;
                return (
                  <div key={debt.id || index} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                    {phone && <button onClick={() => openWhatsApp(debt)} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', background: '#DCFCE7', color: C.green, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>WA</button>}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.dark }}>{name}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>منذ {getDaysAgo(debt.date || debt.createdAt || debt.created_at)} أيام</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.red }}>{fmt(amount)} DA</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SellScreen({ products, categories, cart, setCart, onSell }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [showCartSheet, setShowCartSheet] = useState(false);

  const categoryFilters = useMemo(() => [ALL_FILTER, ...categories], [categories]);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.is_active);
    if (category !== ALL_FILTER) list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.name.includes(search));
    return list;
  }, [products, category, search]);

  const cartTotal = useMemo(() => cart.reduce((s, c) => {
    const p = products.find(pr => pr.id === c.productId);
    return s + (p ? c.qty * p.sellPrice : 0);
  }, 0), [cart, products]);
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);

  const addOneToCart = (product) => {
    if (!product || product.qty === 0 || !product.is_active) return;
    setCart(prev => {
      const existing = prev.findIndex(c => c.productId === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: Math.min(product.qty, updated[existing].qty + 1) };
        return updated;
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });
  };

  return (
    <div>
      <AppHeader
        title="البيع"
        right={(
          <HeaderIconButton label="السلة" badge={cartCount} onClick={() => setShowCartSheet(true)}>
            <ShoppingCart size={24} color={C.dark} />
          </HeaderIconButton>
        )}
      />

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
          <Search size={18} color={C.gray} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent', textAlign: 'right', direction: 'rtl' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', overflowX: 'auto', direction: 'rtl' }}>
        {categoryFilters.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 20px', borderRadius: 24, fontSize: 13, fontWeight: 600, border: category === cat ? 'none' : `1px solid ${C.border}`,
            background: category === cat ? C.blue : '#fff', color: category === cat ? '#fff' : C.dark, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '8px 12px', paddingBottom: cart.length > 0 ? 80 : 16 }}>
        {filtered.map(p => (
          <ProductEntity key={p.id} product={p} variant="grid" inCart={cart.find(c => c.productId === p.id)} onClick={() => addOneToCart(p)} />
        ))}
      </div>

      {cart.length > 0 && (
        <div onClick={() => setShowCartSheet(true)} style={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderTop: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 90, cursor: 'pointer' }}>
          <span style={{ fontSize: 13, color: C.gray }}>{cart.length} منتجات</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{fmt(cartTotal)} <span style={{ fontSize: 14 }}>DA</span></span>
          <button onClick={(event) => { event.stopPropagation(); onSell(); }} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={18} /> بيع
          </button>
        </div>
      )}

      <CartDetailsSheet
        open={showCartSheet}
        cart={cart}
        products={products}
        setCart={setCart}
        onSell={onSell}
        onClose={() => setShowCartSheet(false)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 2: INVENTORY (المخزون)
   ═══════════════════════════════════════════ */
function InventoryScreen({ products, categories, onAddCategory, onRenameCategory, onDeleteCategory, onAddProduct, onEditProduct }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(ALL_FILTER);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const activeProducts = useMemo(() => products.filter(p => p.is_active), [products]);
  const stats = useMemo(() => ({
    total: activeProducts.length,
    low: activeProducts.filter(p => p.qty > 0 && p.qty <= p.minAlert).length,
    out: activeProducts.filter(p => p.qty === 0).length,
    value: activeProducts.reduce((s, p) => s + p.qty * p.buyPrice, 0),
  }), [activeProducts]);

  const filtered = useMemo(() => {
    let list = filter === 'المعطلة' ? products.filter(p => !p.is_active) : [...activeProducts];
    if (search) list = list.filter(p => p.name.includes(search));
    if (filter === 'منخفضة المخزون') list = list.filter(p => p.qty > 0 && p.qty <= p.minAlert);
    else if (filter === 'نفدت الكمية') list = list.filter(p => p.qty === 0);
    else if (isCategoryFilter(filter)) list = list.filter(p => p.category === categoryFromFilter(filter));
    return list;
  }, [products, activeProducts, search, filter]);

  const filters = useMemo(() => [
    { label: ALL_FILTER, value: ALL_FILTER },
    { label: 'الأكثر مبيعاً', value: 'الأكثر مبيعاً' },
    { label: 'منخفضة المخزون', value: 'منخفضة المخزون' },
    { label: 'نفدت الكمية', value: 'نفدت الكمية' },
    { label: 'المعطلة', value: 'المعطلة' },
    ...categories.map(category => ({ label: category, value: getCategoryFilter(category) })),
    { label: MANAGE_CATEGORIES_LABEL, value: MANAGE_CATEGORIES_LABEL },
  ], [categories]);

  const selectedLabel = isCategoryFilter(filter) ? categoryFromFilter(filter) : filter;

  return (
    <div>
      <AppHeader
        title="المخزون"
        left={<HeaderIconButton label="القائمة"><Menu size={22} color={C.dark} /></HeaderIconButton>}
        right={<HeaderIconButton label="تنبيهات المخزون" badge={stats.low}><Bell size={22} color={C.dark} /></HeaderIconButton>}
      />

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
          const isActive = filter === f.value;
          const isManage = f.value === MANAGE_CATEGORIES_LABEL;
          return (
            <button key={f.value} onClick={() => isManage ? setShowCategorySheet(true) : setFilter(f.value)} style={{
              padding: '8px 16px', borderRadius: 24, fontSize: 13, fontWeight: 600,
              background: isActive ? '#1A1A1A' : '#fff',
              color: isActive ? '#fff' : C.dark,
              border: isActive ? 'none' : `1px solid ${C.border}`,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.2s ease'
            }}>{f.label}</button>
          );
        })}
      </div>

      <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: C.gray }}>{selectedLabel} ({filtered.length})</span>
        <span style={{ fontSize: 12, color: C.gray }}>ترتيب: الاسم</span>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 100 }}>
        {filtered.map(p => (
          <ProductEntity key={p.id} product={p} variant="list" onClick={() => onEditProduct(p)} />
        ))}
      </div>

      <button aria-label="إضافة منتج" onClick={onAddProduct} style={{ position: 'fixed', bottom: 90, right: 'calc(50% - 175px)', width: 52, height: 52, borderRadius: '50%', background: C.dark, color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
        <Plus size={24} />
      </button>

      <CategoryManagerSheet
        open={showCategorySheet}
        categories={categories}
        products={products}
        selectedFilter={filter}
        onSelectCategory={(categoryName) => setFilter(getCategoryFilter(categoryName))}
        onAddCategory={onAddCategory}
        onRenameCategory={onRenameCategory}
        onDeleteCategory={onDeleteCategory}
        onClose={() => setShowCategorySheet(false)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 3: PURCHASE (الشراء)
   ═══════════════════════════════════════════ */
function PurchaseScreen({ products, categories, onPurchase, monthTotal, recentPurchases, allPurchases }) {
  const [supplier, setSupplier] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [lastSavedPurchase, setLastSavedPurchase] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectorCategory, setSelectorCategory] = useState(ALL_FILTER);

  const renderHistoryItem = (r, i) => {
    // Compatibility for old single-item entries
    const isBulk = r.items && Array.isArray(r.items);
    const itemsCount = isBulk ? r.items.length : 1;
    const displayItems = isBulk ? r.items : [{ productName: r.productName, emoji: r.emoji, qty: r.qty, subtotal: r.total }];
    const expanded = expandedHistoryId === r.id;

    return (
      <div key={r.id || i} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
        <div onClick={() => setExpandedHistoryId(expanded ? null : r.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.blue }}>{fmt(r.total)} DA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <button onClick={(e) => { e.stopPropagation(); setLastSavedPurchase(r); setShowSuccessSheet(true); }} style={{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Receipt size={14} color={C.dark} />
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '0 12px', textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{r.supplier || 'غير محدد'}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{itemsCount} منتجات</div>
          </div>
          
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: 11, color: C.gray }}>{r.date || 'اليوم'}</span>
            {expanded ? <ChevronUp size={16} color={C.gray} /> : <ChevronDown size={16} color={C.gray} />}
          </div>
        </div>
        
        {expanded && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
            {displayItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: C.dark }}>{fmt(item.subtotal)} DA</span>
                <span style={{ color: C.gray }}>{item.productName} × {item.qty}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalAmount = useMemo(() => {
    return purchaseItems.reduce((sum, item) => {
      const p = products.find(pr => pr.id === item.productId);
      return sum + (item.qty * (p?.buyPrice || 0));
    }, 0);
  }, [purchaseItems, products]);

  const selectorProducts = useMemo(() => {
    if (selectorCategory === ALL_FILTER) return products;
    return products.filter(product => product.category === selectorCategory);
  }, [products, selectorCategory]);

  const handleProductSelect = (product) => {
    const existing = purchaseItems.find(item => item.productId === product.id);
    if (existing) {
      handleUpdateRow(existing.id, 'qty', existing.qty + 1);
    } else {
      setPurchaseItems([...purchaseItems, { 
        id: Date.now() + Math.random(), 
        productId: product.id, 
        qty: 1 
      }]);
    }
  };

  const handleRemoveRow = (id) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

  const handleUpdateRow = (id, field, value) => {
    setPurchaseItems(purchaseItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    if (purchaseItems.length === 0) return;
    
    const mappedItems = purchaseItems.map(item => {
      const p = products.find(pr => pr.id === item.productId);
      return {
        productId: item.productId,
        productName: p.name,
        emoji: p.emoji,
        qty: item.qty,
        costPerUnit: p.buyPrice,
        subtotal: item.qty * p.buyPrice
      };
    });

    const record = onPurchase(supplier, mappedItems, totalAmount);
    if (record) {
      setLastSavedPurchase(record);
      setShowSuccessSheet(true);
      setPurchaseItems([]);
      setSupplier('');
    }
  };

  const shareWhatsApp = () => {
    if (!lastSavedPurchase) return;
    
    let text = `🛒 فاتورة شراء — ${lastSavedPurchase.date}\n`;
    text += `المورّد: ${lastSavedPurchase.supplier || 'غير محدد'}\n`;
    text += `─────────────\n`;
    
    const itemsToShare = lastSavedPurchase.items && Array.isArray(lastSavedPurchase.items) 
      ? lastSavedPurchase.items 
      : [{ productName: lastSavedPurchase.productName, qty: lastSavedPurchase.qty, subtotal: lastSavedPurchase.total }];

    itemsToShare.forEach(item => {
      text += `${item.productName} × ${item.qty} = ${fmt(item.subtotal)} DA\n`;
    });
    
    text += `─────────────\n`;
    text += `الإجمالي: ${fmt(lastSavedPurchase.total)} DA`;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const receiptItems = lastSavedPurchase?.items && Array.isArray(lastSavedPurchase.items) 
    ? lastSavedPurchase.items 
    : lastSavedPurchase 
      ? [{ productName: lastSavedPurchase.productName, qty: lastSavedPurchase.qty, subtotal: lastSavedPurchase.total }]
      : [];

  if (showFullHistory) {
    return (
      <div style={{ paddingBottom: 100, minHeight: '100vh', background: C.bg }}>
        <AppHeader
          title="كل المشتريات"
          left={<HeaderIconButton label="رجوع" onClick={() => setShowFullHistory(false)}><ChevronLeft size={24} color={C.dark} /></HeaderIconButton>}
          border
        />
        
        <div style={{ padding: '16px' }}>
          {allPurchases.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>لا توجد مشتريات سابقة</div>}
          {allPurchases.map(renderHistoryItem)}
        </div>

        {showSuccessSheet && lastSavedPurchase && (
          <>
            <div onClick={() => setShowSuccessSheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'fadeIn 0.3s ease' }} />
            <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 24px 32px', zIndex: 201, animation: 'slideUp 0.3s ease', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Receipt size={32} strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>إيصال شراء</h2>
                <p style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>{lastSavedPurchase.date}</p>
              </div>
              
              <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '16px', marginBottom: 24, border: `1px solid ${C.border}` }}>
                {receiptItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < receiptItems.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 14 }}>
                    <span style={{ fontWeight: 700, color: C.dark }}>{fmt(item.subtotal)} DA</span>
                    <span style={{ color: C.gray }}>{item.productName} × {item.qty}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 8, borderTop: `1px dashed ${C.border}`, fontSize: 16, fontWeight: 800 }}>
                  <span style={{ color: C.blue }}>{fmt(lastSavedPurchase.total)} DA</span>
                  <span style={{ color: C.dark }}>الإجمالي</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowSuccessSheet(false)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#fff', color: C.dark, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>إغلاق</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: purchaseItems.length > 0 ? 160 : 80 }}>
      <AppHeader
        title="الشراء"
        subtitle="سجّل مشترياتك"
        left={<HeaderIconButton label="القائمة"><Menu size={22} color={C.dark} /></HeaderIconButton>}
        right={<HeaderIconButton label="كل المشتريات" onClick={() => setShowFullHistory(true)}><ShoppingBag size={22} color={C.dark} /></HeaderIconButton>}
      />

      {/* Styled Supplier Card */}
      <div style={{ padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} color={C.gray} />
            </div>
            <label style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>المورّد</label>
          </div>
          <input 
            type="text" 
            value={supplier} 
            onChange={e => setSupplier(e.target.value)}
            placeholder="اسم المورّد (اختياري)" 
            style={{ 
              width: '100%', padding: '12px 14px', borderRadius: 10, 
              border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', 
              textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box'
            }} 
          />
        </div>
      </div>

      {/* Product List */}
      <div style={{ padding: '0 16px' }}>
        {purchaseItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: C.gray, fontSize: 14 }}>
            اضغط زر "شراء جديد +" لإضافة منتج
          </div>
        ) : (
          purchaseItems.map((item, index) => {
            const p = products.find(pr => pr.id === item.productId) || products[0];
            const subtotal = item.qty * (p?.buyPrice || 0);
            
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: 12, padding: '12px', marginBottom: 12, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <button onClick={() => handleRemoveRow(item.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={16} color={C.red} />
                  </button>
                  
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>{fmt(subtotal)} DA</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAFA', borderRadius: 8, padding: '4px', flexShrink: 0 }}>
                    <button onClick={() => handleUpdateRow(item.id, 'qty', Math.max(1, item.qty - 1))} style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} color={C.dark} /></button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => handleUpdateRow(item.id, 'qty', item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 6, background: C.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="#fff" /></button>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{p?.name}</div>
                    <div style={{
                      width: '44px', height: '44px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: p?.color || '#F3F4F6',
                      flexShrink: 0
                    }}>
                      <img
                        src={p?.image}
                        alt={p?.name}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'contain', padding: '4px',
                          boxSizing: 'border-box'
                        }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.gray, textAlign: 'right', marginTop: 8 }}>سعر الوحدة: {p?.buyPrice} DA</div>
              </div>
            );
          })
        )}
        
        <button onClick={() => setShowProductSelector(true)} style={{ width: '100%', height: 52, background: '#F9FAFB', border: `1.5px dashed #D1D5DB`, borderRadius: 12, color: C.dark, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 8 }}>
          شراء جديد +
        </button>
      </div>

      {/* History section */}
      <div style={{ padding: '24px 16px 40px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 12, textAlign: 'right' }}>آخر العمليات</h3>
        {recentPurchases.map(renderHistoryItem)}
      </div>

      {/* Sticky Total & Save Bar - Conditional */}
      {purchaseItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', padding: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 100, boxSizing: 'border-box', animation: 'slideUp 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.blue }}>{fmt(totalAmount)} <span style={{ fontSize: 14 }}>DA</span></span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>الإجمالي</span>
          </div>
          <button 
            onClick={handleSave}
            style={{ 
              width: '100%', height: 56, borderRadius: 14, 
              background: C.blue, 
              color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, 
              cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 
            }}
          >
            <Save size={20} /> حفظ كل المشتريات
          </button>
        </div>
      )}

      {/* Product Selector Bottom Sheet */}
      {showProductSelector && (
        <>
          <div onClick={() => setShowProductSelector(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'fadeIn 0.3s ease' }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, height: '85vh', background: '#F9FAFB', borderRadius: '24px 24px 0 0', zIndex: 201, animation: 'slideUp 0.3s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => setShowProductSelector(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} color={C.dark} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>اختر المنتجات</h2>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: '#fff', borderBottom: `1px solid ${C.border}`, direction: 'rtl' }}>
              {[ALL_FILTER, ...categories].map(categoryName => {
                const active = selectorCategory === categoryName;
                return (
                  <button key={categoryName} onClick={() => setSelectorCategory(categoryName)} style={{ padding: '8px 16px', borderRadius: 999, border: active ? 'none' : `1px solid ${C.border}`, background: active ? C.blue : '#fff', color: active ? '#fff' : C.dark, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>
                    {categoryName}
                  </button>
                );
              })}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {selectorProducts.map(p => (
                  <div key={p.id} onClick={() => handleProductSelect(p)} style={{ background: '#fff', borderRadius: 16, padding: '16px 14px', textAlign: 'center', boxShadow: C.shadow, cursor: 'pointer', border: `1px solid ${C.border}` }}>
                    <div style={{
                      width: '100%', height: '80px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: p.color || '#F3F4F6',
                      marginBottom: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'contain', padding: '4px',
                          boxSizing: 'border-box'
                        }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.blue }}>{p.buyPrice} <span style={{ fontSize: 12 }}>DA</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Sheet Overlay */}
      {showSuccessSheet && lastSavedPurchase && !showFullHistory && (
        <>
          <div onClick={() => setShowSuccessSheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'fadeIn 0.3s ease' }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 24px 32px', zIndex: 201, animation: 'slideUp 0.3s ease', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Check size={32} strokeWidth={3} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>تم تسجيل الشراء</h2>
              <p style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>{lastSavedPurchase.date}</p>
            </div>
            
            <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '16px', marginBottom: 24, border: `1px solid ${C.border}` }}>
              {receiptItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < receiptItems.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: C.dark }}>{fmt(item.subtotal)} DA</span>
                  <span style={{ color: C.gray }}>{item.productName} × {item.qty}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 8, borderTop: `1px dashed ${C.border}`, fontSize: 16, fontWeight: 800 }}>
                <span style={{ color: C.blue }}>{fmt(lastSavedPurchase.total)} DA</span>
                <span style={{ color: C.dark }}>الإجمالي</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowSuccessSheet(false)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#fff', color: C.dark, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>تخطي</button>
              <button onClick={shareWhatsApp} style={{ flex: 1, padding: '14px', borderRadius: 12, background: C.green, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                مشاركة واتساب 📤
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 4: CLOSE DAY (إغلاق اليوم)
   ═══════════════════════════════════════════ */
function CloseDayScreen({ step, setStep, todaySalesTotal, todayPurchasesTotal, stockValue, onClose, onBack }) {
  return (
    <div>
      <AppHeader
        title="إغلاق اليوم"
        subtitle={getArabicDate()}
        left={<HeaderIconButton label="رجوع" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
      />

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
function ReportsScreen({ products, todaySales, todaySalesTotal, todayPurchasesTotal, todayProfit, debts, onShowDetails, onShowCloseDay, onExport, onShare }) {
  const [period, setPeriod] = useState('اليوم');
  const [showDrawer, setShowDrawer] = useState(false);
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
      <AppHeader
        title="التقارير"
        left={(
          <>
            <HeaderIconButton label="مشاركة" onClick={onShare}><Share2 size={21} color={C.dark} /></HeaderIconButton>
            <HeaderIconButton label="تحميل" onClick={onExport}><Download size={21} color={C.dark} /></HeaderIconButton>
          </>
        )}
        right={<HeaderIconButton label="تفاصيل اليوم" onClick={() => setShowDrawer(true)}><Menu size={22} color={C.dark} /></HeaderIconButton>}
      />

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

      <ReportsDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        products={products}
        todaySales={todaySales}
        debts={debts || []}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREEN 5b: PROFIT DETAILS
   ═══════════════════════════════════════════ */
function ProfitDetailsScreen({ products, todaySales, dayRecord, onBack }) {
  const [period, setPeriod] = useState('اليوم');
  const [expanded, setExpanded] = useState({ 'مشروبات': true, 'أكل': true, 'أخرى': true });

  const categories = useMemo(() => uniqueCategories([...DEFAULT_CATEGORIES, ...products.map(product => product.category)]), [products]);
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
      <AppHeader
        title="تفاصيل الأرباح"
        left={<HeaderIconButton label="رجوع" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
        right={<HeaderIconButton label="الأرباح"><ShoppingBag size={22} color={C.dark} /></HeaderIconButton>}
      />

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
function ProductFormScreen({ product, categories, onSave, onDelete, onRestore, onToggle, onBack }) {
  const isEdit = !!product;
  const fileInputRef = useRef(null);
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [emoji, setEmoji] = useState(product?.emoji || '📦');
  const [image, setImage] = useState(product?.image || '');
  const [buyPrice, setBuyPrice] = useState(String(product?.buyPrice || '0'));
  const [sellPrice, setSellPrice] = useState(String(product?.sellPrice || '0'));
  const [qty, setQty] = useState(product?.qty || 0);
  const [minAlert, setMinAlert] = useState(product?.minAlert || 5);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const profit = (Number(sellPrice) || 0) - (Number(buyPrice) || 0);
  const isInactive = isEdit && !product.is_active;
  const productForPreview = { ...product, id: product?.id || 0, name: name || 'منتج جديد', emoji, category: category || 'أخرى', image };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ''));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = () => {
    if (!name || !category) return;
    onSave({ name, category, emoji, buyPrice: Number(buyPrice) || 0, sellPrice: Number(sellPrice) || 0, qty: Number(qty) || 0, minAlert: Number(minAlert) || 0, image });
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <AppHeader
        title={isEdit ? 'تعديل المنتج' : 'إضافة منتج'}
        left={<HeaderIconButton label="رجوع" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
        right={<button onClick={handleSave} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, color: C.dark }}>حفظ</button>}
        border
      />

      <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
        {isInactive && (
          <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>هذا المنتج معطل حالياً</span>
            <button onClick={() => onRestore(product.id)} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={14} /> تفعيل</button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#F9FAFB', borderRadius: C.radius, padding: '22px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: `1px dashed ${C.border}`, position: 'relative', minWidth: 160, cursor: 'pointer' }}>
          {image ? (
            <ProductEntity product={productForPreview} variant="form" />
          ) : (
            <>
              <ImagePlus size={34} color={C.gray} strokeWidth={1.7} />
              <div style={{ fontSize: 13, color: C.gray, marginTop: 8 }}>إضافة صورة</div>
            </>
          )}
          <span style={{ position: 'absolute', bottom: -8, left: -8, width: 32, height: 32, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pencil size={15} color={C.dark} />
          </span>
        </button>
        {image && (
          <button type="button" onClick={() => setImage('')} style={{ display: 'block', margin: '-12px auto 20px', border: 'none', background: 'transparent', color: C.red, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>إزالة الصورة</button>
        )}

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
              {categories.map(c => (
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

        {/* Pricing and Inventory Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
          {/* Row 1: سعر الشراء & إدارة الكمية المتوفرة */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {/* Right field in RTL: سعر الشراء (ر.س) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>سعر الشراء (ر.س)</label>
              <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            {/* Left field in RTL: إدارة الكمية المتوفرة */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>إدارة الكمية المتوفرة</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, padding: '0 6px', borderRadius: 12, border: '2px solid #D1D5DB', background: '#FAFAFA', boxSizing: 'border-box' }}>
                <button onClick={() => setQty(Math.max(0, qty - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: 24, fontWeight: 800, minWidth: 40, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          {/* Row 2: سعر البيع & تنبيه نقص (أقل من) */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {/* Right field in RTL: سعر البيع (ر.س) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>سعر البيع (ر.س)</label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            {/* Left field in RTL: تنبيه نقص (أقل من) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>تنبيه نقص (أقل من)</label>
              <input type="number" value={minAlert} onChange={e => setMinAlert(e.target.value)} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
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
