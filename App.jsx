import React, { useState, useMemo } from 'react';
import { COSMETICS_PRODUCTS, CATEGORIES } from './data/cosmetics.js';

export default function App() {
  const [products] = useState(COSMETICS_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('featured');
  const [currency, setCurrency] = useState('INR');

  // Modals
  const [specModalProduct, setSpecModalProduct] = useState(null);
  const [specSelectedShade, setSpecSelectedShade] = useState(null);
  const [specQuantity, setSpecQuantity] = useState(1);

  // Cart
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer Form (Mandatory for SMS bill)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Order Success & SMS Simulation
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCurrency = (amount) => {
    if (currency === 'USD') {
      return `$${(amount / 83).toFixed(2)}`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(item => {
      const matchesCategory = selectedCategory === 'All Products' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const cartItemCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((t, i) => t + (i.price * i.quantity), 0), [cart]);
  const boutiqueDiscount = useMemo(() => cartSubtotal > 0 ? Math.round(cartSubtotal * 0.05) : 0, [cartSubtotal]);
  const taxAmount = useMemo(() => Math.round((cartSubtotal - boutiqueDiscount) * 0.18), [cartSubtotal, boutiqueDiscount]);
  const finalTotal = useMemo(() => (cartSubtotal - boutiqueDiscount) + taxAmount, [cartSubtotal, boutiqueDiscount, taxAmount]);

  const handleOpenSpecs = (product, shade = null) => {
    setSpecModalProduct(product);
    setSpecSelectedShade(shade || product.shades[0]);
    setSpecQuantity(1);
  };

  const handleAddToCart = (product, shade = null, qty = 1) => {
    const chosenShade = shade || product.shades[0];
    const cartKey = `${product.id}-${chosenShade.code}`;

    setCart(prev => {
      const idx = prev.findIndex(item => item.cartKey === cartKey);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...prev, {
        cartKey,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        image: product.image,
        shade: chosenShade,
        quantity: qty,
        shelfLocation: product.shelfLocation
      }];
    });

    showToast(`Added ${qty} × ${product.name} to cart!`);
    if (specModalProduct) setSpecModalProduct(null);
  };

  const handleUpdateCartQty = (cartKey, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartKey === cartKey) {
        const n = item.quantity + delta;
        return n > 0 ? { ...item, quantity: n } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const errors = {};

    if (!customerName || customerName.trim().length < 2) {
      errors.name = "Please enter customer's full name (mandatory).";
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit mobile number for SMS billing (mandatory).";
    }

    if (cart.length === 0) {
      errors.cart = "Cart is empty.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmittingOrder(true);

    setTimeout(() => {
      const orderDetails = {
        orderId: `VEL-${Math.floor(100000 + Math.random() * 900000)}`,
        orderDate: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        customerName: customerName.trim(),
        customerPhone: `${countryCode} ${customerPhone.trim()}`,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: boutiqueDiscount,
        tax: taxAmount,
        total: finalTotal,
        giftPackaging,
        kioskTerminal: 'Kiosk #04 • Flagship Salon',
        smsStatus: 'Delivered',
        smsTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setOrderSuccessData(orderDetails);
      setIsSubmittingOrder(false);
      setIsCartOpen(false);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setGiftPackaging(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] font-sans text-gray-900">
      
      {/* Top Kiosk Ribbon */}
      <div className="bg-[#141214] text-[#E8B4B8] text-xs py-2 px-4 border-b border-[#2D282D]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-300">VELOURA BOUTIQUE • IN-STORE ORDERING TERMINAL</span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span className="text-emerald-400 font-medium">● Live Inventory Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-300">Paperless SMS Digital Bill</span>
            <div className="flex items-center bg-[#252125] rounded-full p-0.5 border border-[#3C353C]">
              <button 
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${currency === 'INR' ? 'bg-[#D4AF37] text-black' : 'text-gray-300'}`}>
                ₹ INR
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${currency === 'USD' ? 'bg-[#D4AF37] text-black' : 'text-gray-300'}`}>
                $ USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC9]">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedCategory('All Products'); setSearchQuery(''); }}>
            <div className="w-10 h-10 rounded-full bg-[#141214] text-[#D4AF37] flex items-center justify-center font-serif font-black text-xl border border-[#D4AF37]/50 shadow">
              V
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#141214]">VELOURA</h1>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8C7A54] font-semibold">Haute Cosmetics Boutique</p>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <input
              type="text"
              placeholder="Search lipsticks, foundation creams, shades, serums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-full text-sm border border-[#DECDB3] focus:border-[#D4AF37] outline-none shadow-sm"
            />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#141214] text-white hover:bg-[#252125] transition border border-[#D4AF37]/40 shadow">
            <span className="relative font-bold text-amber-400">
              🛍️ {cartItemCount > 0 && <span className="absolute -top-2 -right-3 bg-[#D4AF37] text-black text-[10px] px-1.5 py-0.2 rounded-full font-black">{cartItemCount}</span>}
            </span>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] uppercase text-gray-300">Bag Total</span>
              <span className="text-xs font-bold text-[#F4E5B2]">{formatCurrency(finalTotal)}</span>
            </div>
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#141214] via-[#2A1E24] to-[#141214] text-white py-8 px-4 border-b border-[#3E2B37]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#F4E5B2] text-xs font-semibold mb-2">
              ✨ In-Store Ordering & Digital SMS Billing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF7F2]">
              Select Your Cosmetics. <span className="text-[#D4AF37]">Receive SMS Bill at Counter.</span>
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Tap any item to view formula specifications, tester locations, and shades. Enter customer mobile number to dispatch digital bill receipt upon order placement.
            </p>
          </div>
          <div className="bg-[#231A21] border border-[#E8B4B8]/20 rounded-2xl p-4 text-xs space-y-1.5">
            <div className="font-bold text-amber-300 uppercase tracking-wider mb-1">Easy Kiosk Steps:</div>
            <div>1. Tap cosmetic to view specifications</div>
            <div>2. Pick shade & add to bag</div>
            <div>3. Enter customer Name & Phone number</div>
            <div>4. Collect parcel; bill arrives via SMS!</div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-[#E8DFC9] sticky top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat ? 'bg-[#141214] text-[#D4AF37]' : 'bg-[#F5EFE6] text-gray-700 hover:bg-[#EBDDC9]'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            Showing <strong className="text-black">{filteredProducts.length}</strong> items
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="bg-white rounded-2xl border border-[#E9DFCF] hover:border-[#D4AF37] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
              <div 
                className="relative aspect-square bg-[#F7F2EB] cursor-pointer"
                onClick={() => handleOpenSpecs(product)}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#141214] text-[#D4AF37] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {product.category}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A54] block">{product.brand}</span>
                  <h3 
                    onClick={() => handleOpenSpecs(product)}
                    className="font-serif text-base font-bold text-gray-900 hover:text-[#A37F15] cursor-pointer truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.shortDesc}</p>
                  
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {product.shades.map((shade, idx) => (
                      <span 
                        key={idx} 
                        title={shade.name} 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: shade.hex }} 
                      />
                    ))}
                    <span className="text-[10px] text-gray-400">({product.shades.length} shades)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0E6D8] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 line-through block">{formatCurrency(product.originalPrice)}</span>
                    <span className="text-base font-black text-gray-900">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenSpecs(product)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F5EFE6] hover:bg-[#EBDDC9]">
                      Specs
                    </button>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-black hover:bg-[#F4E5B2]">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Specifications Popup */}
      {specModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/50 max-h-[90vh] flex flex-col">
            <div className="bg-[#141214] text-white p-4 flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-[#D4AF37] tracking-wider">Product Specifications & Formulation</span>
              <button onClick={() => setSpecModalProduct(null)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-5">
                <img src={specModalProduct.image} alt={specModalProduct.name} className="w-full sm:w-48 h-48 object-cover rounded-2xl border" />
                <div className="space-y-2 flex-1">
                  <span className="text-xs text-amber-700 font-bold uppercase">{specModalProduct.brand}</span>
                  <h3 className="font-serif text-2xl font-bold text-gray-900">{specModalProduct.name}</h3>
                  <p className="text-xs text-gray-600">{specModalProduct.shortDesc}</p>
                  <div className="text-lg font-black text-gray-900">{formatCurrency(specModalProduct.price)}</div>
                  <div className="text-xs text-gray-500">📍 In-store: <strong className="text-gray-800">{specModalProduct.shelfLocation}</strong></div>
                  
                  {/* Shades */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Select Shade: {specSelectedShade?.name}</label>
                    <div className="flex gap-2 flex-wrap">
                      {specModalProduct.shades.map((s, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setSpecSelectedShade(s)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${specSelectedShade?.code === s.code ? 'border-[#D4AF37] bg-amber-50 font-bold' : 'border-gray-200'}`}>
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: s.hex }}></span>
                          <span>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="border-t pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Formula Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl">
                  <div><strong>Finish:</strong> {specModalProduct.specifications.finish}</div>
                  <div><strong>Volume:</strong> {specModalProduct.specifications.netWeight}</div>
                  <div><strong>Skin Type:</strong> {specModalProduct.specifications.skinType}</div>
                  <div><strong>Coverage:</strong> {specModalProduct.specifications.coverage}</div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Key Ingredients:</strong> {specModalProduct.specifications.keyIngredients.join(', ')}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Application Tip:</strong> {specModalProduct.specifications.howToUse}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border rounded-xl p-1">
                  <button onClick={() => setSpecQuantity(Math.max(1, specQuantity - 1))} className="px-2.5 py-1 font-bold">-</button>
                  <span className="px-3 font-bold text-sm">{specQuantity}</span>
                  <button onClick={() => setSpecQuantity(specQuantity + 1)} className="px-2.5 py-1 font-bold">+</button>
                </div>
                <button 
                  onClick={() => handleAddToCart(specModalProduct, specSelectedShade, specQuantity)}
                  className="flex-1 py-3 bg-[#141214] text-[#D4AF37] hover:bg-black font-bold text-xs uppercase rounded-xl tracking-wider">
                  Add to Cart • {formatCurrency(specModalProduct.price * specQuantity)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Customer Checkout Popup */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between">
            <div className="bg-[#141214] text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold">Customer Cart ({cartItemCount})</h3>
                <p className="text-[11px] text-gray-300">VELOURA Kiosk #04</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">Your shopping bag is empty.</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.cartKey} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold truncate">{item.name}</h5>
                          <div className="text-[11px] text-gray-500">{item.shade.name}</div>
                          <div className="text-xs font-bold text-[#A37F15]">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                        <div className="flex items-center border rounded bg-white">
                          <button onClick={() => handleUpdateCartQty(item.cartKey, -1)} className="px-2 py-0.5 text-xs font-bold">-</button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => handleUpdateCartQty(item.cartKey, 1)} className="px-2 py-0.5 text-xs font-bold">+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* MANDATORY Customer Information for SMS Billing */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border-2 border-[#D4AF37]/50 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-red-600">
                      * Mandatory Customer Details for SMS Bill
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Customer Name *</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full p-2.5 bg-white border rounded-xl text-xs outline-none ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {formErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number (For SMS Bill) *</label>
                      <div className="flex gap-2">
                        <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="p-2 border rounded-xl text-xs bg-white">
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                        </select>
                        <input 
                          type="tel" 
                          placeholder="10-digit mobile number" 
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={`flex-1 p-2.5 bg-white border rounded-xl text-xs outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                      {formErrors.phone && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.phone}</p>}
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-[11px] border border-emerald-200">
                      📱 An itemized digital bill with tax invoice will be sent via SMS to this phone number immediately when you place the order.
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(cartSubtotal)}</span></div>
                    <div className="flex justify-between text-emerald-700"><span>Boutique Discount (5%):</span><span>-{formatCurrency(boutiqueDiscount)}</span></div>
                    <div className="flex justify-between"><span>Tax (GST 18%):</span><span>{formatCurrency(taxAmount)}</span></div>
                    <div className="border-t pt-1 font-bold text-sm flex justify-between"><span>Total:</span><span>{formatCurrency(finalTotal)}</span></div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t bg-white">
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 bg-[#141214] text-[#D4AF37] hover:bg-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg border border-[#D4AF37]/40">
                  {isSubmittingOrder ? 'Generating Bill & Sending SMS...' : 'Place Order & Send Bill via SMS'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Success & SMS Invoice Modal */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]">
            <div className="bg-[#141214] text-white p-5 text-center">
              <span className="text-3xl block mb-1">🎉</span>
              <h3 className="font-serif text-2xl font-bold">Order Placed Successfully!</h3>
              <p className="text-xs text-gray-300">Order ID: <strong className="text-[#D4AF37]">{orderSuccessData.orderId}</strong></p>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              {/* Simulated SMS Card */}
              <div className="bg-[#1F1C20] text-white p-4 rounded-xl border border-amber-400/40">
                <div className="font-bold text-amber-300 mb-1">📱 SMS Dispatched to {orderSuccessData.customerPhone}:</div>
                <div className="text-gray-200 bg-[#2B272C] p-3 rounded-lg text-[11px] leading-relaxed">
                  "Dear {orderSuccessData.customerName}, your VELOURA order {orderSuccessData.orderId} for {formatCurrency(orderSuccessData.total)} is confirmed. Your digital bill has been generated: https://veloura.store/bill/{orderSuccessData.orderId}. Please collect your order at Counter 01."
                </div>
              </div>

              {/* Quick Summary */}
              <div className="border border-dashed border-[#D4AF37] p-4 rounded-xl bg-[#FAF7F2]">
                <div className="font-bold text-gray-800 text-sm mb-2 text-center">VELOURA DIGITAL TAX RECEIPT</div>
                <div className="space-y-1">
                  <div><strong>Customer:</strong> {orderSuccessData.customerName}</div>
                  <div><strong>Phone:</strong> {orderSuccessData.customerPhone}</div>
                  <div><strong>Date:</strong> {orderSuccessData.orderDate}</div>
                  <div className="border-t my-2 pt-2">
                    {orderSuccessData.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-0.5">
                        <span>{item.quantity}x {item.name} ({item.shade.name})</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-1 font-bold flex justify-between text-sm">
                    <span>Total Paid:</span>
                    <span className="text-[#A37F15]">{formatCurrency(orderSuccessData.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex-1 py-2.5 border rounded-xl font-bold hover:bg-gray-50">
                  🖨️ Print Receipt
                </button>
                <button 
                  onClick={() => setOrderSuccessData(null)}
                  className="flex-1 py-2.5 bg-[#141214] text-[#D4AF37] rounded-xl font-bold uppercase tracking-wider hover:bg-black">
                  Next Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-black text-[#D4AF37] px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#D4AF37]/50">
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#141214] text-gray-400 text-xs py-6 px-4 text-center border-t border-gray-800 mt-10">
        VELOURA Haute Cosmetics • In-Store Customer Ordering Kiosk System
      </footer>

    </div>
  );
}
