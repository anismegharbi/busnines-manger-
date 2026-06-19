import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ShoppingCart, Package, ShoppingBag, Moon, BarChart3,
  Search, Menu, Bell, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Minus, Check, X, Lock, TrendingUp, Wallet,
  Save, Trash2, Power, Filter, RotateCcw, Download, Share2, User,
  Truck, Receipt, Pencil, ImagePlus,
  LayoutGrid, Printer, Settings, HelpCircle, BookOpen, Users,
  CreditCard, Hand, ClipboardCheck, MessageCircle, Tags,
  Clock, Phone
} from 'lucide-react';

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   COLOR SYSTEM
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
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

const DEFAULT_CATEGORIES = ['┘êÏ¼Ï¿ÏºÏ¬', '┘àÏ┤Ï▒┘êÏ¿ÏºÏ¬', 'ÏÑÏÂÏº┘üÏºÏ¬'];
const ALL_FILTER = 'Ïº┘ä┘â┘ä';
const CATEGORY_FILTER_PREFIX = 'category:';
const MANAGE_CATEGORIES_LABEL = '┘üÏªÏºÏ¬ Ôû¥';

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
  '┘àÏ┤Ï▒┘êÏ¿ÏºÏ¬': { bg: '#EBF4FF', accent: '#2563EB' },
  'Ïú┘â┘ä': { bg: '#FFF1F0', accent: '#E67E00' },
  'ÏúÏ«Ï▒┘ë': { bg: '#F0FFF4', accent: '#16A34A' },
};

const fmt = (n) => {
  const num = Number(n);
  if (isNaN(num)) return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString('en-US');
};

const formatUnit = (qty, unit) => {
  if (unit === 'Ï║' && qty >= 1000) {
    return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} ┘âÏ║`;
  }
  if (unit === '┘à┘ä' && qty >= 1000) {
    return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} ┘äÏ¬Ï▒`;
  }
  return `${qty} ${unit}`;
};

const UNITS = ['Ï║', '┘âÏ║', '┘à┘ä', '┘äÏ¬Ï▒', 'Ï¡Ï¿Ï®', '┘à┘äÏ╣┘éÏ®', '┘â┘êÏ¿', 'Ï▒Ï┤Ï®'];
const UNIT_GROUPS = [
  { id: 'weight', label: '┘êÏ▓┘å', units: ['Ï║', '┘âÏ║'] },
  { id: 'volume', label: 'Ï│ÏºÏª┘ä', units: ['┘à┘ä', '┘äÏ¬Ï▒'] },
  { id: 'qty', label: '┘â┘à┘èÏ®', units: ['Ï¡Ï¿Ï®', '┘à┘äÏ╣┘éÏ®', '┘â┘êÏ¿', 'Ï▒Ï┤Ï®'] }
];
const VARIANCE_REASONS = ['┘çÏ»Ï▒', 'ÏúÏ┤┘â ┘ü┘è Ï│Ï▒┘éÏ®', 'Ïú┘åÏº ÏúÏ«Ï░Ï¬┘ç', 'Ï«ÏÀÏú ┘ü┘è Ïº┘äÏ╣Ï»'];
const getExpectedQty = (ing) =>
  Math.max(0, (Number(ing.starting_stock) || 0) - (Number(ing.sales_deducted) || 0) - (Number(ing.taken_deducted) || 0));

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   PRODUCT IMAGE MAP
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   PRODUCT ENTITY COMPONENT
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ProductEntity({ product, variant = 'grid', inCart = null, onClick = null, actionBtn = null }) {
  const imagePath = product.image;
  const catColor = categoryColors[product.category] || categoryColors['ÏúÏ«Ï▒┘ë'];
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
          backgroundColor: 'transparent',
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
        backgroundColor: 'transparent',
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
          padding: '24px 16px', textAlign: 'center',
          boxShadow: C.shadow, position: 'relative',
          cursor: 'pointer',
          opacity: !product.is_active ? 0.5 : 1,
          border: inCart ? `3px solid ${C.blue}` : '3px solid transparent',
          transition: 'all 0.2s ease',
        }}
      >
        {inCart && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: C.green, color: '#fff', fontSize: 14, fontWeight: 700, padding: '4px 12px', borderRadius: 8, zIndex: 2 }}>├ù{inCart.qty}</div>
        )}
        <ImageComponent size="grid" />
        <div style={{ fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 8, lineHeight: 1.4, marginTop: 12 }}>{product.name}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.blue }}>{product.sellPrice} <span style={{ fontSize: 18 }}>DA</span></div>
        <div style={{ fontSize: 16, color: C.gray, marginTop: 8, textAlign: 'left', direction: 'ltr' }}>├ù {product.qty}</div>
      </div>
    );
  }

  if (variant === 'list') {
    const status = !product.is_active ? { text: '┘àÏ╣ÏÀ┘ä', color: C.gray, bg: '#F3F4F6' }
      : product.qty <= 10 ? { text: '┘à┘åÏ«┘üÏÂ', color: C.orange, bg: '#FFF7ED' }
      : { text: '┘àÏ¬┘ê┘üÏ▒', color: C.green, bg: '#F0FDF4' };

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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   useLocalStorage HOOK
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   INITIAL DATA
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
const initialProducts = [
  { id:1, name:"Ï¿Ï▒Ï║Ï▒", emoji:"­ƒìö", image:"/imajes/burger.png", category:"┘êÏ¼Ï¿ÏºÏ¬", sellPrice:400, buyPrice:0, qty:100, minAlert:10, is_active:true, has_recipe:true },
  { id:2, name:"Ï¿┘èÏ¬Ï▓Ïº", emoji:"­ƒìò", image:"/imajes/pizza.png", category:"┘êÏ¼Ï¿ÏºÏ¬", sellPrice:600, buyPrice:0, qty:100, minAlert:10, is_active:true, has_recipe:true },
  { id:3, name:"Ï┤Ïº┘êÏ▒┘àÏº", emoji:"­ƒî»", image:"/imajes/shawarma.png", category:"┘êÏ¼Ï¿ÏºÏ¬", sellPrice:350, buyPrice:0, qty:100, minAlert:10, is_active:true, has_recipe:true },
  { id:4, name:"ÏÀÏº┘â┘êÏ│", emoji:"­ƒî«", image:"/imajes/tacos.png", category:"┘êÏ¼Ï¿ÏºÏ¬", sellPrice:450, buyPrice:0, qty:100, minAlert:10, is_active:true, has_recipe:true },
  { id:5, name:"Ï¿ÏÀÏºÏÀÏº ┘à┘é┘ä┘èÏ®", emoji:"­ƒìƒ", image:"/imajes/fries.png", category:"ÏÑÏÂÏº┘üÏºÏ¬", sellPrice:150, buyPrice:0, qty:100, minAlert:10, is_active:true, has_recipe:true },
  { id:6, name:"┘àÏ┤Ï▒┘êÏ¿ Ï║ÏºÏ▓┘è", emoji:"­ƒÑñ", image:"/imajes/drink.png", category:"┘àÏ┤Ï▒┘êÏ¿ÏºÏ¬", sellPrice:100, buyPrice:80, qty:50, minAlert:10, is_active:true, has_recipe:false },
];

const initialIngredients = [
  { id: 101, name: "┘äÏ¡┘à ┘à┘üÏ▒┘ê┘à", unit: "Ï║", starting_stock: 5000, price_per_unit: 1.5, min_stock: 1000 },
  { id: 102, name: "Ï╣Ï¼┘è┘åÏ® Ï¿┘èÏ¬Ï▓Ïº", unit: "Ï¡Ï¿Ï®", starting_stock: 50, price_per_unit: 40, min_stock: 10 },
  { id: 103, name: "Ï»Ï¼ÏºÏ¼ Ï┤Ïº┘êÏ▒┘àÏº", unit: "Ï║", starting_stock: 10000, price_per_unit: 0.8, min_stock: 2000 },
  { id: 104, name: "Ï«Ï¿Ï▓ ÏÀÏº┘â┘êÏ│", unit: "Ï¡Ï¿Ï®", starting_stock: 100, price_per_unit: 20, min_stock: 20 },
  { id: 105, name: "Ï¿ÏÀÏºÏÀÏº", unit: "Ï║", starting_stock: 20000, price_per_unit: 0.1, min_stock: 5000 },
  { id: 106, name: "Ï¼Ï¿┘å", unit: "Ï║", starting_stock: 3000, price_per_unit: 1.2, min_stock: 500 },
  { id: 107, name: "Ï«Ï¿Ï▓ Ï¿Ï▒Ï║Ï▒", unit: "Ï¡Ï¿Ï®", starting_stock: 50, price_per_unit: 15, min_stock: 10 },
  { id: 108, name: "ÏÁ┘äÏÁÏ®", unit: "┘à┘ä", starting_stock: 2000, price_per_unit: 0.2, min_stock: 500 },
];

const initialProductRecipes = [
  { id: 201, productId: 1, ingredientId: 107, qty: 1 },
  { id: 202, productId: 1, ingredientId: 101, qty: 150 },
  { id: 203, productId: 1, ingredientId: 106, qty: 20 },
  { id: 204, productId: 2, ingredientId: 102, qty: 1 },
  { id: 205, productId: 2, ingredientId: 106, qty: 100 },
  { id: 206, productId: 3, ingredientId: 103, qty: 100 },
  { id: 207, productId: 3, ingredientId: 108, qty: 20 },
  { id: 208, productId: 4, ingredientId: 104, qty: 1 },
  { id: 209, productId: 4, ingredientId: 103, qty: 80 },
  { id: 210, productId: 4, ingredientId: 105, qty: 100 },
  { id: 211, productId: 4, ingredientId: 108, qty: 30 },
  { id: 212, productId: 5, ingredientId: 105, qty: 200 },
];

const getArabicDate = () => {
  const days = ['Ïº┘äÏúÏ¡Ï»','Ïº┘äÏÑÏ½┘å┘è┘å','Ïº┘äÏ½┘äÏºÏ½ÏºÏí','Ïº┘äÏúÏ▒Ï¿Ï╣ÏºÏí','Ïº┘äÏ«┘à┘èÏ│','Ïº┘äÏ¼┘àÏ╣Ï®','Ïº┘äÏ│Ï¿Ï¬'];
  const months = ['┘è┘åÏº┘èÏ▒','┘üÏ¿Ï▒Ïº┘èÏ▒','┘àÏºÏ▒Ï│','ÏúÏ¿Ï▒┘è┘ä','┘àÏº┘è┘ê','┘è┘ê┘å┘è┘ê','┘è┘ê┘ä┘è┘ê','ÏúÏ║Ï│ÏÀÏ│','Ï│Ï¿Ï¬┘àÏ¿Ï▒','Ïú┘âÏ¬┘êÏ¿Ï▒','┘å┘ê┘ü┘àÏ¿Ï▒','Ï»┘èÏ│┘àÏ¿Ï▒'];
  const d = new Date();
  return `${days[d.getDay()]}Ïî ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const arabicDays = ['Ïº┘äÏ│Ï¿Ï¬','Ïº┘äÏúÏ¡Ï»','Ïº┘äÏÑÏ½┘å┘è┘å','Ïº┘äÏ½┘äÏºÏ½ÏºÏí','Ïº┘äÏúÏ▒Ï¿Ï╣ÏºÏí','Ïº┘äÏ«┘à┘èÏ│','Ïº┘äÏ¼┘àÏ╣Ï®'];

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   MAIN APP
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useLocalStorage('pos_products', initialProducts);
  const [categories, setCategories] = useLocalStorage('pos_categories', DEFAULT_CATEGORIES);
  const [cart, setCart] = useState([]);
  const [todaySales, setTodaySales] = useLocalStorage('pos_todaySales', []);
  const [todayPurchases, setTodayPurchases] = useLocalStorage('pos_todayPurchases', []);
  const [debts, setDebts] = useLocalStorage('pos_debts', []);
  const [suppliers, setSuppliers] = useLocalStorage('pos_suppliers', []);
  const [expenses, setExpenses] = useLocalStorage('pos_expenses', []);
  const [clients, setClients] = useLocalStorage('pos_clients', []);
  const [ingredients, setIngredients] = useLocalStorage('pos_ingredients', initialIngredients);
  const [cyclicExpenses, setCyclicExpenses] = useLocalStorage('pos_cyclic_expenses', []);
  const [hasMigratedV1, setHasMigratedV1] = useLocalStorage('pos_migration_v1', false);

  useEffect(() => {
    if (!hasMigratedV1) {
      window.localStorage.removeItem('pos_products');
      window.localStorage.removeItem('pos_categories');
      window.localStorage.removeItem('pos_ingredients');
      window.localStorage.removeItem('pos_product_recipes');
      setHasMigratedV1(true);
      window.location.reload();
    }
  }, [hasMigratedV1, setHasMigratedV1]);
  const [stockSessions, setStockSessions] = useLocalStorage('pos_stock_sessions', []);
  const [stockEntries, setStockEntries] = useLocalStorage('pos_stock_entries', []);
  const [ownerTookLog, setOwnerTookLog] = useLocalStorage('pos_owner_took_log', []);
  const [productRecipes, setProductRecipes] = useLocalStorage('pos_product_recipes', initialProductRecipes);
  const [settings] = useLocalStorage('pos_settings', { shopName: '┘àÏ¬Ï¼Ï▒┘è' });
  const [allPurchases, setAllPurchases] = useLocalStorage('pos_allPurchases', [
    { id: 100, productId: 1, productName: 'Ï╣ÏÁ┘èÏ▒ Ï¿Ï▒Ï¬┘éÏº┘ä', emoji: '­ƒÑñ', qty: 24, unitPrice: 18, total: 432, date: 'Ïú┘àÏ│' },
    { id: 101, productId: 2, productName: '┘àÏºÏí 0.5L', emoji: '­ƒÆº', qty: 48, unitPrice: 5, total: 240, date: 'Ïº┘äÏºÏ½┘å┘è┘å' },
    { id: 102, productId: 4, productName: 'Ï┤┘èÏ¿Ï│', emoji: '­ƒìƒ', qty: 30, unitPrice: 15, total: 450, date: 'Ïº┘äÏ│Ï¿Ï¬' },
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
  const [clientDetailId, setClientDetailId] = useState(null);
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
      const bp = p.has_recipe ? productRecipes.filter(rec => rec.product_id === p.id).reduce((sum, rec) => {
        const ing = ingredients.find(i => i.id === rec.ingredient_id);
        return sum + (Number(rec.quantity_used) || 0) * (ing ? (Number(ing.cost_per_unit) || 0) : 0);
      }, 0) : (Number(p.buyPrice) || 0);
      return s + r.qty * (p.sellPrice - bp);
    }, 0), [todaySales, products, productRecipes, ingredients]);

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
      setIngredients(prev => prev.map(ing => {
        if (ingredientDeductions[ing.id]) {
          const currentExpected = (Number(ing.starting_stock) || 0) - (Number(ing.sales_deducted) || 0) - (Number(ing.taken_deducted) || 0);
          const deduction = ingredientDeductions[ing.id];
          const allowedDeduction = Math.max(0, Math.min(deduction, currentExpected));
          return { ...ing, sales_deducted: (Number(ing.sales_deducted) || 0) + allowedDeduction };
        }
        return ing;
      }));
    }
    setProducts(updatedProducts);
    setTodaySales(prev => [...prev, ...salesRecords]);
    
    setCart([]);
    showSuccess('Ï¬┘àÏ¬ Ï╣┘à┘ä┘èÏ® Ïº┘äÏ¿┘èÏ╣ Ï¿┘åÏ¼ÏºÏ¡ Ô£ô');
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
      date: `${getArabicDate().split('Ïî')[0]} ${d.getDate()} ${['┘è┘åÏº┘èÏ▒','┘üÏ¿Ï▒Ïº┘èÏ▒','┘àÏºÏ▒Ï│','ÏúÏ¿Ï▒┘è┘ä','┘àÏº┘è┘ê','┘è┘ê┘å┘è┘ê','┘è┘ê┘ä┘è┘ê','ÏúÏ║Ï│ÏÀÏ│','Ï│Ï¿Ï¬┘àÏ¿Ï▒','Ïú┘âÏ¬┘êÏ¿Ï▒','┘å┘ê┘ü┘àÏ¿Ï▒','Ï»┘èÏ│┘àÏ¿Ï▒'][d.getMonth()]} ÔÇö ${timeString}`,
      supplier: supplier || 'Ï║┘èÏ▒ ┘àÏ¡Ï»Ï»',
      items: items,
      total: totalAmount,
    };
    
    setTodayPurchases(prev => [...prev, record]);
    setAllPurchases(prev => [record, ...prev]);
    showSuccess('Ï¬┘à Ï¡┘üÏ© Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬ Ï¿┘åÏ¼ÏºÏ¡ Ô£ô');
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
    showSuccess('Ï¬┘à ÏÑÏ║┘äÏº┘é Ïº┘ä┘è┘ê┘à ┘êÏ¿Ï»Ïí ┘è┘ê┘à Ï¼Ï»┘èÏ» Ô£ô');
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
    showSuccess(editingProduct ? 'Ï¬┘à Ï¡┘üÏ© Ïº┘äÏ¬Ï║┘è┘èÏ▒ÏºÏ¬ Ô£ô' : 'Ï¬┘à ÏÑÏÂÏº┘üÏ® Ïº┘ä┘à┘åÏ¬Ï¼ Ô£ô');
  }, [editingProduct, products]);

  const handleDeleteProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p));
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess('Ï¬┘à Ï¬Ï╣ÏÀ┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼ Ô£ô');
  }, []);

  const handleRestoreProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: true } : p));
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess('Ï¬┘à Ï¬┘üÏ╣┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼ Ô£ô');
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
    showSuccess('Ï¬┘à Ï¬Ï¡┘à┘è┘ä ┘åÏ│Ï«Ï® ÏºÏ¡Ï¬┘èÏºÏÀ┘èÏ® Ô£ô');
  };

  // WhatsApp Share Feature
  const handleWhatsAppShare = () => {
    const text = `­ƒôè *Ï¬┘éÏ▒┘èÏ▒ Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬ - ${getArabicDate()}* ­ƒôè\n\n` +
      `­ƒÆ░ ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬: ${fmt(todaySalesTotal)} DA\n` +
      `­ƒøÆ ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬: ${fmt(todayPurchasesTotal)} DA\n` +
      `­ƒôê ÏÁÏº┘ü┘è Ïº┘äÏ▒Ï¿Ï¡: ${fmt(todayProfit)} DA\n\n` +
      `­ƒôª Ï╣┘à┘ä┘èÏºÏ¬ Ïº┘äÏ¿┘èÏ╣ Ïº┘ä┘è┘ê┘à: ${todaySales.length} ┘àÏ▒Ï®\n` +
      `*Ï¬ÏÀÏ¿┘è┘é ÏÑÏ»ÏºÏ▒Ï® Ïº┘äÏúÏ╣┘àÏº┘ä*`;
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

    if (morePage === 'Ïº┘äÏ»┘è┘ê┘å') {
      return <DebtsScreen
        debts={debts}
        setDebts={setDebts}
        clients={clients}
        setClients={setClients}
        showSuccess={showSuccess}
        onBack={() => setMorePage(null)}
      />;
    }
    if (morePage === 'Ïº┘ä┘àÏÁÏºÏ▒┘è┘ü') {
      return <ExpensesScreen
        expenses={expenses}
        cyclicExpenses={cyclicExpenses}
        setCyclicExpenses={setCyclicExpenses}
        setExpenses={setExpenses}
        showSuccess={showSuccess}
        onBack={() => setMorePage(null)}
      />;
    }
    if (morePage === 'Ïº┘äÏ╣┘à┘äÏºÏí' || clientDetailId) {
      if (clientDetailId) {
        const client = clients.find(c => c.id === clientDetailId);
        if (client) {
          return <ClientDetailScreen
            client={client}
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
        onOpenProducts={() => setActiveTab(3)}
      />;
      case 2: return <PurchaseScreen
        products={ingredients.map(ing => ({ id: ing.id, name: ing.name, buyPrice: Number(ing.cost_per_unit) || 0, emoji: ing.emoji || '­ƒôª', unit: ing.unit }))}
        categories={[]}
        onPurchase={handlePurchase}
        suppliers={suppliers}
            timeText: record.date.split(' ÔÇö ')[1] || d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            items: items.map(it => ({
              name: it.productName,
              qty: it.qty,
              price: it.costPerUnit || (it.subtotal / (it.qty || 1)),
              total: it.subtotal
            })),
            total: record.total,
            paymentMethod: record.supplier && record.supplier !== 'Ï║┘èÏ▒ ┘àÏ¡Ï»Ï»' ? `ÏóÏ¼┘ä / ${record.supplier}` : '┘âÏºÏ┤ (┘å┘éÏ»Ïº┘ï)'
          });
        }}
      />;
      case 3: return <InventoryScreen
        products={products}
        categories={categories}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddProduct={() => { setEditingProduct(null); setShowProductForm(true); }}
        onEditProduct={(p) => setDetailProductId(p.id)}
      />;
      case 4: return <MoreScreen
        onOpenReports={() => setActiveTab(5)}
        onOpenPage={(title) => setMorePage(title)}
      />;
      case 5: return <ReportsScreen
        products={products}
        todaySales={todaySales}
        todaySalesTotal={todaySalesTotal}
        todayPurchasesTotal={todayPurchasesTotal}
        todayProfit={todayProfit}
        debts={debts}
        productRecipes={productRecipes}
        ingredients={ingredients}
        cyclicExpenses={cyclicExpenses}
        onShowDetails={() => setReportView('details')}
        onShowCloseDay={() => setShowCloseDay(true)}
        onExport={handleExportData}
        onShare={handleWhatsAppShare}
        onOpenProduct={(p) => setDetailProductId(p.id)}
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
          shopName={settings?.shopName || '┘àÏ¬Ï¼Ï▒┘è'}
          onClose={() => setLastReceipt(null)}
        />
      )}
      {!showProductForm && reportView !== 'details' && !showCloseDay && !detailProductId && !morePage && !clientDetailId && (
        <BottomNav activeTab={activeTab} setActiveTab={(i) => { setMorePage(null); setShowProductsList(false); setActiveTab(i); }} lowStockCount={lowStockCount} />
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   BOTTOM NAV
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function BottomNav({ activeTab, setActiveTab, lowStockCount }) {
  const tabs = [
    { icon: ShoppingCart, label: 'Ïº┘äÏ¿┘èÏ╣' },
    { icon: Package, label: 'Ïº┘ä┘àÏ«Ï▓┘ê┘å', badge: lowStockCount },
    { icon: ShoppingBag, label: 'Ïº┘äÏ┤Ï▒ÏºÏí' },
    { icon: Tags, label: 'Ïº┘ä┘à┘åÏ¬Ï¼ÏºÏ¬' },
    { icon: LayoutGrid, label: 'Ïº┘ä┘àÏ▓┘èÏ»' },
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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 1: SELL (Ïº┘äÏ¿┘èÏ╣)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
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
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Ïº┘ä┘üÏªÏºÏ¬</h2>
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
                    <button onClick={submit} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Ï¡┘üÏ©</button>
                    <button onClick={() => { setMode('list'); setEditingCategory(null); }} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.dark, fontWeight: 800, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <button onClick={() => { onSelectCategory(category); onClose(); }} style={{ flex: 1, border: active ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: active ? '#EFF6FF' : '#fff', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{category}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>{count} ┘à┘åÏ¬Ï¼</span>
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
              <input value={draft} onChange={event => setDraft(event.target.value)} autoFocus placeholder="ÏºÏ│┘à Ïº┘ä┘üÏªÏ®" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, textAlign: 'right', direction: 'rtl', boxSizing: 'border-box', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={submit} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Ï¡┘üÏ©</button>
                <button onClick={() => setMode('list')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', color: C.dark, fontWeight: 800, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setMode('add'); setDraft(''); setEditingCategory(null); }} style={{ width: '100%', marginTop: 14, padding: '14px', borderRadius: 14, border: 'none', background: C.dark, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>ÏÑÏÂÏº┘üÏ® ┘üÏªÏ® Ï¼Ï»┘èÏ»Ï® +</button>
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
      const qty = Math.max(0, nextQty);
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
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Ïº┘äÏ│┘äÏ®</h2>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>Ïº┘äÏ│┘äÏ® ┘üÏºÏ▒Ï║Ï®</div>
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
            <span style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>Ïº┘äÏÑÏ¼┘àÏº┘ä┘è</span>
          </div>
          <button onClick={completeSale} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.green, color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <Check size={20} /> Ï¿┘èÏ╣
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
    const name = debt.customerName || debt.customer || debt.name || 'Ï▓Ï¿┘ê┘å';
    const text = encodeURIComponent(`Ï│┘äÏº┘à ${name}Ïî Ïº┘ä┘àÏ¿┘äÏ║ Ïº┘ä┘àÏ¬Ï¿┘é┘è ┘ç┘ê ${fmt(amount)} DA`);
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
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Ï¬┘üÏºÏÁ┘è┘ä Ïº┘ä┘è┘ê┘à</h2>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          {[
            { id: 'sales', label: 'Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬ Ïº┘ä┘è┘ê┘à' },
            { id: 'debts', label: 'Ï┤Ï¡Ïº┘ä ┘èÏ│Ïº┘ä┘ê┘â' },
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
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>┘äÏº Ï¬┘êÏ¼Ï» ┘àÏ¿┘èÏ╣ÏºÏ¬ Ïº┘ä┘è┘ê┘à</div>
              ) : todaySales.map((sale, index) => {
                const product = products.find(p => p.id === sale.productId) || { id: sale.productId || index, name: sale.productName || '┘à┘åÏ¬Ï¼', emoji: sale.emoji || '­ƒôª', image: sale.image || '', category: sale.category || 'ÏúÏ«Ï▒┘ë' };
                return (
                  <div key={`${sale.productId}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                    <ProductEntity product={product} variant="tiny" />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>├ù {sale.qty}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.blue }}>{fmt(sale.total)} DA</div>
                  </div>
                );
              })}
              {todaySales.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, fontSize: 17, fontWeight: 900 }}>
                  <span style={{ color: C.blue }}>{fmt(salesTotal)} DA</span>
                  <span style={{ color: C.dark }}>Ïº┘äÏÑÏ¼┘àÏº┘ä┘è:</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ color: C.red, fontSize: 17, fontWeight: 900, padding: '10px 0 14px', textAlign: 'right' }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘äÏ»┘è┘ê┘å: {fmt(debtsTotal)} DA</div>
              {pendingDebts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>┘äÏº Ï¬┘êÏ¼Ï» Ï»┘è┘ê┘å Ï¡Ïº┘ä┘èÏº┘ï</div>
              ) : pendingDebts.map((debt, index) => {
                const amount = Number(debt.amount ?? debt.total ?? debt.balance ?? 0);
                const name = debt.customerName || debt.customer || debt.name || 'Ï▓Ï¿┘ê┘å';
                const phone = debt.phone || debt.whatsapp || debt.mobile;
                return (
                  <div key={debt.id || index} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                    {phone && <button onClick={() => openWhatsApp(debt)} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', background: '#DCFCE7', color: C.green, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>WA</button>}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.dark }}>{name}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>┘à┘åÏ░ {getDaysAgo(debt.date || debt.createdAt || debt.created_at)} Ïú┘èÏº┘à</div>
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
  const [category, setCategory] = useState('Ïº┘ä┘â┘ä');
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef(null);

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
    if (!product || !product.is_active) return;
    setCart(prev => {
      const existing = prev.findIndex(c => c.productId === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + 1 };
        return updated;
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });

    setLastAddedProduct(product);
    setShowUndo(true);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndo(false);
    }, 4000);
  };

  const handleUndo = (e) => {
    e.stopPropagation();
    if (!lastAddedProduct) return;
    setCart(prev => {
      const existing = prev.findIndex(c => c.productId === lastAddedProduct.id);
      if (existing >= 0) {
        const updated = [...prev];
        if (updated[existing].qty <= 1) {
          updated.splice(existing, 1);
        } else {
          updated[existing] = { ...updated[existing], qty: updated[existing].qty - 1 };
        }
        return updated;
      }
      return prev;
    });
    setShowUndo(false);
  };

  return (
    <div>
      <AppHeader
        title="Ïº┘äÏ¿┘èÏ╣"
        right={(
          <HeaderIconButton label="Ïº┘äÏ│┘äÏ®" badge={cartCount} onClick={() => setShowCartSheet(true)}>
            <ShoppingCart size={24} color={C.dark} />
          </HeaderIconButton>
        )}
      />

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
          <Search size={18} color={C.gray} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ÏºÏ¿Ï¡Ï½ Ï╣┘å ┘à┘åÏ¬Ï¼..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent', textAlign: 'right', direction: 'rtl' }} />
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
          <span style={{ fontSize: 13, color: C.gray }}>{cart.length} ┘à┘åÏ¬Ï¼ÏºÏ¬</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{fmt(cartTotal)} <span style={{ fontSize: 14 }}>DA</span></span>
          <button onClick={(event) => { event.stopPropagation(); onSell(); }} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={18} /> Ï¿┘èÏ╣
          </button>
        </div>
      )}

      {showUndo && lastAddedProduct && (
        <div style={{
          position: 'fixed',
          bottom: cart.length > 0 ? 140 : 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 360,
          background: 'rgba(31, 41, 55, 0.95)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 95,
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        }}>
          <button onClick={handleUndo} style={{
            background: C.red,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <RotateCcw size={14} /> Ï¬Ï▒ÏºÏ¼Ï╣
          </button>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® {lastAddedProduct.emoji} {lastAddedProduct.name}
          </span>
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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 2: INVENTORY (Ïº┘ä┘àÏ«Ï▓┘ê┘å)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function InventoryScreen({ products, categories, onAddCategory, onRenameCategory, onDeleteCategory, onAddProduct, onEditProduct }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(ALL_FILTER);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const activeProducts = useMemo(() => products.filter(p => p.is_active), [products]);
  const stats = useMemo(() => ({
    total: activeProducts.length,
    low: activeProducts.filter(p => p.qty > 0 && p.qty <= p.minAlert).length,
    value: activeProducts.reduce((s, p) => s + p.qty * p.buyPrice, 0),
  }), [activeProducts]);

  const filtered = useMemo(() => {
    let list = filter === 'Ïº┘ä┘àÏ╣ÏÀ┘äÏ®' ? products.filter(p => !p.is_active) : [...activeProducts];
    if (search) list = list.filter(p => p.name.includes(search));
    if (filter === '┘à┘åÏ«┘üÏÂÏ® Ïº┘ä┘àÏ«Ï▓┘ê┘å') list = list.filter(p => p.qty > 0 && p.qty <= p.minAlert);
    else if (isCategoryFilter(filter)) list = list.filter(p => p.category === categoryFromFilter(filter));
    return list;
  }, [products, activeProducts, search, filter]);

  const filters = useMemo(() => [
    { label: ALL_FILTER, value: ALL_FILTER },
    { label: 'Ïº┘äÏú┘âÏ½Ï▒ ┘àÏ¿┘èÏ╣Ïº┘ï', value: 'Ïº┘äÏú┘âÏ½Ï▒ ┘àÏ¿┘èÏ╣Ïº┘ï' },
    { label: '┘à┘åÏ«┘üÏÂÏ® Ïº┘ä┘àÏ«Ï▓┘ê┘å', value: '┘à┘åÏ«┘üÏÂÏ® Ïº┘ä┘àÏ«Ï▓┘ê┘å' },
    { label: 'Ïº┘ä┘àÏ╣ÏÀ┘äÏ®', value: 'Ïº┘ä┘àÏ╣ÏÀ┘äÏ®' },
    ...categories.map(category => ({ label: category, value: getCategoryFilter(category) })),
    { label: MANAGE_CATEGORIES_LABEL, value: MANAGE_CATEGORIES_LABEL },
  ], [categories]);

  const selectedLabel = isCategoryFilter(filter) ? categoryFromFilter(filter) : filter;

  return (
    <div>
      <AppHeader
        title="Ïº┘ä┘à┘åÏ¬Ï¼ÏºÏ¬"
        left={<HeaderIconButton label="Ïº┘ä┘éÏºÏª┘àÏ®"><Menu size={22} color={C.dark} /></HeaderIconButton>}
        right={<HeaderIconButton label="Ï¬┘åÏ¿┘è┘çÏºÏ¬ Ïº┘ä┘àÏ«Ï▓┘ê┘å" badge={stats.low}><Bell size={22} color={C.dark} /></HeaderIconButton>}
      />

      <div style={{ display: 'flex', overflowX: 'auto', gap: 10, padding: '12px 16px', direction: 'rtl', scrollbarWidth: 'none' }}>
        {[
          { label: 'ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘à┘åÏ¬Ï¼ÏºÏ¬', value: stats.total, sub: '┘à┘åÏ¬Ï¼', color: C.blue, icon: <img src="/imajes/icons/total-products.png" style={{width:'80px', height:'80px', objectFit:'contain'}} /> },
          { label: '┘à┘åÏ«┘üÏÂÏ® Ïº┘ä┘àÏ«Ï▓┘ê┘å', value: stats.low, sub: '┘à┘åÏ¬Ï¼', color: C.orange, icon: <img src="/imajes/icons/low-stock.png" style={{width:'80px', height:'80px', objectFit:'contain'}} /> },
          { label: '┘é┘è┘àÏ® Ïº┘ä┘àÏ«Ï▓┘ê┘å', value: fmt(stats.value), sub: 'DA', color: C.green, icon: <img src="/imajes/icons/stock-value.png" style={{width:'80px', height:'80px', objectFit:'contain'}} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '12px 8px', minWidth: 110, flexShrink: 0, boxShadow: C.shadow, border: `1px solid ${C.border}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 100 }}>
        {filtered.map(p => (
          <ProductEntity key={p.id} product={p} variant="list" onClick={() => onEditProduct(p)} />
        ))}
      </div>

      <button aria-label="ÏÑÏÂÏº┘üÏ® ┘à┘åÏ¬Ï¼" onClick={onAddProduct} style={{ position: 'fixed', bottom: 90, right: 'calc(50% - 175px)', width: 52, height: 52, borderRadius: '50%', background: C.dark, color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 3: PURCHASE (Ïº┘äÏ┤Ï▒ÏºÏí) ÔÇö 3-TAB DESIGN
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function PurchaseScreen({ products, categories, onPurchase, suppliers, setSuppliers, allPurchases, debts, setDebts, showSuccess, onShowReceipt }) {
  const [activeTab, setActiveTab] = useState('supplier');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectorCategory, setSelectorCategory] = useState(ALL_FILTER);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const selectedSupplier = suppliers.find(s => s.id === Number(selectedSupplierId));
  const totalAmount = useMemo(() => purchaseItems.reduce((sum, item) => {
    return sum + (item.qty * (item.costPerUnit || 0));
  }, 0), [purchaseItems]);

  const paidAmount = Number(amountPaid) || 0;
  const remaining = Math.max(0, totalAmount - paidAmount);
  const previousDebt = selectedSupplier ? (Array.isArray(allPurchases) ? allPurchases.filter(r => r.supplierId === selectedSupplier.id && r.remainingDebt > 0).reduce((s, r) => s + (r.remainingDebt || 0), 0) : 0) : 0;
  const totalSupplierDue = previousDebt + remaining;

  const selectorProducts = useMemo(() => {
    if (selectorCategory === ALL_FILTER) return products;
    return products.filter(p => p.category === selectorCategory);
  }, [products, selectorCategory]);

  const handleAddSupplier = () => {
    const name = newSupplierName.trim();
    if (!name) return;
    const newS = { id: Date.now(), name, phone: newSupplierPhone.trim() };
    setSuppliers(prev => [...prev, newS]);
    setSelectedSupplierId(String(newS.id));
    setSupplierName(name);
    setShowAddSupplier(false);
    setNewSupplierName('');
    setNewSupplierPhone('');
    showSuccess('Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® Ïº┘ä┘à┘êÏ▒Ï» Ô£ô');
  };

  const handleProductSelect = (product) => {
    const existing = purchaseItems.find(item => item.productId === product.id);
    if (existing) {
      setPurchaseItems(purchaseItems.map(item => item.id === existing.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setPurchaseItems([...purchaseItems, { id: Date.now() + Math.random(), productId: product.id, qty: 1, costPerUnit: product.buyPrice }]);
    }
  };

  const handleUpdateItem = (id, field, value) => {
    setPurchaseItems(purchaseItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (id) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
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
        costPerUnit: item.costPerUnit || p.buyPrice,
        subtotal: item.qty * (item.costPerUnit || p.buyPrice)
      };
    });
    const record = onPurchase(selectedSupplier?.name || supplierName, mappedItems, totalAmount);
    if (record) {
      if (remaining > 0 && selectedSupplierId) {
        setDebts(prev => [...prev, {
          id: Date.now(),
          clientId: 0,
          clientName: selectedSupplier?.name || supplierName,
          amount: remaining,
          paid: 0,
          status: 'pending',
          note: `Ï»┘è┘å ┘à┘êÏ▒Ï» - ┘üÏºÏ¬┘êÏ▒Ï® Ï┤Ï▒ÏºÏí`,
          date: new Date().toISOString(),
          type: 'supplier',
        }]);
      }
      onShowReceipt(record);
      setPurchaseItems([]);
      setSelectedSupplierId('');
      setSupplierName('');
      setNotes('');
      setAmountPaid('');
    }
  };

  if (showFullHistory) {
    return (
      <div style={{ paddingBottom: 100, minHeight: '100vh', background: C.bg }}>
        <AppHeader
          title="┘â┘ä Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬"
          left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={() => setShowFullHistory(false)}><ChevronLeft size={24} color={C.dark} /></HeaderIconButton>}
          border
        />
        <div style={{ padding: '16px' }}>
          {allPurchases.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>┘äÏº Ï¬┘êÏ¼Ï» ┘àÏ┤Ï¬Ï▒┘èÏºÏ¬ Ï│ÏºÏ¿┘éÏ®</div>}
          {allPurchases.map((r, i) => {
            const isBulk = r.items && Array.isArray(r.items);
            const itemsCount = isBulk ? r.items.length : 1;
            const expanded = expandedHistoryId === r.id;
            return (
              <div key={r.id || i} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                <div onClick={() => setExpandedHistoryId(expanded ? null : r.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.blue }}>{fmt(r.total)} DA</div>
                    <button onClick={(e) => { e.stopPropagation(); onShowReceipt(r); }} style={{ background: '#F3F4F6', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 4 }}>
                      <Receipt size={14} color={C.dark} />
                    </button>
                  </div>
                  <div style={{ flex: 1, padding: '0 12px', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{r.supplier || 'Ï║┘èÏ▒ ┘àÏ¡Ï»Ï»'}</div>
                    <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{itemsCount} ┘à┘åÏ¬Ï¼ÏºÏ¬</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 11, color: C.gray }}>{r.date || 'Ïº┘ä┘è┘ê┘à'}</span>
                    {expanded ? <ChevronUp size={16} color={C.gray} /> : <ChevronDown size={16} color={C.gray} />}
                  </div>
                </div>
                {expanded && isBulk && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
                    {r.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                        <span style={{ fontWeight: 700, color: C.dark }}>{fmt(item.subtotal)} DA</span>
                        <span style={{ color: C.gray }}>{item.productName} ├ù {item.qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: C.bg }}>
      <AppHeader
        title="Ï┤Ï▒ÏºÏí Ï¼Ï»┘èÏ»"
        right={<HeaderIconButton label="Ïº┘ä┘â┘ä" onClick={() => setShowFullHistory(true)}><ShoppingBag size={22} color={C.dark} /></HeaderIconButton>}
      />

      {/* Total Amount Bar */}
      <div style={{ margin: '8px 16px', background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: C.shadow, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: C.gray, fontWeight: 600 }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘äÏ┤Ï▒ÏºÏí</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{fmt(totalAmount)} <span style={{ fontSize: 13 }}>DA</span></span>
      </div>

      {/* Segmented Tabs */}
      <div style={{ display: 'flex', margin: '12px 16px', background: '#F3F4F6', borderRadius: 14, padding: 4, gap: 4 }}>
        {[
          { id: 'supplier', label: 'Ïº┘ä┘à┘êÏ▒Ï»' },
          { id: 'items', label: `Ïº┘äÏÑÏÂÏº┘üÏ® (${purchaseItems.length})` },
          { id: 'payment', label: 'Ïº┘äÏ»┘üÏ╣' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: activeTab === tab.id ? '#fff' : 'transparent', color: activeTab === tab.id ? C.dark : C.gray, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
          {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Supplier */}
      {activeTab === 'supplier' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘à┘êÏ▒Ï» *</label>
            <div onClick={() => setShowSupplierPicker(true)} style={{ padding: '16px', borderRadius: 14, border: `2px dashed ${selectedSupplierId ? C.green : '#93C5FD'}`, background: selectedSupplierId ? '#F0F9FF' : '#EFF6FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="#fff" />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: selectedSupplierId ? C.dark : C.blue }}>{selectedSupplier ? selectedSupplier.name : 'ÏºÏ«Ï¬Ï▒ ┘à┘êÏ▒Ï»Ïº┘ï'}</span>
              </div>
              <ChevronLeft size={20} color={C.gray} />
            </div>
          </div>

          {selectedSupplier && (
            <div style={{ marginTop: 16 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: C.shadow, border: `1px solid ${C.border}`, marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Ï│Ï¼┘ä Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬ ┘àÏ╣ {selectedSupplier.name}</div>
                {(() => {
                  const history = (Array.isArray(allPurchases) ? allPurchases : []).filter(r => r.supplier === selectedSupplier.name);
                  if (history.length === 0) {
                    return <div style={{ textAlign: 'center', padding: '16px 0', color: C.gray, fontSize: 13 }}>┘äÏº Ï¬┘êÏ¼Ï» ┘àÏ┤Ï¬Ï▒┘èÏºÏ¬ Ï│ÏºÏ¿┘éÏ® ┘àÏ╣ ┘çÏ░Ïº Ïº┘ä┘à┘êÏ▒Ï»</div>;
                  }
                  return history.map((r, i) => {
                    const itemsCount = r.items && Array.isArray(r.items) ? r.items.length : 1;
                    return (
                      <div key={r.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{itemsCount} ┘à┘åÏ¬Ï¼ÏºÏ¬</div>
                          <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{r.date || 'Ïº┘ä┘è┘ê┘à'}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.blue }}>{fmt(r.total)} DA</div>
                      </div>
                    );
                  });
                })()}
              </div>

              {(() => {
                const supplierPurchases = (Array.isArray(allPurchases) ? allPurchases : []).filter(r => r.supplier === selectedSupplier.name);
                const totalPurchased = supplierPurchases.reduce((s, r) => s + (Number(r.total) || 0), 0);
                const totalDebtOwed = supplierPurchases.reduce((s, r) => s + (Number(r.remainingDebt) || 0), 0);
                const totalPaidToSupplier = (Array.isArray(debts) ? debts : []).filter(d => d.clientName === selectedSupplier.name && d.type === 'supplier').reduce((s, d) => s + (Number(d.paid) || 0), 0);
                const totalUnpaidToSupplier = (Array.isArray(debts) ? debts : []).filter(d => d.clientName === selectedSupplier.name && d.type === 'supplier').reduce((s, d) => s + ((Number(d.amount) || 0) - (Number(d.paid) || 0)), 0);
                if (supplierPurchases.length === 0) return null;
                return (
                  <div style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Ïº┘ä┘à┘äÏ«ÏÁ Ïº┘ä┘àÏº┘ä┘è</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.gray }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{fmt(totalPurchased)} DA</span>
                    </div>
                    {totalUnpaidToSupplier > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 13, color: C.red }}>Ïº┘ä┘àÏ¬Ï¿┘é┘è ┘ä┘ä┘à┘êÏ▒Ï» (Ïú┘åÏº ┘àÏ»┘è┘å)</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.red }}>{fmt(totalUnpaidToSupplier)} DA</span>
                      </div>
                    )}
                    {totalPaidToSupplier > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ fontSize: 13, color: C.green }}>Ïº┘ä┘àÏ»┘ü┘êÏ╣ ┘ä┘ä┘à┘êÏ▒Ï»</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{fmt(totalPaidToSupplier)} DA</span>
                      </div>
                    )}
                    {totalUnpaidToSupplier === 0 && totalPaidToSupplier === 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ fontSize: 13, color: C.gray }}>Ïº┘äÏ¡Ïº┘äÏ®</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>┘äÏº Ï»┘è┘ê┘å</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>┘à┘äÏºÏ¡Ï©Ï® (ÏºÏ«Ï¬┘èÏºÏ▒┘è)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="┘à┘äÏºÏ¡Ï©Ï® (ÏºÏ«Ï¬┘èÏºÏ▒┘è)" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
          </div>
        </div>
      )}

      {/* TAB: Items */}
      {activeTab === 'items' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{purchaseItems.length} ┘àÏ«Ï¬ÏºÏ▒</span>
              <Check size={18} color={C.green} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘äÏ┤Ï▒ÏºÏí: {fmt(totalAmount)} DA</span>
          </div>

          {purchaseItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: C.gray, fontSize: 14 }}>ÏºÏÂÏ║ÏÀ "ÏÑÏÂÏº┘üÏ® ┘à┘åÏ¬Ï¼" ┘äÏ¿Ï»Ïí Ïº┘äÏ┤Ï▒ÏºÏí</div>
          ) : purchaseItems.map(item => {
            const p = products.find(pr => pr.id === item.productId) || {};
            const subtotal = item.qty * (item.costPerUnit || p.buyPrice || 0);
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => handleRemoveItem(item.id)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={14} color={C.red} />
                    </button>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.emoji || '­ƒôª'}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: C.gray }}>Ïº┘ä┘àÏ¼┘à┘êÏ╣: {fmt(subtotal)} DA</div>
                    </div>
                  </div>
                  <Check size={20} color={C.green} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: C.gray, marginBottom: 4, display: 'block' }}>Ïº┘ä┘â┘à┘èÏ®</label>
                    <input type="number" inputMode="numeric" value={item.qty} onChange={e => handleUpdateItem(item.id, 'qty', Math.max(1, Number(e.target.value) || 1))} style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box', background: '#FAFAFA' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: C.gray, marginBottom: 4, display: 'block' }}>Ï¬┘â┘ä┘üÏ® Ïº┘ä┘êÏ¡Ï»Ï®</label>
                    <input type="number" inputMode="decimal" value={item.costPerUnit || ''} onChange={e => handleUpdateItem(item.id, 'costPerUnit', Number(e.target.value) || 0)} placeholder={String(p.buyPrice || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box', background: '#FAFAFA' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: C.gray, marginBottom: 4, display: 'block' }}>Ïº┘ä┘àÏ¼┘à┘êÏ╣</label>
                    <div style={{ padding: '8px 10px', borderRadius: 10, background: '#EFF6FF', textAlign: 'center', fontSize: 14, fontWeight: 800, color: C.blue }}>{fmt(subtotal)} DA</div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={() => setShowProductSelector(true)} style={{ width: '100%', height: 52, background: '#F9FAFB', border: `1.5px dashed #D1D5DB`, borderRadius: 12, color: C.dark, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 8, gap: 6 }}>
            <Plus size={18} /> ÏÑÏÂÏº┘üÏ® ┘à┘åÏ¬Ï¼
          </button>
        </div>
      )}

      {/* TAB: Payment */}
      {activeTab === 'payment' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: C.shadow, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘äÏ┤Ï▒ÏºÏí</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{fmt(totalAmount)} DA</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘àÏ¿┘äÏ║ Ïº┘ä┘àÏ»┘ü┘êÏ╣ Ïº┘äÏó┘å</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: '#FAFAFA', height: 52 }}>
                <Wallet size={20} color={C.gray} />
                <input type="number" inputMode="decimal" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 20, fontWeight: 800, background: 'transparent', textAlign: 'left', direction: 'ltr' }} />
                <span style={{ fontSize: 13, color: C.gray }}>DA</span>
              </div>
            </div>
            <button onClick={() => setAmountPaid(String(totalAmount))} style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 12, border: 'none', background: '#EFF6FF', color: C.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              ­ƒÆÁ Ï»┘üÏ╣ Ïº┘ä┘àÏ¿┘äÏ║ ┘âÏº┘à┘äÏº┘ï ({fmt(totalAmount)} DA)
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, color: C.gray }}>Ïº┘ä┘àÏ¿┘äÏ║ Ïº┘ä┘àÏ»┘ü┘êÏ╣ Ïº┘äÏó┘å</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{fmt(paidAmount)} DA</span>
            </div>
            {remaining > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, color: C.gray }}>Ï»┘è┘å ┘ä┘ä┘à┘êÏ▒Ï»</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>{fmt(remaining)} DA</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ│Ï¬Ï¡┘é ┘ä┘ä┘à┘êÏ▒Ï»</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.red }}>{fmt(totalSupplierDue)} DA</span>
            </div>
          </div>
        </div>
      )}

      {/* Save + Cancel Bottom Bar */}
      {purchaseItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', padding: '14px 16px 70px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 200, display: 'flex', gap: 10 }}>
          <button onClick={() => { setPurchaseItems([]); setSelectedSupplierId(''); setAmountPaid(''); }} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
          <button onClick={handleSave} style={{ flex: 1.5, padding: '14px', borderRadius: 14, border: 'none', background: C.green, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Check size={18} /> Ï¡┘üÏ©
          </button>
        </div>
      )}

      {/* Supplier Picker Bottom Sheet */}
      {showSupplierPicker && (
        <>
          <div onClick={() => setShowSupplierPicker(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 220 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, maxHeight: '70vh', background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 221, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setShowSupplierPicker(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color={C.dark} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>ÏºÏ«Ï¬Ï▒ ┘à┘êÏ▒Ï»Ïº┘ï</h2>
              <button onClick={() => { setShowSupplierPicker(false); setShowAddSupplier(true); }} style={{ fontSize: 13, fontWeight: 700, color: C.blue, background: 'none', border: 'none', cursor: 'pointer' }}>+ Ï¼Ï»┘èÏ»</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
              {suppliers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: C.gray }}>┘äÏº ┘è┘êÏ¼Ï» ┘à┘êÏ▒Ï»┘ê┘å. ÏºÏÂÏ║ÏÀ "+ Ï¼Ï»┘èÏ»" ┘äÏÑÏÂÏº┘üÏ® ┘à┘êÏ▒Ï».</div>
              ) : suppliers.map(s => (
                <div key={s.id} onClick={() => { setSelectedSupplierId(String(s.id)); setShowSupplierPicker(false); }} style={{ padding: '14px', borderRadius: 12, marginBottom: 8, background: String(s.id) === selectedSupplierId ? '#EFF6FF' : '#F9FAFB', border: String(s.id) === selectedSupplierId ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={18} color={C.blue} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{s.name}</div>
                    {s.phone && <div style={{ fontSize: 12, color: C.gray }}>{s.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <>
          <div onClick={() => setShowAddSupplier(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 230 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 231, animation: 'slideUp 0.25s ease', padding: '16px 18px 24px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, textAlign: 'center', marginBottom: 16 }}>┘à┘êÏ▒Ï» Ï¼Ï»┘èÏ»</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 6, display: 'block', textAlign: 'right' }}>ÏºÏ│┘à Ïº┘ä┘à┘êÏ▒Ï» *</label>
              <input value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} placeholder="ÏºÏ│┘à Ïº┘ä┘à┘êÏ▒Ï»" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 6, display: 'block', textAlign: 'right' }}>Ïº┘ä┘çÏºÏ¬┘ü (ÏºÏ«Ï¬┘èÏºÏ▒┘è)</label>
              <input value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} placeholder="0555555555" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'ltr', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAddSupplier(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
              <button onClick={handleAddSupplier} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: C.blue, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Ï¡┘üÏ©</button>
            </div>
          </div>
        </>
      )}

      {/* Product Selector Bottom Sheet */}
      {showProductSelector && (
        <>
          <div onClick={() => setShowProductSelector(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, height: '85vh', background: '#F9FAFB', borderRadius: '24px 24px 0 0', zIndex: 201, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => setShowProductSelector(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} color={C.dark} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>ÏºÏ«Ï¬Ï▒ Ïº┘ä┘à┘åÏ¬Ï¼ÏºÏ¬</h2>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: '#fff', borderBottom: `1px solid ${C.border}`, direction: 'rtl' }}>
              {[ALL_FILTER, ...categories].map(catName => (
                <button key={catName} onClick={() => setSelectorCategory(catName)} style={{ padding: '8px 16px', borderRadius: 999, border: selectorCategory === catName ? 'none' : `1px solid ${C.border}`, background: selectorCategory === catName ? C.blue : '#fff', color: selectorCategory === catName ? '#fff' : C.dark, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>
                  {catName}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {selectorProducts.map(p => (
                  <div key={p.id} onClick={() => handleProductSelect(p)} style={{ background: '#fff', borderRadius: 16, padding: '16px 14px', textAlign: 'center', boxShadow: C.shadow, cursor: 'pointer', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{p.emoji || '­ƒôª'}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.blue }}>{p.buyPrice} <span style={{ fontSize: 12 }}>DA</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 4: CLOSE DAY (ÏÑÏ║┘äÏº┘é Ïº┘ä┘è┘ê┘à)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function CloseDayScreen({ step, setStep, todaySalesTotal, todayPurchasesTotal, stockValue, onClose, onBack }) {
  return (
    <div>
      <AppHeader
        title="ÏÑÏ║┘äÏº┘é Ïº┘ä┘è┘ê┘à"
        subtitle={getArabicDate()}
        left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
      />

      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {[ { num: 1, label: 'Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬' }, { num: 2, label: 'Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬' }, { num: 3, label: 'Ïº┘äÏÑÏ║┘äÏº┘é' } ].map((s, i) => {
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
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16, textAlign: 'right' }}>┘àÏ┤Ï¬Ï▒┘èÏºÏ¬ Ïº┘ä┘è┘ê┘à</h3>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.dark, textAlign: 'center', marginBottom: 20 }}>┘ç┘ä ÏºÏ┤Ï¬Ï▒┘èÏ¬ Ï┤┘èÏªÏº┘ï Ïº┘ä┘è┘ê┘àÏƒ</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Check size={18} /> ┘åÏ╣┘à</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#fff', color: C.dark, border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><X size={18} /> ┘äÏº</button>
            </div>
          </div>
        </div>
      )}

      {step >= 3 && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: C.radius, padding: '24px 20px', boxShadow: C.shadow }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, textAlign: 'right' }}>┘à┘äÏ«ÏÁ Ïº┘ä┘è┘ê┘à</h3>
            {[
              { icon: <TrendingUp size={20} color={C.green} />, label: 'ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬', value: todaySalesTotal, color: C.green, bg: '#F0FDF4' },
              { icon: <ShoppingBag size={20} color={C.orange} />, label: 'ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬', value: todayPurchasesTotal, color: C.orange, bg: '#FFF7ED' },
              { icon: <Package size={20} color={C.blue} />, label: '┘é┘è┘àÏ® Ïº┘ä┘àÏ«Ï▓┘ê┘å Ïº┘äÏ«Ï¬Ïº┘à┘è', value: stockValue, color: C.blue, bg: '#EFF6FF' },
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
            <Lock size={18} /> ÏÑÏ║┘äÏº┘é Ïº┘ä┘è┘ê┘à ┘êÏ¿Ï»Ïí ┘è┘ê┘à Ï¼Ï»┘èÏ»
          </button>
          <p style={{ fontSize: 12, color: C.red, textAlign: 'center', marginTop: 8 }}>ÏÑÏ║┘äÏº┘é Ïº┘ä┘è┘ê┘à Ï│┘è┘é┘ê┘à Ï¿Ï¬ÏÁ┘ü┘èÏ▒ Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬ ┘äÏ¿Ï»Ïí ┘è┘ê┘à Ï¼Ï»┘èÏ»</p>
        </div>
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 5: REPORTS (Ïº┘äÏ¬┘éÏºÏ▒┘èÏ▒)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ReportsScreen({ products, todaySales, todaySalesTotal, todayPurchasesTotal, todayProfit, debts, onShowDetails, onShowCloseDay, onExport, onShare, productRecipes = [], ingredients = [], cyclicExpenses = [] }) {
  const [period, setPeriod] = useState('Ïº┘ä┘è┘ê┘à');
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

  const dailyCostsList = useMemo(() => {
    return cyclicExpenses.map(exp => {
      const amount = Number(exp.amount) || 0;
      const cycleNumber = Number(exp.cycleNumber) || 1;
      let dailyCost = 0;
      if (exp.cycleUnit === '┘è┘ê┘à') {
        dailyCost = amount / cycleNumber;
      } else if (exp.cycleUnit === 'Ï┤┘çÏ▒') {
        dailyCost = amount / (cycleNumber * 30);
      }
      return { ...exp, dailyCost };
    });
  }, [cyclicExpenses]);

  const totalDailyCost = dailyCostsList.reduce((s, e) => s + e.dailyCost, 0);
  const realNetProfit = todayProfit - totalDailyCost;

  const bestProducts = useMemo(() => {
    const map = {};
    todaySales.forEach(s => {
      if (!map[s.productId]) map[s.productId] = { qty: 0, profit: 0 };
      map[s.productId].qty += s.qty;
      const p = products.find(pr => pr.id === s.productId);
      if (p) {
        const bp = p.has_recipe ? productRecipes.filter(rec => rec.product_id === p.id).reduce((sum, rec) => {
          const ing = ingredients.find(i => i.id === rec.ingredient_id);
          return sum + (Number(rec.quantity_used) || 0) * (ing ? (Number(ing.cost_per_unit) || 0) : 0);
        }, 0) : (Number(p.buyPrice) || 0);
        map[s.productId].profit += s.qty * (p.sellPrice - bp);
      }
    });
    return Object.entries(map).map(([id, data]) => {
      const p = products.find(pr => pr.id === Number(id));
      return p ? { ...p, soldQty: data.qty, profit: data.profit } : null;
    }).filter(Boolean).sort((a, b) => b.soldQty - a.soldQty);
  }, [todaySales, products, productRecipes, ingredients]);

  return (
    <div>
      <AppHeader
        title="Ïº┘äÏ¬┘éÏºÏ▒┘èÏ▒"
        left={(
          <>
            <HeaderIconButton label="┘àÏ┤ÏºÏ▒┘âÏ®" onClick={onShare}><Share2 size={21} color={C.dark} /></HeaderIconButton>
            <HeaderIconButton label="Ï¬Ï¡┘à┘è┘ä" onClick={onExport}><Download size={21} color={C.dark} /></HeaderIconButton>
          </>
        )}
        right={<HeaderIconButton label="Ï¬┘üÏºÏÁ┘è┘ä Ïº┘ä┘è┘ê┘à" onClick={() => setShowDrawer(true)}><Menu size={22} color={C.dark} /></HeaderIconButton>}
      />

      <div style={{ padding: '8px 16px' }}>
        <button onClick={onShowCloseDay} style={{ width: '100%', padding: '14px 20px', borderRadius: 14, background: 'linear-gradient(135deg, #1A1A1A, #374151)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' }}>
          <Moon size={18} /> ÏÑÏ║┘äÏº┘é Ïº┘ä┘è┘ê┘à
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange, marginRight: 4 }} />
        </button>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, background: '#fff' }}>
          {['Ïº┘äÏ┤┘çÏ▒', 'Ïº┘äÏúÏ│Ï¿┘êÏ╣', 'Ïº┘ä┘è┘ê┘à'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, background: period === p ? C.blue : 'transparent', color: period === p ? '#fff' : C.dark, border: 'none', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '8px 16px' }}>
        {[
          { label: 'ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬', value: `${fmt(todaySalesTotal)} DA`, color: C.green },
          { label: 'ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬', value: `${fmt(todayPurchasesTotal)} DA`, color: C.orange },
          { label: 'ÏÁÏº┘ü┘è Ïº┘äÏ▒Ï¿Ï¡', value: `${fmt(todayProfit)} DA`, color: C.blue },
          { label: 'Ï╣Ï»Ï» Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬', value: salesCount, color: C.dark },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: C.radius, padding: '16px', boxShadow: C.shadow }}>
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            {i === 2 && todayProfit > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: '#F0FDF4', padding: '2px 8px', borderRadius: 10, marginTop: 4, display: 'inline-block' }}>+{Math.round((todayProfit / Math.max(todaySalesTotal, 1)) * 100)}%</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', background: '#fff', margin: '12px 16px', borderRadius: C.radius, boxShadow: C.shadow }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: C.dark }}>Ïº┘ä┘àÏ¿┘èÏ╣ÏºÏ¬ - ÏóÏ«Ï▒ 7 Ïú┘èÏº┘à</h3>
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
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: C.dark }}>Ïú┘üÏÂ┘ä Ïº┘ä┘à┘åÏ¬Ï¼ÏºÏ¬ ┘àÏ¿┘èÏ╣Ïº┘ï</h3>
        {bestProducts.length === 0 && <p style={{ fontSize: 13, color: C.gray, textAlign: 'center', padding: 20 }}>┘äÏº Ï¬┘êÏ¼Ï» ┘àÏ¿┘èÏ╣ÏºÏ¬ Ï¿Ï╣Ï»</p>}
        {bestProducts.map((p, i) => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: '12px', marginBottom: 8, boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#FEF3C7' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
            <ProductEntity product={p} variant="small" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: C.gray, marginRight: 6 }}>├ù{p.soldQty}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{fmt(p.profit)} DA</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 100px' }}>
        <button onClick={onShowDetails} style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#fff', color: C.blue, border: `1.5px solid ${C.blue}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Ï¬┘üÏºÏÁ┘è┘ä Ïº┘äÏúÏ▒Ï¿ÏºÏ¡ Ï¡Ï│Ï¿ Ïº┘ä┘à┘åÏ¬Ï¼ ÔåÉ</button>
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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 5b: PROFIT DETAILS
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ProfitDetailsScreen({ products, todaySales, dayRecord, onBack, productRecipes = [], ingredients = [] }) {
  const [period, setPeriod] = useState('Ïº┘ä┘è┘ê┘à');
  const [expanded, setExpanded] = useState({ '┘àÏ┤Ï▒┘êÏ¿ÏºÏ¬': true, 'Ïú┘â┘ä': true, 'ÏúÏ«Ï▒┘ë': true });

  const categories = useMemo(() => uniqueCategories([...DEFAULT_CATEGORIES, ...products.map(product => product.category)]), [products]);
  const categoryEmojis = { '┘àÏ┤Ï▒┘êÏ¿ÏºÏ¬': '­ƒÑñ', 'Ïú┘â┘ä': '­ƒìƒ', 'ÏúÏ«Ï▒┘ë': '­ƒº┤' };

  const profitData = useMemo(() => {
    const data = {};
    products.forEach(p => {
      const openQty = dayRecord.openingQty[p.id] || p.qty;
      const soldQty = todaySales.filter(s => s.productId === p.id).reduce((s, r) => s + r.qty, 0);
      const bp = p.has_recipe ? productRecipes.filter(rec => rec.product_id === p.id).reduce((sum, rec) => {
        const ing = ingredients.find(i => i.id === rec.ingredient_id);
        return sum + (Number(rec.quantity_used) || 0) * (ing ? (Number(ing.cost_per_unit) || 0) : 0);
      }, 0) : (Number(p.buyPrice) || 0);
      data[p.id] = { product: p, ownedQty: p.qty, soldQty, profit: soldQty * (p.sellPrice - bp), openQty };
    });
    return data;
  }, [products, todaySales, dayRecord, productRecipes, ingredients]);

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
        title="Ï¬┘üÏºÏÁ┘è┘ä Ïº┘äÏúÏ▒Ï¿ÏºÏ¡"
        left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
        right={<HeaderIconButton label="Ïº┘äÏúÏ▒Ï¿ÏºÏ¡"><ShoppingBag size={22} color={C.dark} /></HeaderIconButton>}
      />

      <div style={{ margin: '8px 16px', padding: '24px 20px', background: `linear-gradient(135deg, ${C.blue}, #1D4ED8)`, borderRadius: C.radius, textAlign: 'center', color: '#fff' }}>
        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘äÏ▒Ï¿Ï¡ Ïº┘äÏÁÏº┘ü┘è</p>
        <p style={{ fontSize: 42, fontWeight: 800, marginBottom: 4 }}>{fmt(totalProfit)} <span style={{ fontSize: 18 }}>DA</span></p>
        <p style={{ fontSize: 12, opacity: 0.8 }}>┘à┘å {categoriesWithProducts.length} ┘üÏªÏºÏ¬ | {products.length} ┘à┘åÏ¬Ï¼</p>
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
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>Ïº┘ä┘à┘åÏ¬Ï¼</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'center' }}>Ïº┘ä┘àÏ«Ï▓┘ê┘å Ïº┘ä┘à┘à┘ä┘ê┘â</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'center' }}>Ïº┘ä┘àÏ«Ï▓┘ê┘å Ïº┘ä┘àÏ¿┘èÏ╣</span>
                <span style={{ fontSize: 11, color: C.gray, fontWeight: 600, textAlign: 'left' }}>Ïº┘äÏ▒Ï¿Ï¡</span>
              </div>
              {products.filter(p => p.category === cat).map(p => {
                const d = profitData[p.id];
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr', padding: '10px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                    <ProductEntity product={p} variant="small" />
                    <><span style={{ fontSize: 12, textAlign: 'center' }}>{d?.ownedQty || 0} ┘êÏ¡Ï»Ï®</span><span style={{ fontSize: 12, textAlign: 'center' }}>{d?.soldQty || 0} ┘êÏ¡Ï»Ï®</span></>
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

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN 6: ADD/EDIT PRODUCT
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ProductFormScreen({ product, categories, onSave, onDelete, onRestore, onToggle, onBack }) {
  const isEdit = !!product;
  const fileInputRef = useRef(null);
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [emoji, setEmoji] = useState(product?.emoji || '­ƒôª');
  const [image, setImage] = useState(product?.image || '');
  const [buyPrice, setBuyPrice] = useState(String(product?.buyPrice || '0'));
  const [sellPrice, setSellPrice] = useState(String(product?.sellPrice || '0'));
  const [qty, setQty] = useState(product?.qty || 0);
  const [minAlert, setMinAlert] = useState(product?.minAlert || 5);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const profit = (Number(sellPrice) || 0) - (Number(buyPrice) || 0);
  const isInactive = isEdit && !product.is_active;
  const productForPreview = { ...product, id: product?.id || 0, name: name || '┘à┘åÏ¬Ï¼ Ï¼Ï»┘èÏ»', emoji, category: category || 'ÏúÏ«Ï▒┘ë', image };

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
        title={isEdit ? 'Ï¬Ï╣Ï»┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼' : 'ÏÑÏÂÏº┘üÏ® ┘à┘åÏ¬Ï¼'}
        left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
        right={<button onClick={handleSave} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, color: C.dark }}>Ï¡┘üÏ©</button>}
        border
      />

      <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
        {isInactive && (
          <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>┘çÏ░Ïº Ïº┘ä┘à┘åÏ¬Ï¼ ┘àÏ╣ÏÀ┘ä Ï¡Ïº┘ä┘èÏº┘ï</span>
            <button onClick={() => onRestore(product.id)} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={14} /> Ï¬┘üÏ╣┘è┘ä</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <div style={{ width: 110, height: 110, borderRadius: 24, background: '#fff', border: `2px dashed ${image ? 'transparent' : C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              {image ? (
                <img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: 48 }}>{emoji}</span>
              )}
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: '50%', background: C.blue, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              <ImagePlus size={18} />
            </button>
          </div>
          {image && (
            <button type="button" onClick={() => setImage('')} style={{ marginTop: 12, border: 'none', background: 'transparent', color: C.red, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>ÏÑÏ▓Ïº┘äÏ® Ïº┘äÏÁ┘êÏ▒Ï® Ïº┘ä┘àÏ▒┘ü┘êÏ╣Ï®</button>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïú┘ê ÏºÏ«Ï¬Ï▒ Ï▒┘àÏ▓Ïº┘ï Ï│Ï▒┘èÏ╣Ïº┘ï</label>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, direction: 'rtl', scrollbarWidth: 'none' }}>
            {['­ƒôª', '­ƒÑ½', '­ƒÑø', '­ƒÑ®', '­ƒìö', '­ƒìò', '­ƒìƒ', '­ƒÑñ', 'Ôÿò', '­ƒì░', '­ƒÑÉ', '­ƒìÄ', '­ƒÑò', '­ƒìà', '­ƒºà', '­ƒîÂ´©Å', '­ƒºÇ', '­ƒìù', '­ƒìÜ', '­ƒÑû', '­ƒÑ¬', '­ƒÑù'].map(e => (
              <button key={e} type="button" onClick={() => { setEmoji(e); setImage(''); }} style={{ fontSize: 28, padding: '10px 14px', background: emoji === e && !image ? '#EFF6FF' : '#fff', border: emoji === e && !image ? `2px solid ${C.blue}` : `1px solid ${C.border}`, borderRadius: 16, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</button>
            ))}
          </div>
        </div>

        {/* ÏºÏ│┘à Ïº┘ä┘à┘åÏ¬Ï¼ */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>ÏºÏ│┘à Ïº┘ä┘à┘åÏ¬Ï¼</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ÏúÏ»Ï«┘ä ÏºÏ│┘à Ïº┘ä┘à┘åÏ¬Ï¼" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
        </div>

        {/* Ïº┘äÏ¬ÏÁ┘å┘è┘ü */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>Ïº┘äÏ¬ÏÁ┘å┘è┘ü</label>
          <div onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, background: '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <ChevronDown size={16} color={C.gray} />
            <span style={{ color: category ? C.dark : C.gray }}>{category || 'ÏºÏ«Ï¬Ï▒ Ïº┘äÏ¬ÏÁ┘å┘è┘ü'}</span>
          </div>
          {showCategoryDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 12, marginTop: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 50 }}>
              {categories.map(c => (
                <div key={c} onClick={() => { setCategory(c); setShowCategoryDropdown(false); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 14, background: category === c ? '#F0F7FF' : 'transparent' }}>{c}</div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Inventory Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
          {/* Row 1: Ï│Ï╣Ï▒ Ïº┘äÏ┤Ï▒ÏºÏí & ÏÑÏ»ÏºÏ▒Ï® Ïº┘ä┘â┘à┘èÏ® Ïº┘ä┘àÏ¬┘ê┘üÏ▒Ï® */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {/* Right field in RTL: Ï│Ï╣Ï▒ Ïº┘äÏ┤Ï▒ÏºÏí (DA) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>Ï│Ï╣Ï▒ Ïº┘äÏ┤Ï▒ÏºÏí (DA)</label>
              <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            {/* Left field in RTL: ÏÑÏ»ÏºÏ▒Ï® Ïº┘ä┘â┘à┘èÏ® Ïº┘ä┘àÏ¬┘ê┘üÏ▒Ï® */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>ÏÑÏ»ÏºÏ▒Ï® Ïº┘ä┘â┘à┘èÏ® Ïº┘ä┘àÏ¬┘ê┘üÏ▒Ï®</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, padding: '0 6px', borderRadius: 12, border: '2px solid #D1D5DB', background: '#FAFAFA', boxSizing: 'border-box' }}>
                <button onClick={() => setQty(Math.max(0, qty - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: 24, fontWeight: 800, minWidth: 40, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          {/* Row 2: Ï│Ï╣Ï▒ Ïº┘äÏ¿┘èÏ╣ & Ï¬┘åÏ¿┘è┘ç ┘å┘éÏÁ (Ïú┘é┘ä ┘à┘å) */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {/* Right field in RTL: Ï│Ï╣Ï▒ Ïº┘äÏ¿┘èÏ╣ (DA) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>Ï│Ï╣Ï▒ Ïº┘äÏ¿┘èÏ╣ (DA)</label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            {/* Left field in RTL: Ï¬┘åÏ¿┘è┘ç ┘å┘éÏÁ (Ïú┘é┘ä ┘à┘å) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>Ï¬┘åÏ¿┘è┘ç ┘å┘éÏÁ (Ïú┘é┘ä ┘à┘å)</label>
              <input type="number" value={minAlert} onChange={e => setMinAlert(e.target.value)} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Ïº┘äÏ▒Ï¿Ï¡ Ïº┘ä┘àÏ¡┘é┘é */}
        <div style={{ padding: '8px 14px', marginBottom: 24, fontSize: 13, color: C.gray, textAlign: 'right' }}>
          Ïº┘äÏ▒Ï¿Ï¡ Ïº┘ä┘àÏ¡┘é┘é (DA): <span style={{ fontWeight: 700, color: profit >= 0 ? C.green : C.red }}>{profit.toFixed(2)}</span>
        </div>

        {isEdit ? (
          <>
            <button onClick={handleSave} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Save size={18} /> Ï¡┘üÏ© Ïº┘äÏ¬Ï║┘è┘èÏ▒ÏºÏ¬</button>
            <div style={{ display: 'flex', gap: 10 }}>
              {product.is_active ? (
                <button onClick={() => onToggle(product.id)} style={{ flex: 1, padding: '12px', borderRadius: 14, background: '#f0f0f0', color: C.gray, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Power size={16} /> Ï¬Ï╣ÏÀ┘è┘ä</button>
              ) : (
                <button onClick={() => onRestore(product.id)} style={{ flex: 1, padding: '12px', borderRadius: 14, background: C.green, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><RotateCcw size={16} /> Ï¬┘üÏ╣┘è┘ä</button>
              )}
              <button onClick={() => onDelete(product.id)} style={{ flex: 1, padding: '12px', borderRadius: 14, background: product.is_active ? C.orange : C.red, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Power size={16} /> {product.is_active ? 'Ï¡Ï░┘ü (Ï¬Ï╣ÏÀ┘è┘ä)' : '┘àÏ╣ÏÀ┘ä Ï¿Ïº┘ä┘üÏ╣┘ä'}</button>
            </div>
          </>
        ) : (
          <button onClick={handleSave} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.blue, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Save size={18} /> Ï¡┘üÏ© Ïº┘ä┘à┘åÏ¬Ï¼</button>
        )}
      </div>
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SHARED MODAL CARD
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ModalCard({ title, onClose, children, locked = false }) {
  return (
    <>
      <div onClick={locked ? undefined : onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, animation: 'fadeIn 0.2s ease' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(340px, 90vw)', maxHeight: '82vh', overflowY: 'auto', background: '#fff', borderRadius: 20, padding: 20, zIndex: 301, boxSizing: 'border-box', direction: 'rtl', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: C.dark }}>{title}</h2>
          {!locked && (
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color={C.dark} />
            </button>
          )}
        </div>
        {children}
      </div>
    </>
  );
}

const modalInputStyle = { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' };
const modalLabelStyle = { fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 6, display: 'block', textAlign: 'right' };

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: STOCK CHECK (Ïº┘ä┘àÏ«Ï▓┘ê┘å Ïº┘ä┘àÏ│ÏºÏª┘è)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
export function StockScreen({ ingredients, setIngredients, showSuccess }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIng, setNewIng] = useState({ name: '', unit: 'Ï║', cost_per_unit: '', starting_stock: '', emoji: '­ƒôª' });
  const [detailIng, setDetailIng] = useState(null);
  const [detailDraft, setDetailDraft] = useState(null);
  const [confirmDeleteIng, setConfirmDeleteIng] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const activeGroupAdd = UNIT_GROUPS.find(g => g.units.includes(newIng.unit))?.id || 'weight';
  const activeGroupEdit = detailDraft ? (UNIT_GROUPS.find(g => g.units.includes(detailDraft.unit))?.id || 'weight') : 'weight';

  const handleAddIngredient = () => {
    const name = newIng.name.trim();
    if (!name) return;
    const id = Math.max(0, ...ingredients.map(i => i.id)) + 1;
    setIngredients(prev => [...prev, { id, name, unit: newIng.unit, cost_per_unit: Number(newIng.cost_per_unit) || 0, starting_stock: Number(newIng.starting_stock) || 0, sales_deducted: 0, taken_deducted: 0, emoji: newIng.emoji }]);
    setShowAddModal(false);
    setShowEmojiPicker(false);
    setNewIng({ name: '', unit: 'Ï║', cost_per_unit: '', starting_stock: '', emoji: '­ƒôª' });
    showSuccess('Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® Ïº┘ä┘à┘â┘ê┘æ┘å Ô£ô');
  };

  const openDetail = (ing) => {
    setDetailIng(ing);
    setDetailDraft({ name: ing.name, unit: ing.unit, cost_per_unit: String(ing.cost_per_unit), emoji: ing.emoji || '­ƒôª' });
    setConfirmDeleteIng(false);
    setShowEmojiPicker(false);
  };

  const handleSaveDetail = () => {
    const name = detailDraft.name.trim();
    if (!name) return;
    setIngredients(prev => prev.map(i => i.id === detailIng.id ? { ...i, name, unit: detailDraft.unit, cost_per_unit: Number(detailDraft.cost_per_unit) || 0, emoji: detailDraft.emoji } : i));
    setDetailIng(null);
    showSuccess('Ï¬┘à Ï¡┘üÏ© Ïº┘äÏ¬Ï║┘è┘èÏ▒ÏºÏ¬ Ô£ô');
  };

  const handleDeleteIngredient = () => {
    setIngredients(prev => prev.filter(i => i.id !== detailIng.id));
    setDetailIng(null);
    showSuccess('Ï¬┘à Ï¡Ï░┘ü Ïº┘ä┘à┘â┘ê┘æ┘å Ô£ô');
  };

  const mappedIngredients = useMemo(() => ingredients.map(ing => ({
    id: ing.id,
    name: ing.name,
    category: 'Ïº┘ä┘à┘â┘ê┘åÏºÏ¬',
    is_active: true,
    qty: getExpectedQty(ing),
    buyPrice: Number(ing.cost_per_unit) || 0,
    sellPrice: Number(ing.cost_per_unit) || 0,
    minAlert: 5,
    emoji: ing.emoji || '­ƒôª',
    unit: ing.unit,
    image: '',
    rawIng: ing
  })), [ingredients]);

  if (showAddModal || detailIng) {
    const isEdit = !!detailIng;
    const draft = isEdit ? detailDraft : newIng;
    const setDraft = isEdit ? setDetailDraft : setNewIng;
    const activeGroup = isEdit ? activeGroupEdit : activeGroupAdd;
    const onSave = isEdit ? handleSaveDetail : handleAddIngredient;
    const onClose = () => { setShowAddModal(false); setDetailIng(null); setShowEmojiPicker(false); };

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#fff', overflowY: 'auto', direction: 'rtl' }}>
        <AppHeader 
          title={isEdit ? "Ï¬Ï╣Ï»┘è┘ä Ïº┘ä┘à┘â┘ê┘æ┘å" : "ÏÑÏÂÏº┘üÏ® ┘à┘â┘ê┘æ┘å"} 
          left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onClose}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>} 
          border 
        />
        <div style={{ padding: '24px 16px', paddingBottom: 100 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ width: 110, height: 110, borderRadius: 24, background: '#fff', border: `2px dashed ${C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <span style={{ fontSize: 48 }}>{draft.emoji}</span>
            </div>
            {!showEmojiPicker && (
              <span style={{ fontSize: 13, color: C.gray, marginTop: 8, fontWeight: 700 }}>Ïº┘å┘éÏ▒ ┘äÏ¬Ï║┘è┘èÏ▒ Ïº┘äÏ▒┘àÏ▓</span>
            )}
          </div>

          {showEmojiPicker && (
            <div style={{ marginBottom: 20, animation: 'fadeIn 0.2s ease' }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8, display: 'block', textAlign: 'right' }}>ÏºÏ«Ï¬Ï▒ Ï▒┘àÏ▓Ïº┘ï ┘ä┘ä┘à┘â┘ê┘æ┘å</label>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, direction: 'rtl', scrollbarWidth: 'none' }}>
                {['­ƒôª', '­ƒÑ½', '­ƒÑø', '­ƒÑ®', '­ƒìö', '­ƒìò', '­ƒìƒ', '­ƒÑñ', 'Ôÿò', '­ƒì░', '­ƒÑÉ', '­ƒìÄ', '­ƒÑò', '­ƒìà', '­ƒºà', '­ƒîÂ´©Å', '­ƒºÇ', '­ƒìù', '­ƒìÜ', '­ƒÑû', '­ƒÑ¬', '­ƒÑù'].map(e => (
                  <button key={e} type="button" onClick={() => { setDraft({ ...draft, emoji: e }); setShowEmojiPicker(false); }} style={{ fontSize: 28, padding: '10px 14px', background: draft.emoji === e ? '#EFF6FF' : '#fff', border: draft.emoji === e ? `2px solid ${C.blue}` : `1px solid ${C.border}`, borderRadius: 16, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>ÏºÏ│┘à Ïº┘ä┘à┘â┘ê┘æ┘å</label>
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="ÏúÏ»Ï«┘ä ÏºÏ│┘à Ïº┘ä┘à┘â┘ê┘æ┘å" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>Ï¬┘â┘ä┘üÏ® Ïº┘ä┘êÏ¡Ï»Ï® (Ï»Ï¼)</label>
                <input type="number" inputMode="decimal" value={draft.cost_per_unit} onChange={e => setDraft({ ...draft, cost_per_unit: e.target.value })} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'block', textAlign: 'right' }}>Ïº┘ä┘àÏ«Ï▓┘ê┘å Ïº┘äÏºÏ¿Ï¬Ï»ÏºÏª┘è</label>
                <input type="number" inputMode="decimal" value={draft.starting_stock === undefined ? '' : draft.starting_stock} onChange={e => setDraft({ ...draft, starting_stock: e.target.value })} style={{ width: '100%', height: 48, padding: '0 12px', borderRadius: 12, border: '2px solid #D1D5DB', fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center', background: '#FAFAFA', boxSizing: 'border-box' }} disabled={isEdit} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8, display: 'block', textAlign: 'right' }}>┘êÏ¡Ï»Ï® Ïº┘ä┘é┘èÏºÏ│ Ïº┘ä┘àÏ╣Ï¬┘àÏ»Ï®</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, background: '#F3F4F6', padding: 4, borderRadius: 12 }}>
              {UNIT_GROUPS.map(g => (
                <button key={g.id} type="button" onClick={() => setDraft({...draft, unit: g.units[0]})} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: activeGroup === g.id ? '#fff' : 'transparent', color: activeGroup === g.id ? C.blue : C.gray, fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: activeGroup === g.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
                  {g.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, animation: 'fadeIn 0.3s ease' }}>
              {UNIT_GROUPS.find(g => g.id === activeGroup).units.map(u => (
                <button key={u} type="button" onClick={() => setDraft({...draft, unit: u})} style={{ padding: '10px', borderRadius: 10, border: draft.unit === u ? `2px solid ${C.blue}` : `1px solid ${C.border}`, background: draft.unit === u ? '#EFF6FF' : '#FAFAFA', color: draft.unit === u ? C.blue : C.dark, fontSize: 15, fontWeight: 800, cursor: 'pointer', flex: '1 0 calc(33.33% - 6px)', transition: 'all 0.2s' }}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          <button onClick={onSave} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.blue, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}><Save size={18} /> {isEdit ? 'Ï¡┘üÏ© Ïº┘äÏ¬Ï║┘è┘èÏ▒ÏºÏ¬' : 'Ï¡┘üÏ© Ïº┘ä┘à┘â┘ê┘æ┘å'}</button>
          
          {isEdit && (
            confirmDeleteIng ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleDeleteIngredient} style={{ flex: 1, padding: '14px', borderRadius: 14, background: C.red, color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Ï¬Ïú┘â┘èÏ» Ïº┘äÏ¡Ï░┘ü</button>
                <button onClick={() => setConfirmDeleteIng(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#f0f0f0', color: C.dark, border: `1px solid ${C.border}`, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeleteIng(true)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#FEF2F2', color: C.red, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Trash2 size={18} /> Ï¡Ï░┘ü Ïº┘ä┘à┘â┘ê┘æ┘å</button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <InventoryScreen 
      products={mappedIngredients}
      categories={['Ïº┘ä┘à┘â┘ê┘åÏºÏ¬']}
      onAddCategory={() => {}}
      onRenameCategory={() => {}}
      onDeleteCategory={() => {}}
      onAddProduct={() => setShowAddModal(true)}
      onEditProduct={(p) => openDetail(p.rawIng)}
    />
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: PRODUCT DETAIL (Ï¬┘üÏºÏÁ┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
export function ProductDetailScreen({ product, products, setProducts, ingredients, productRecipes, setProductRecipes, todaySales, showSuccess, onBack }) {
  const current = products.find(p => p.id === product?.id) || product;
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipeIngId, setRecipeIngId] = useState('');
  const [recipeQty, setRecipeQty] = useState('');
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const recipe = useMemo(() => productRecipes
    .filter(r => r.product_id === current.id)
    .map(r => {
      const ing = ingredients.find(i => i.id === r.ingredient_id);
      return ing ? { ...r, ing, cost: (Number(r.quantity_used) || 0) * (Number(ing.cost_per_unit) || 0) } : null;
    })
    .filter(Boolean), [productRecipes, ingredients, current.id]);

  const totalCost = recipe.reduce((s, r) => s + r.cost, 0);
  const sellPrice = Number(current.sellPrice) || 0;
  const profit = sellPrice - totalCost;
  const margin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
  const marginColor = margin > 40 ? C.green : margin >= 20 ? C.orange : C.red;
  const marginLabel = margin > 40 ? 'ÏÁÏ¡┘è' : margin >= 20 ? '┘à┘åÏ«┘üÏÂ' : 'Ï«ÏÀÏ▒';

  const isBestSeller = useMemo(() => {
    const map = {};
    todaySales.forEach(s => { map[s.productId] = (map[s.productId] || 0) + s.qty; });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return !!top && Number(top[0]) === current.id;
  }, [todaySales, current.id]);

  const catColor = categoryColors[current.category] || categoryColors['ÏúÏ«Ï▒┘ë'];
  const imagePath = current.image || productImageMap[current.id];

  const handleAddRecipeRow = () => {
    const ing = ingredients.find(i => i.id === Number(recipeIngId));
    const qty = Number(recipeQty);
    if (!ing || !qty || qty <= 0) return;
    setProductRecipes(prev => [...prev, { id: Date.now(), product_id: current.id, ingredient_id: ing.id, quantity_used: qty }]);
    setProducts(prev => prev.map(p => p.id === current.id ? { ...p, has_recipe: true } : p));
    setShowAddRecipe(false);
    setRecipeIngId('');
    setRecipeQty('');
    showSuccess('Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® Ïº┘ä┘à┘â┘ê┘æ┘å ┘ä┘ä┘êÏÁ┘üÏ® Ô£ô');
  };

  const handleDeleteRecipeRow = (recipeId) => {
    setProductRecipes(prev => {
      const remaining = prev.filter(r => r.id !== recipeId);
      const productHasIngredients = remaining.some(r => r.product_id === current.id);
      if (!productHasIngredients) {
        setProducts(pPrev => pPrev.map(p => p.id === current.id ? { ...p, has_recipe: false } : p));
      }
      return remaining;
    });
    showSuccess('Ï¬┘à Ï¡Ï░┘ü Ïº┘ä┘à┘â┘ê┘æ┘å ┘à┘å Ïº┘ä┘êÏÁ┘üÏ® Ô£ô');
  };

  const handleSavePrice = () => {
    const price = Number(priceDraft);
    if (!price || price <= 0) return;
    setProducts(prev => prev.map(p => p.id === current.id ? { ...p, sellPrice: price } : p));
    setEditingPrice(false);
    showSuccess('Ï¬┘à Ï¬Ï╣Ï»┘è┘ä Ïº┘äÏ│Ï╣Ï▒ Ô£ô');
  };

  const handleToggleActive = () => {
    setProducts(prev => prev.map(p => p.id === current.id ? { ...p, is_active: !p.is_active } : p));
    showSuccess(current.is_active ? 'Ï¬┘à Ï¬Ï╣ÏÀ┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼ Ô£ô' : 'Ï¬┘à Ï¬┘üÏ╣┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼ Ô£ô');
  };

  const handleDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== current.id));
    showSuccess('Ï¬┘à Ï¡Ï░┘ü Ïº┘ä┘à┘åÏ¬Ï¼ Ô£ô');
    onBack();
  };

  const R = 44;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, margin));

  return (
    <div style={{ paddingBottom: 100, direction: 'rtl' }}>
      <AppHeader
        title={current.name}
        left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
        border
      />

      <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
        <div style={{ width: 110, height: 110, borderRadius: 20, background: catColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
          {imagePath ? (
            <img src={imagePath} alt={current.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span style={{ fontSize: 48 }}>{current.emoji}</span>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{current.name}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: catColor.accent, background: catColor.bg, padding: '4px 14px', borderRadius: 20 }}>{current.category}</span>
          {isBestSeller && <span style={{ fontSize: 12, fontWeight: 800, color: '#92400E', background: '#FEF3C7', padding: '4px 14px', borderRadius: 20 }}>Ô¡É Ïº┘äÏú┘âÏ½Ï▒ ┘àÏ¿┘èÏ╣Ïº┘ï</span>}
          {!current.is_active && <span style={{ fontSize: 12, fontWeight: 800, color: C.gray, background: '#F3F4F6', padding: '4px 14px', borderRadius: 20 }}>┘àÏ╣ÏÀ┘ä</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 16px' }}>
        {[
          { label: 'Ïº┘äÏ¬┘â┘ä┘üÏ® Ïº┘äÏÑÏ¼┘àÏº┘ä┘èÏ®', value: totalCost, color: C.orange },
          { label: 'Ï│Ï╣Ï▒ Ïº┘äÏ¿┘èÏ╣', value: sellPrice, color: C.blue },
          { label: 'Ïº┘äÏ▒Ï¿Ï¡', value: profit, color: profit >= 0 ? C.green : C.red },
        ].map((box, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 8px', boxShadow: C.shadow, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>{box.label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: box.color }}>{fmt(Math.round(box.value))} <span style={{ fontSize: 10 }}>Ï»Ï¼</span></div>
          </div>
        ))}
      </div>

      <div style={{ margin: '8px 16px', background: '#fff', borderRadius: C.radius, padding: '18px 16px', boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>┘êÏÁ┘üÏ® Ïº┘ä┘à┘åÏ¬Ï¼</h3>
          <button onClick={() => setShowAddRecipe(true)} style={{ padding: '8px 14px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>ÏÑÏÂÏº┘üÏ® ┘à┘â┘ê┘æ┘å +</button>
        </div>
        {recipe.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.gray, fontSize: 13, padding: '16px 0' }}>┘äÏº Ï¬┘êÏ¼Ï» ┘à┘â┘ê┘æ┘åÏºÏ¬ ┘ü┘è Ïº┘ä┘êÏÁ┘üÏ® Ï¿Ï╣Ï»</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 0.8fr 0.6fr', padding: '6px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
              {['Ïº┘ä┘à┘â┘ê┘æ┘å', 'Ïº┘ä┘â┘à┘èÏ®', 'Ïº┘äÏ¬┘â┘ä┘üÏ®', '%', ''].map((h, idx) => <span key={idx} style={{ fontSize: 11, color: C.gray, fontWeight: 700 }}>{h}</span>)}
            </div>
            {recipe.map(r => (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 0.8fr 0.6fr', padding: '10px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{r.ing.name}</span>
                <span style={{ fontSize: 12, color: C.gray }}>{fmt(r.quantity_used)} {r.ing.unit}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>{fmt(Math.round(r.cost))} Ï»Ï¼</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.blue }}>{totalCost > 0 ? Math.round((r.cost / totalCost) * 100) : 0}%</span>
                <button onClick={() => handleDeleteRecipeRow(r.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                  <Trash2 size={16} color={C.red} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ margin: '8px 16px', background: '#fff', borderRadius: C.radius, padding: '20px 16px', boxShadow: C.shadow, textAlign: 'center' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 14 }}>┘çÏº┘àÏ┤ Ïº┘äÏ▒Ï¿Ï¡</h3>
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r={R} fill="none" stroke="#F0F0F0" strokeWidth="10" />
            <circle cx="60" cy="60" r={R} fill="none" stroke={marginColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: marginColor }}>{Math.round(margin)}%</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color: marginColor }}>{marginLabel}</div>
      </div>

      <div style={{ margin: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {editingPrice ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: '12px', boxShadow: C.shadow, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" inputMode="decimal" value={priceDraft} onChange={e => setPriceDraft(e.target.value)} autoFocus placeholder="Ïº┘äÏ│Ï╣Ï▒ Ïº┘äÏ¼Ï»┘èÏ»" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 800, outline: 'none', textAlign: 'center', boxSizing: 'border-box', minWidth: 0 }} />
            <button onClick={handleSavePrice} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: C.green, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Ï¡┘üÏ©</button>
            <button onClick={() => setEditingPrice(false)} style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
          </div>
        ) : (
          <button onClick={() => { setPriceDraft(String(sellPrice)); setEditingPrice(true); }} style={{ width: '100%', padding: '14px', borderRadius: 14, border: `1.5px solid ${C.blue}`, background: '#fff', color: C.blue, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Pencil size={16} /> Ï¬Ï╣Ï»┘è┘ä Ïº┘äÏ│Ï╣Ï▒</button>
        )}
        <button onClick={handleToggleActive} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: current.is_active ? '#F3F4F6' : C.green, color: current.is_active ? C.dark : '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Power size={16} /> {current.is_active ? 'Ï¬Ï╣ÏÀ┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼' : 'Ï¬┘üÏ╣┘è┘ä Ïº┘ä┘à┘åÏ¬Ï¼'}</button>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleDelete} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: C.red, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Ï¬Ïú┘â┘èÏ» Ïº┘äÏ¡Ï░┘ü</button>
            <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#FEE2E2', color: C.red, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Trash2 size={16} /> Ï¡Ï░┘ü Ïº┘ä┘à┘åÏ¬Ï¼</button>
        )}
      </div>

      {showAddRecipe && (
        <ModalCard title="ÏÑÏÂÏº┘üÏ® ┘à┘â┘ê┘æ┘å ┘ä┘ä┘êÏÁ┘üÏ®" onClose={() => setShowAddRecipe(false)}>
          <label style={modalLabelStyle}>Ïº┘ä┘à┘â┘ê┘æ┘å</label>
          <select value={recipeIngId} onChange={e => setRecipeIngId(e.target.value)} style={{ ...modalInputStyle, marginBottom: 12 }}>
            <option value="">ÏºÏ«Ï¬Ï▒ Ïº┘ä┘à┘â┘ê┘æ┘å...</option>
            {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
          </select>
          <label style={modalLabelStyle}>Ïº┘ä┘â┘à┘èÏ® ┘ä┘â┘ä ┘êÏ¡Ï»Ï® ┘àÏ¿ÏºÏ╣Ï®</label>
          <input type="number" inputMode="decimal" value={recipeQty} onChange={e => setRecipeQty(e.target.value)} placeholder="0" style={{ ...modalInputStyle, marginBottom: 16 }} />
          <button onClick={handleAddRecipeRow} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Ï¬Ïú┘â┘èÏ»</button>
        </ModalCard>
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: MORE (Ïº┘ä┘àÏ▓┘èÏ»)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
export function MoreScreen({ onOpenReports, onOpenPage }) {
  const groups = [
    {
      title: 'Ïº┘ä┘àÏº┘ä┘èÏ®',
      items: [
        { label: 'Ïº┘äÏ»┘è┘ê┘å', icon: Wallet, color: C.red, bg: '#FEE2E2', action: () => onOpenPage('Ïº┘äÏ»┘è┘ê┘å') },
        { label: 'Ïº┘ä┘àÏÁÏºÏ▒┘è┘ü', icon: Receipt, color: C.orange, bg: '#FFF7ED', action: () => onOpenPage('Ïº┘ä┘àÏÁÏºÏ▒┘è┘ü') },
      ],
    },
    {
      title: 'Ïº┘äÏÑÏ»ÏºÏ▒Ï®',
      items: [
        { label: 'Ïº┘äÏ╣┘à┘äÏºÏí', icon: Users, color: C.blue, bg: '#EFF6FF', action: () => onOpenPage('Ïº┘äÏ╣┘à┘äÏºÏí') },
        { label: 'Ïº┘ä┘à┘êÏ▒Ï»┘ê┘å', icon: Truck, color: C.orange, bg: '#FFF7ED', action: () => onOpenPage('Ïº┘ä┘à┘êÏ▒Ï»┘ê┘å') },
        { label: 'Ïº┘äÏ¬┘éÏºÏ▒┘èÏ▒', icon: BarChart3, color: C.green, bg: '#F0FDF4', action: () => onOpenReports() },
      ],
    },
    {
      title: 'Ïº┘ä┘åÏ©Ïº┘à',
      items: [
        { label: 'Ïº┘äÏÑÏ╣Ï»ÏºÏ»ÏºÏ¬', icon: Settings, color: C.dark, bg: '#F3F4F6', action: () => onOpenPage('Ïº┘äÏÑÏ╣Ï»ÏºÏ»ÏºÏ¬') },
        { label: 'Ïº┘äÏ»Ï╣┘à', icon: HelpCircle, color: C.blue, bg: '#EFF6FF', action: () => onOpenPage('Ïº┘äÏ»Ï╣┘à') },
        { label: 'Ï»Ï▒┘êÏ│ Ï¬Ï╣┘ä┘è┘à┘èÏ®', icon: BookOpen, color: C.green, bg: '#F0FDF4', action: () => onOpenPage('Ï»Ï▒┘êÏ│ Ï¬Ï╣┘ä┘è┘à┘èÏ®') },
      ],
    },
  ];

  return (
    <div style={{ paddingBottom: 100, direction: 'rtl', minHeight: '100vh', background: C.bg }}>
      <AppHeader title="Ïº┘ä┘àÏ▓┘èÏ»" />
      {groups.map(group => (
        <div key={group.title} style={{ padding: '8px 16px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.gray, marginBottom: 10, textAlign: 'right' }}>{group.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {group.items.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={item.action} style={{ background: '#fff', borderRadius: C.radius, border: 'none', padding: '18px 8px', boxShadow: C.shadow, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={item.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   RECEIPT MODAL (Ïº┘ä┘üÏºÏ¬┘êÏ▒Ï®)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
const Dashed = () => <div style={{ borderTop: '2px dashed #E5E7EB', margin: '14px 0' }} />;

export function ReceiptModal({ receipt, shopName, onClose }) {
  if (!receipt) return null;
  const items = receipt.items || [];
  const itemTotal = (it) => it.total ?? (Number(it.qty) || 0) * (Number(it.price) || 0);

  const shareWhatsApp = () => {
    let text = `­ƒº¥ ┘üÏºÏ¬┘êÏ▒Ï® - ${shopName}\n`;
    text += `­ƒôà ${receipt.dateText} ${receipt.timeText}\n`;
    text += `Ï▒┘é┘à: ${receipt.number}\n`;
    text += `ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ\n`;
    items.forEach(it => { text += `${it.name} ├ù ${it.qty} = ${fmt(itemTotal(it))} DA\n`; });
    text += `ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ\n`;
    text += `­ƒÆ░ Ïº┘ä┘àÏ¼┘à┘êÏ╣: ${fmt(receipt.total)} DA\n`;
    text += `Ï┤┘âÏ▒Ïº┘ï ┘äÏ▓┘èÏºÏ▒Ï¬┘â┘à`;
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
  };

  return (
    <>
      {/* Dark Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, animation: 'fadeIn 0.2s ease' }} />
      
      {/* Centered Receipt Card Container */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 301, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', direction: 'rtl', paddingBottom: 60 }}>
        
        {/* The White Ticket */}
        <div style={{ position: 'relative', width: 'min(340px, 92vw)', background: '#fff', borderRadius: 24, padding: '48px 24px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', pointerEvents: 'auto' }}>
          
          {/* Logo Circle Overlapping */}
          <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 60, height: 60, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
             <span style={{ fontSize: 24, fontWeight: 900, color: C.blue }}>{shopName.charAt(0)}</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: C.dark, textAlign: 'center', marginBottom: 16 }}>{shopName}</h2>
          <Dashed />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.gray, marginTop: 12 }}>
            <span>Ïº┘äÏ¬ÏºÏ▒┘èÏ«</span>
            <span style={{ color: C.dark, fontWeight: 700, direction: 'ltr' }}>{receipt.dateText} {receipt.timeText}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.gray, marginTop: 6 }}>
            <span>Ï▒┘é┘à Ïº┘ä┘üÏºÏ¬┘êÏ▒Ï®</span>
            <span style={{ color: C.dark, fontWeight: 700 }}>{receipt.number}</span>
          </div>

          <Dashed />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr', padding: '4px 0 8px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.gray, fontWeight: 800, textAlign: 'right' }}>Ïº┘ä┘à┘åÏ¬Ï¼</span>
            <span style={{ fontSize: 12, color: C.gray, fontWeight: 800, textAlign: 'center' }}>Ïº┘ä┘â┘à┘èÏ®</span>
            <span style={{ fontSize: 12, color: C.gray, fontWeight: 800, textAlign: 'center' }}>Ïº┘äÏ│Ï╣Ï▒</span>
            <span style={{ fontSize: 12, color: C.gray, fontWeight: 800, textAlign: 'left' }}>Ïº┘ä┘àÏ¼┘à┘êÏ╣</span>
          </div>

          <div style={{ maxHeight: '30vh', overflowY: 'auto', paddingRight: 4 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr', padding: '12px 0', borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.dark, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</span>
                <span style={{ fontSize: 13, color: C.dark, textAlign: 'center', fontWeight: 600 }}>{it.qty}</span>
                <span style={{ fontSize: 12, color: C.gray, textAlign: 'center', direction: 'ltr' }}>{fmt(it.price)}</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: C.dark, textAlign: 'left', direction: 'ltr' }}>{fmt(itemTotal(it))}</span>
              </div>
            ))}
          </div>

          <Dashed />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.gray, alignItems: 'center' }}>
            <span>Ïº┘ä┘àÏ¼┘à┘êÏ╣ Ïº┘ä┘üÏ▒Ï╣┘è</span>
            <span style={{ color: C.dark, fontWeight: 700, direction: 'ltr' }}>{fmt(receipt.total)} DA</span>
          </div>
          
          <div style={{ borderTop: `2px solid ${C.dark}`, margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, alignItems: 'center' }}>
            <span style={{ color: C.dark }}>Ïº┘äÏÑÏ¼┘àÏº┘ä┘è</span>
            <span style={{ color: C.dark, direction: 'ltr' }}>{fmt(receipt.total)} DA</span>
          </div>

          <Dashed />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 8 }}>
            <span style={{ color: C.gray }}>ÏÀÏ▒┘è┘éÏ® Ïº┘äÏ»┘üÏ╣</span>
            <span style={{ fontWeight: 800, color: C.dark }}>{receipt.paymentMethod || '┘âÏºÏ┤ (┘å┘éÏ»Ïº┘ï)'}</span>
          </div>
          
          <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 14, fontWeight: 600, color: C.gray, marginTop: 24 }}>Ï┤┘âÏ▒Ïº┘ï ┘äÏ¬Ï│┘ê┘é┘â┘à ┘àÏ╣┘åÏº!</div>
        </div>
      </div>

      {/* The Bottom Actions Panel */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 24px 32px', zIndex: 302, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)', animation: 'slideUp 0.3s ease', direction: 'rtl' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button onClick={() => window.print()} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Printer size={22} color={C.blue} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>ÏÀÏ¿ÏºÏ╣Ï®</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button onClick={shareWhatsApp} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Share2 size={22} color={C.blue} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>┘àÏ┤ÏºÏ▒┘âÏ®</span>
        </div>
        
        <button onClick={onClose} style={{ flex: 1, marginRight: 12, height: 56, borderRadius: 16, border: 'none', background: C.blue, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
          <Check size={20} strokeWidth={3} /> Ï¬┘à (ÏÑÏ║┘äÏº┘é)
        </button>

      </div>
    </>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: EXPENSES (Ïº┘ä┘àÏÁÏºÏ▒┘è┘ü)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
const EXPENSE_CATEGORIES = [
  { id: 'rent', label: 'Ïº┘ä┘âÏ▒ÏºÏí', icon: '­ƒÅá' },
  { id: 'salary', label: 'Ïº┘äÏ▒┘êÏºÏ¬Ï¿', icon: '­ƒæÑ' },
  { id: 'bills', label: 'Ïº┘ä┘ü┘êÏºÏ¬┘èÏ▒', icon: 'ÔÜí' },
  { id: 'transport', label: 'Ïº┘ä┘å┘é┘ä', icon: '­ƒÜÜ' },
  { id: 'supplies', label: 'Ïº┘ä┘ä┘êÏºÏ▓┘à', icon: '­ƒøÆ' },
  { id: 'maintenance', label: 'Ïº┘äÏÁ┘èÏº┘åÏ®', icon: '­ƒöº' },
  { id: 'other', label: 'ÏúÏ«Ï▒┘ë', icon: '­ƒÆ¼' },
];

function ExpensesScreen({ expenses, setExpenses, cyclicExpenses = [], setCyclicExpenses, showSuccess, onBack }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isCyclic, setIsCyclic] = useState(false);
  const [cycleNumber, setCycleNumber] = useState('1');
  const [cycleUnit, setCycleUnit] = useState('Ï┤┘çÏ▒');

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(e => Number(e.amount) || 0)) : 0;

  const handleAdd = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !category) return;
    const newExpense = {
      id: Date.now(),
      category,
      amount: amt,
      description: description.trim(),
      date: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowAddModal(false);
    setCategory('');
    setAmount('');
    setDescription('');
    showSuccess('Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® Ïº┘ä┘àÏÁÏ▒┘ê┘ü Ô£ô');
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showSuccess('Ï¬┘à Ï¡Ï░┘ü Ïº┘ä┘àÏÁÏ▒┘ê┘ü Ô£ô');
  };

  const stats = [
    { label: 'Ïº┘ä┘àÏÁÏ▒┘ê┘üÏºÏ¬', value: expenses.length, color: C.orange, bg: '#FFF7ED', icon: <Receipt size={20} color={C.orange} /> },
    { label: 'Ïº┘ä┘àÏ¬┘êÏ│ÏÀ', value: `${fmt(Math.round(avgExpense))} DA`, color: C.blue, bg: '#EFF6FF', icon: <BarChart3 size={20} color={C.blue} /> },
    { label: 'Ïº┘äÏúÏ╣┘ä┘ë', value: `${fmt(maxExpense)} DA`, color: C.green, bg: '#F0FDF4', icon: <TrendingUp size={20} color={C.green} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl' }}>
      <div style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', padding: '20px 20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color="#fff" /></HeaderIconButton>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Ïº┘ä┘àÏÁÏºÏ▒┘è┘ü</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div style={{ margin: '-12px 16px 0', background: 'linear-gradient(135deg, #EF4444, #DC2626)', borderRadius: 20, padding: '20px', color: '#fff', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏÁÏºÏ▒┘è┘ü</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{fmt(totalExpenses)} <span style={{ fontSize: 16 }}>DA</span></div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{expenses.length}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>┘àÏÁÏ▒┘ê┘ü</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 16px 8px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 8px', boxShadow: C.shadow, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 16px' }}>
        {allExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>­ƒôï</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.dark, marginBottom: 6 }}>┘äÏº Ï¬┘êÏ¼Ï» ┘àÏÁÏºÏ▒┘è┘ü</div>
            <div style={{ fontSize: 14, color: C.gray, marginBottom: 20 }}>Ï│Ï¼┘æ┘ä ┘àÏÁÏºÏ▒┘è┘ü┘â ┘êÏ¬┘âÏº┘ä┘è┘ü┘â</div>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '12px 32px', borderRadius: 14, background: `linear-gradient(135deg, #3B82F6, #2563EB)`, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑÏÂÏº┘üÏ® ┘àÏÁÏ▒┘ê┘ü</button>
          </div>
        ) : (
          allExpenses.map(exp => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
            return (
              <div key={exp.id} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat?.icon || '­ƒôª'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, display: 'flex', alignItems: 'center', gap: 6 }}>
    {cat?.label || exp.category}
    {exp.isCyclic && <span style={{ fontSize: 10, background: C.blue, color: '#fff', padding: '2px 6px', borderRadius: 6 }}>Ï»┘êÏ▒┘è ({exp.cycleNumber} {exp.cycleUnit})</span>}
  </div>
                    {exp.description && <div style={{ fontSize: 12, color: C.gray, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</div>}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.red }}>{fmt(exp.amount)} DA</div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{new Date(exp.date).toLocaleDateString('ar-DZ')}</div>
                  </div>
                  <button onClick={() => handleDelete(exp.id, exp.isCyclic)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={14} color={C.red} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={() => setShowAddModal(true)} style={{ position: 'fixed', bottom: 30, right: 'calc(50% - 175px)', width: 56, height: 56, borderRadius: '50%', background: '#EF4444', color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
        <Plus size={26} />
      </button>

      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 220, animation: 'fadeInBg 0.2s ease' }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, maxHeight: '85vh', background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 221, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setShowAddModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color={C.dark} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>┘àÏÁÏ▒┘ê┘ü Ï¼Ï»┘èÏ»</h2>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘üÏªÏ® *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EXPENSE_CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '8px 14px', borderRadius: 12, border: category === c.id ? 'none' : `1px solid ${C.border}`, background: category === c.id ? C.blue : '#fff', color: category === c.id ? '#fff' : C.dark, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘àÏ¿┘äÏ║ *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA', height: 48 }}>
                  <Wallet size={18} color={C.gray} />
                  <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontWeight: 700, background: 'transparent', textAlign: 'left', direction: 'ltr' }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘êÏÁ┘ü (ÏºÏ«Ï¬┘èÏºÏ▒┘è)</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="┘êÏÁ┘ü Ïº┘ä┘àÏÁÏ▒┘ê┘ü..." style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#EF4444', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={18} /> ÏÑÏÂÏº┘üÏ®</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: CLIENTS (Ïº┘äÏ╣┘à┘äÏºÏí)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ClientsScreen({ clients, setClients, debts, todaySales, products, showSuccess, onBack, onOpenClient }) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = useMemo(() => {
    if (!search) return clients;
    return clients.filter(c => c.name.includes(search) || (c.phone || '').includes(search));
  }, [clients, search]);

  const totalSpent = useMemo(() => {
    return clients.reduce((sum, c) => {
      const clientDebts = Array.isArray(debts) ? debts.filter(d => d.clientId === c.id) : [];
      return sum + clientDebts.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    }, 0);
  }, [clients, debts]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const newClient = {
      id: Date.now(),
      name,
      phone: newPhone.trim(),
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, newClient]);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    showSuccess('Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® Ïº┘äÏ╣┘à┘è┘ä Ô£ô');
  };

  const getClientStats = (clientId) => {
    const clientDebts = Array.isArray(debts) ? debts.filter(d => d.clientId === clientId) : [];
    const total = clientDebts.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    return { visits: clientDebts.length, total };
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl' }}>
      <div style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', padding: '20px 20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color="#fff" /></HeaderIconButton>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Ïº┘äÏ╣┘à┘äÏºÏí</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
          <Search size={18} color={C.gray} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ï¿Ï¡Ï½ Ï╣┘å Ï╣┘à┘è┘ä..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent', textAlign: 'right', direction: 'rtl' }} />
        </div>
      </div>

      <div style={{ margin: '0 16px', background: '#fff', borderRadius: 16, padding: '16px', boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color={C.blue} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: C.gray }}>Ïº┘äÏ╣┘à┘äÏºÏí</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{clients.length}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{clients.length}</div>
            <div style={{ fontSize: 11, color: C.gray }}>┘åÏ┤ÏÀ</div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{debts?.length || 0}</div>
            <div style={{ fontSize: 11, color: C.gray }}>Ïº┘äÏ▓┘èÏºÏ▒ÏºÏ¬</div>
          </div>
        </div>
        <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '12px' }}>
          <div style={{ fontSize: 12, color: C.gray }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ»┘ü┘êÏ╣</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.blue }}>{fmt(totalSpent)} DA</div>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.gray }}>
            {clients.length === 0 ? '┘äÏº ┘è┘êÏ¼Ï» Ï╣┘à┘äÏºÏí Ï¿Ï╣Ï»' : '┘äÏº Ï¬┘êÏ¼Ï» ┘åÏ¬ÏºÏªÏ¼'}
          </div>
        ) : filtered.map(c => {
          const stats = getClientStats(c.id);
          return (
            <div key={c.id} onClick={() => onOpenClient(c.id)} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, boxShadow: C.shadow, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.blue, flexShrink: 0 }}>{c.name.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{c.name}</div>
                {c.phone && <div style={{ fontSize: 12, color: C.gray, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>­ƒô× {c.phone}</div>}
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: C.gray, display: 'flex', alignItems: 'center', gap: 3 }}>­ƒôà {stats.visits} Ï▓┘èÏºÏ▒Ï®</span>
                  <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>­ƒÆ░ {fmt(stats.total)} DA</span>
                </div>
              </div>
              <ChevronLeft size={18} color={C.gray} />
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowAddModal(true)} style={{ position: 'fixed', bottom: 30, right: 'calc(50% - 175px)', width: 56, height: 56, borderRadius: '50%', background: C.blue, color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
        <Plus size={26} />
      </button>

      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 220, animation: 'fadeInBg 0.2s ease' }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 221, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setShowAddModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color={C.dark} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Ï╣┘à┘è┘ä Ï¼Ï»┘èÏ»</h2>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>ÏºÏ│┘à Ïº┘äÏ╣┘à┘è┘ä *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="ÏúÏ»Ï«┘ä ÏºÏ│┘à Ïº┘äÏ╣┘à┘è┘ä" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ï▒┘é┘à Ïº┘ä┘çÏºÏ¬┘ü (ÏºÏ«Ï¬┘èÏºÏ▒┘è)</label>
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="0555555555" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'ltr', background: '#FAFAFA', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: C.blue, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={18} /> ÏÑÏÂÏº┘üÏ®</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: CLIENT DETAIL (Ï¬┘üÏºÏÁ┘è┘ä Ïº┘äÏ╣┘à┘è┘ä)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function ClientDetailScreen({ client, setClients, debts, setDebts, expenses, todaySales, products, showSuccess, onBack }) {
  const [tab, setTab] = useState('debts');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editPhone, setEditPhone] = useState(client.phone || '');

  const clientDebts = useMemo(() => Array.isArray(debts) ? debts.filter(d => d.clientId === client.id) : [], [debts, client.id]);
  const totalSpent = clientDebts.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const visits = clientDebts.length;
  const avgBasket = visits > 0 ? totalSpent / visits : 0;

  const handleSaveEdit = () => {
    const name = editName.trim();
    if (!name) return;
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, name, phone: editPhone.trim() } : c));
    setEditing(false);
    showSuccess('Ï¬┘à Ï¬Ï¡Ï»┘èÏ½ Ï¿┘èÏº┘åÏºÏ¬ Ïº┘äÏ╣┘à┘è┘ä Ô£ô');
  };

  const handleCall = () => {
    if (client.phone) window.open(`tel:${client.phone}`);
  };

  const handleWhatsApp = () => {
    if (client.phone) window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`);
  };

  const handlePayDebt = (debtId, amount) => {
    setDebts(prev => prev.map(d => d.id === debtId ? { ...d, paid: (Number(d.paid) || 0) + amount, status: (Number(d.paid || 0) + amount) >= Number(d.amount) ? 'paid' : 'partial' } : d));
    showSuccess('Ï¬┘à Ï¬Ï│Ï¼┘è┘ä Ïº┘äÏ»┘üÏ╣ Ô£ô');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl' }}>
      <div style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', padding: '20px 20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color="#fff" /></HeaderIconButton>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Ïº┘äÏ╣┘à┘è┘ä</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div style={{ margin: '-12px 16px 0', background: '#fff', borderRadius: 20, padding: '24px 20px', boxShadow: C.shadow, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28, fontWeight: 800, color: '#fff' }}>{client.name.charAt(0)}</div>
        {editing ? (
          <div style={{ marginBottom: 12 }}>
            <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8, boxSizing: 'border-box' }} />
            <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Ïº┘ä┘çÏºÏ¬┘ü" style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, textAlign: 'center', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleSaveEdit} style={{ flex: 1, padding: '8px', borderRadius: 10, background: C.green, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Ï¡┘üÏ©</button>
              <button onClick={() => { setEditing(false); setEditName(client.name); setEditPhone(client.phone || ''); }} style={{ flex: 1, padding: '8px', borderRadius: 10, background: '#F3F4F6', color: C.dark, border: 'none', fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{client.name}</div>
            {client.phone && <div style={{ fontSize: 14, color: C.gray, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>­ƒô× {client.phone}</div>}
          </>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center' }}>
          <button onClick={handleCall} style={{ flex: 1, maxWidth: 140, padding: '10px', borderRadius: 12, background: C.blue, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Phone size={16} /> ÏºÏ¬ÏÁÏº┘ä</button>
          <button onClick={handleWhatsApp} style={{ flex: 1, maxWidth: 140, padding: '10px', borderRadius: 12, background: C.green, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>WhatsApp</button>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ marginTop: 8, padding: '8px 20px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fff', color: C.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><Pencil size={14} style={{ display: 'inline', marginLeft: 4 }} /> Ï¬Ï╣Ï»┘è┘ä</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 16px 8px' }}>
        {[
          { label: 'ÏÑÏ¼┘àÏº┘ä┘è Ïº┘ä┘àÏ»┘ü┘êÏ╣', value: `${fmt(totalSpent)} DA`, icon: <Wallet size={18} color={C.green} />, bg: '#F0FDF4' },
          { label: 'Ïº┘äÏ▓┘èÏºÏ▒ÏºÏ¬', value: visits, icon: <Users size={18} color={C.blue} />, bg: '#EFF6FF' },
          { label: '┘àÏ¬┘êÏ│ÏÀ Ïº┘äÏ│┘äÏ®', value: `${fmt(Math.round(avgBasket))} DA`, icon: <ShoppingCart size={18} color={C.orange} />, bg: '#FFF7ED' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 8px', boxShadow: C.shadow, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.gray, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        <button onClick={() => setTab('debts')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: tab === 'debts' ? C.blue : '#F3F4F6', color: tab === 'debts' ? '#fff' : C.dark, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Wallet size={16} /> Ïº┘äÏ»┘è┘ê┘å
        </button>
        <button onClick={() => setTab('purchases')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: tab === 'purchases' ? C.blue : '#F3F4F6', color: tab === 'purchases' ? '#fff' : C.dark, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Receipt size={16} /> Ïº┘ä┘àÏ┤Ï¬Ï▒┘èÏºÏ¬
        </button>
      </div>

      <div style={{ padding: '0 16px 100px' }}>
        {tab === 'debts' ? (
          clientDebts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: C.gray }}>
              <Check size={40} color={C.green} style={{ margin: '0 auto 12px', display: 'block' }} />
              ┘äÏº Ï¬┘êÏ¼Ï» Ï»┘è┘ê┘å ┘àÏ│Ï¬Ï¡┘éÏ®
            </div>
          ) : clientDebts.map(d => {
            const remaining = (Number(d.amount) || 0) - (Number(d.paid) || 0);
            return (
              <div key={d.id} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{fmt(d.amount)} DA</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: d.status === 'paid' ? '#F0FDF4' : d.status === 'partial' ? '#FFF7ED' : '#FEF2F2', color: d.status === 'paid' ? C.green : d.status === 'partial' ? C.orange : C.red }}>{d.status === 'paid' ? '┘àÏ»┘ü┘êÏ╣' : d.status === 'partial' ? 'Ï¼Ï▓Ïª┘è' : '┘é┘èÏ» Ïº┘äÏº┘åÏ¬Ï©ÏºÏ▒'}</span>
                </div>
                {d.note && <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>{d.note}</div>}
                {remaining > 0 && (
                  <button onClick={() => handlePayDebt(d.id, remaining)} style={{ width: '100%', padding: '8px', borderRadius: 10, background: C.green, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Ï»┘üÏ╣ {fmt(remaining)} DA</button>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.gray }}>┘äÏº Ï¬┘êÏ¼Ï» ┘àÏ┤Ï¬Ï▒┘èÏºÏ¬ ┘àÏ│Ï¼┘äÏ®</div>
        )}
      </div>
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   SCREEN: DEBTS (Ïº┘äÏ»┘è┘ê┘å)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
function DebtsScreen({ debts, setDebts, clients, setClients, showSuccess, onBack }) {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtNote, setDebtNote] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [payingDebtId, setPayingDebtId] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const safeDebts = Array.isArray(debts) ? debts : [];

  const totalUnpaid = useMemo(() => safeDebts.reduce((s, d) => {
    const remaining = (Number(d.amount) || 0) - (Number(d.paid) || 0);
    return s + (d.status !== 'paid' ? remaining : 0);
  }, 0), [safeDebts]);

  const paidTotal = useMemo(() => safeDebts.reduce((s, d) => s + (Number(d.paid) || 0), 0), [safeDebts]);
  const pendingCount = safeDebts.filter(d => d.status === 'pending' || (!d.status && !(Number(d.paid) > 0))).length;
  const partialCount = safeDebts.filter(d => d.status === 'partial').length;
  const paidCount = safeDebts.filter(d => d.status === 'paid').length;
  const activeCount = safeDebts.filter(d => d.status !== 'paid').length;

  const filtered = useMemo(() => {
    if (filter === 'all') return safeDebts.filter(d => d.status !== 'paid');
    return safeDebts.filter(d => d.status === filter);
  }, [safeDebts, filter]);

  const selectedClient = clients.find(c => c.id === Number(selectedClientId));

  const handleAdd = () => {
    const amt = Number(debtAmount);
    if (!amt || amt <= 0 || !selectedClientId) return;
    const newDebt = {
      id: Date.now(),
      clientId: Number(selectedClientId),
      clientName: selectedClient?.name || 'Ï▓Ï¿┘ê┘å',
      amount: amt,
      paid: 0,
      status: 'pending',
      note: debtNote.trim(),
      date: new Date().toISOString(),
    };
    setDebts(prev => [...prev, newDebt]);
    setShowAddModal(false);
    setSelectedClientId('');
    setDebtAmount('');
    setDebtNote('');
    showSuccess('Ï¬┘àÏ¬ ÏÑÏÂÏº┘üÏ® Ïº┘äÏ»┘è┘å Ô£ô');
  };

  const handlePayDebt = (debtId, payAmount) => {
    setDebts(prev => prev.map(d => {
      if (d.id !== debtId) return d;
      const newPaid = (Number(d.paid) || 0) + payAmount;
      return { ...d, paid: newPaid, status: newPaid >= Number(d.amount) ? 'paid' : 'partial' };
    }));
    showSuccess('Ï¬┘à Ï¬Ï│Ï¼┘è┘ä Ïº┘äÏ»┘üÏ╣ Ô£ô');
  };

  const handleDeleteDebt = (debtId) => {
    setDebts(prev => prev.filter(d => d.id !== debtId));
    showSuccess('Ï¬┘à Ï¡Ï░┘ü Ïº┘äÏ»┘è┘å Ô£ô');
  };

  const stats = [
    { label: '┘àÏ»┘ü┘êÏ╣', value: `${fmt(paidTotal)} DA`, color: C.green, bg: '#F0FDF4', icon: <Check size={20} color={C.green} /> },
    { label: 'Ï¼Ï▓Ïª┘è', value: partialCount, color: C.orange, bg: '#FFF7ED', icon: <User size={20} color={C.orange} /> },
    { label: '┘é┘èÏ» Ïº┘äÏº┘åÏ¬Ï©ÏºÏ▒', value: pendingCount, color: C.red, bg: '#FEF2F2', icon: <Clock size={20} color={C.red} /> },
  ];

  const filters = [
    { id: 'all', label: 'Ïº┘ä┘â┘ä', count: activeCount },
    { id: 'pending', label: '┘é┘èÏ» Ïº┘äÏº┘åÏ¬Ï©ÏºÏ▒', count: pendingCount },
    { id: 'partial', label: 'Ï¼Ï▓Ïª┘è', count: partialCount },
    { id: 'paid', label: '┘àÏ»┘ü┘êÏ╣', count: paidCount },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl' }}>
      <div style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', padding: '20px 20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color="#fff" /></HeaderIconButton>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Ïº┘äÏ»┘è┘ê┘å</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div style={{ margin: '-12px 16px 0', background: 'linear-gradient(135deg, #60A5FA, #2563EB)', borderRadius: 20, padding: '20px', color: '#fff', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>ÏÑÏ¼┘àÏº┘ä┘è Ï║┘èÏ▒ Ïº┘ä┘àÏ»┘ü┘êÏ╣</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{fmt(totalUnpaid)} <span style={{ fontSize: 16 }}>DA</span></div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>ÏÑÏ¼┘àÏº┘ä┘è Ïº┘äÏ»┘è┘ê┘å: {fmt(safeDebts.reduce((s, d) => s + (Number(d.amount) || 0), 0))} DA</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{activeCount}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Ï»┘è┘ê┘å ┘åÏ┤ÏÀÏ®</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 16px 8px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 8px', boxShadow: C.shadow, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '8px 16px', overflowX: 'auto', direction: 'rtl' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '8px 16px', borderRadius: 24, fontSize: 13, fontWeight: 600, border: filter === f.id ? 'none' : `1px solid ${C.border}`, background: filter === f.id ? C.blue : '#fff', color: filter === f.id ? '#fff' : C.dark, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            {f.label} <span style={{ background: filter === f.id ? 'rgba(255,255,255,0.3)' : '#F3F4F6', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '8px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>­ƒñØ</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gray }}>┘äÏº Ï¬┘êÏ¼Ï» Ï»┘è┘ê┘å</div>
          </div>
        ) : filtered.map(d => {
          const remaining = (Number(d.amount) || 0) - (Number(d.paid) || 0);
          const client = clients.find(c => c.id === d.clientId);
          return (
            <div key={d.id} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: C.blue, flexShrink: 0 }}>{(d.clientName || 'Ï▓').charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{d.clientName || 'Ï▓Ï¿┘ê┘å'}</div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>┘à┘åÏ░ {getDaysAgo(d.date)} Ïú┘èÏº┘à</div>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: d.status === 'paid' ? '#F0FDF4' : d.status === 'partial' ? '#FFF7ED' : '#FEF2F2', color: d.status === 'paid' ? C.green : d.status === 'partial' ? C.orange : C.red }}>{d.status === 'paid' ? '┘àÏ»┘ü┘êÏ╣' : d.status === 'partial' ? 'Ï¼Ï▓Ïª┘è' : '┘é┘èÏ» Ïº┘äÏº┘åÏ¬Ï©ÏºÏ▒'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{fmt(Number(d.amount) || 0)} DA</span>
                {remaining > 0 && <span style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>Ïº┘ä┘àÏ¬Ï¿┘é┘è: {fmt(remaining)} DA</span>}
              </div>
              {d.note && <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>{d.note}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                {remaining > 0 && (
                  <>
                    <button onClick={() => handlePayDebt(d.id, remaining)} style={{ flex: 1, padding: '8px', borderRadius: 10, background: C.green, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Ï»┘üÏ╣ ┘âÏº┘à┘ä</button>
                    <button onClick={() => { setPayingDebtId(d.id); setPayAmount(''); }} style={{ flex: 1, padding: '8px', borderRadius: 10, background: '#EFF6FF', color: C.blue, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Ï»┘üÏ╣ Ï¼Ï▓Ïª┘è</button>
                  </>
                )}
                <button onClick={() => handleDeleteDebt(d.id)} style={{ padding: '8px 12px', borderRadius: 10, background: '#FEE2E2', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={14} color={C.red} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowAddModal(true)} style={{ position: 'fixed', bottom: 30, right: 'calc(50% - 175px)', width: 56, height: 56, borderRadius: '50%', background: C.blue, color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
        <Plus size={26} />
      </button>

      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 220, animation: 'fadeInBg 0.2s ease' }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 221, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setShowAddModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color={C.dark} />
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Ï»┘è┘å Ï¼Ï»┘èÏ»</h2>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘äÏ╣┘à┘è┘ä *</label>
                <div onClick={() => setShowClientPicker(true)} style={{ padding: '14px', borderRadius: 12, border: `2px dashed ${selectedClientId ? C.green : '#FCA5A5'}`, background: selectedClientId ? '#F0FDF4' : '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={20} color={selectedClientId ? C.green : C.red} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: selectedClientId ? C.dark : C.red }}>{selectedClient ? selectedClient.name : 'ÏºÏ«Ï¬Ï▒ Ï╣┘à┘è┘ä'}</span>
                  </div>
                  <ChevronLeft size={18} color={C.gray} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘àÏ¿┘äÏ║ *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFAFA', height: 48 }}>
                  <Wallet size={18} color={C.gray} />
                  <input type="number" inputMode="decimal" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} placeholder="0" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontWeight: 700, background: 'transparent', textAlign: 'left', direction: 'ltr' }} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>┘à┘äÏºÏ¡Ï©Ï® (ÏºÏ«Ï¬┘èÏºÏ▒┘è)</label>
                <input value={debtNote} onChange={e => setDebtNote(e.target.value)} placeholder="ÏúÏÂ┘ü ┘à┘äÏºÏ¡Ï©Ï®..." style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', textAlign: 'right', direction: 'rtl', background: '#FAFAFA', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, #3B82F6, #2563EB)`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={18} /> ÏÑÏÂÏº┘üÏ®</button>
              </div>
            </div>
          </div>

          {showClientPicker && (
            <>
              <div onClick={() => setShowClientPicker(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 230 }} />
              <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, maxHeight: '60vh', background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 231, animation: 'slideUp 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: C.dark, textAlign: 'center' }}>ÏºÏ«Ï¬Ï▒ Ï╣┘à┘è┘ä</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
                  {clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: C.gray }}>┘äÏº ┘è┘êÏ¼Ï» Ï╣┘à┘äÏºÏí. ÏúÏÂ┘ü Ï╣┘à┘è┘ä Ïú┘ê┘äÏº┘ï ┘à┘å ÏÁ┘üÏ¡Ï® Ïº┘äÏ╣┘à┘äÏºÏí.</div>
                  ) : clients.map(c => (
                    <div key={c.id} onClick={() => { setSelectedClientId(String(c.id)); setShowClientPicker(false); }} style={{ padding: '12px', borderRadius: 12, marginBottom: 8, background: String(c.id) === selectedClientId ? '#EFF6FF' : '#F9FAFB', border: String(c.id) === selectedClientId ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: C.blue }}>{c.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{c.name}</div>
                        {c.phone && <div style={{ fontSize: 12, color: C.gray }}>{c.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {payingDebtId && (
        <>
          <div onClick={() => setPayingDebtId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 240 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderRadius: '24px 24px 0 0', zIndex: 241, animation: 'slideUp 0.25s ease', padding: '16px 18px 24px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, textAlign: 'center', marginBottom: 16 }}>Ï»┘üÏ╣ Ï¼Ï▓Ïª┘è</h2>
            {(() => {
              const debt = safeDebts.find(d => d.id === payingDebtId);
              if (!debt) return null;
              const remaining = (Number(debt.amount) || 0) - (Number(debt.paid) || 0);
              return (
                <>
                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '12px 14px', marginBottom: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: C.gray }}>Ïº┘ä┘àÏ¬Ï¿┘é┘è ┘à┘å Ïº┘äÏ»┘è┘å</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.dark }}>{fmt(remaining)} DA</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, display: 'block', textAlign: 'right' }}>Ïº┘ä┘àÏ¿┘äÏ║ Ïº┘ä┘àÏ»┘ü┘êÏ╣ *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: '#FAFAFA', height: 52 }}>
                      <Wallet size={20} color={C.gray} />
                      <input type="number" inputMode="decimal" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 20, fontWeight: 800, background: 'transparent', textAlign: 'left', direction: 'ltr' }} />
                      <span style={{ fontSize: 13, color: C.gray }}>DA</span>
                    </div>
                  </div>
                  <button onClick={() => setPayAmount(String(remaining))} style={{ width: '100%', marginBottom: 12, padding: '10px', borderRadius: 12, border: 'none', background: '#EFF6FF', color: C.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Ï»┘üÏ╣ Ïº┘ä┘àÏ¿┘äÏ║ ┘âÏº┘à┘äÏº┘ï ({fmt(remaining)} DA)
                  </button>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setPayingDebtId(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: '#fff', color: C.dark, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>ÏÑ┘äÏ║ÏºÏí</button>
                    <button onClick={() => {
                      const amt = Number(payAmount);
                      if (!amt || amt <= 0) return;
                      handlePayDebt(payingDebtId, amt);
                      setPayingDebtId(null);
                      setPayAmount('');
                    }} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: C.green, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Ï»┘üÏ╣</button>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
   PLACEHOLDER SCREEN (┘é┘èÏ» Ïº┘äÏÑ┘åÏ┤ÏºÏí)
   ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */
export function PlaceholderScreen({ title, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl' }}>
      <AppHeader
        title={title}
        left={<HeaderIconButton label="Ï▒Ï¼┘êÏ╣" onClick={onBack}><ChevronLeft size={22} color={C.dark} /></HeaderIconButton>}
        border
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', boxShadow: C.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20 }}>­ƒÜº</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>┘çÏ░┘ç Ïº┘äÏÁ┘üÏ¡Ï® ┘é┘èÏ» Ïº┘äÏÑ┘åÏ┤ÏºÏí</div>
        <div style={{ fontSize: 14, color: C.gray, marginTop: 8 }}>┘éÏ▒┘èÏ¿Ïº┘ï</div>
      </div>
    </div>
  );
}
