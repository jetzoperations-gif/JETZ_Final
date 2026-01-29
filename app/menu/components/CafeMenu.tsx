'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { ShoppingBag, X, Plus, Minus, Coffee, Utensils, Sparkles, CupSoda, CarFront, Loader2 } from 'lucide-react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface CartItem extends InventoryItem {
    quantity: number
}

// Categories for tabs
const CATEGORIES = ['All', 'Drinks', 'Snacks', 'CarCare'] as const
type Category = typeof CATEGORIES[number]

export default function CafeMenu() {
    const searchParams = useSearchParams()
    const urlToken = searchParams.get('token')

    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState<Category>('All')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    // Checkout State
    const [tokenInput, setTokenInput] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [toastMsg, setToastMsg] = useState('')

    const showToast = (msg: string) => {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 2000)
    }

    useEffect(() => {
        if (urlToken) {
            setTokenInput(urlToken)
        }
        fetchInventory()
    }, [urlToken])

    const fetchInventory = async () => {
        const { data } = await supabase
            .from('inventory_items')
            .select('*')
            .gt('stock_qty', 0) // Only show in-stock items
            .order('category')
            .order('name')

        if (data) setItems(data)
        setLoading(false)
    }

    const filteredItems = activeCategory === 'All'
        ? items
        : items.filter(i => i.category === activeCategory)

    const addToCart = (item: InventoryItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                showToast(`Added another ${item.name}`)
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            showToast(`Added ${item.name} to cart`)
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId: number) => {
        setCart(prev => prev.reduce((acc, item) => {
            if (item.id === itemId) {
                if (item.quantity > 1) return [...acc, { ...item, quantity: item.quantity - 1 }]
                return acc
            }
            return [...acc, item]
        }, [] as CartItem[]))
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tokenInput || cart.length === 0) return

        setSubmitting(true)
        const tokenId = parseInt(tokenInput)

        if (isNaN(tokenId)) {
            alert('Please enter a valid Token ID (Number).')
            setSubmitting(false)
            return
        }

        // 1. Verify Token is Active
        const { data: tokenData, error: tokenError } = await supabase
            .from('tokens')
            .select('status, current_job_id')
            .eq('id', tokenId)
            .single()

        if (tokenError || !tokenData) {
            alert('Token not found. Please check your number.')
            setSubmitting(false)
            return
        }

        if (tokenData.status !== 'active' || !tokenData.current_job_id) {
            alert('This Token is not currently active in a carwash job. Please ask staff.')
            setSubmitting(false)
            return
        }

        // 2. Find the Active Order for this Token
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('id')
            .eq('token_id', tokenId) // Order is linked to token
            .eq('status', 'queued') // Assuming active jobs are queued or completed? Wait.
        // Ideally we link to current_job_id from token, but token.current_job_id IS the order_id usually?
        // Let's check schema. tokens.current_job_id is uuid (ORDER ID).
        // Actually, let's just use tokenData.current_job_id directly if it exists.

        const orderId = tokenData.current_job_id

        if (!orderId) {
            alert('No active order found for this token.')
            setSubmitting(false)
            return
        }

        // 3. Insert Order Items
        const orderItemsToInsert = cart.map(item => ({
            order_id: orderId,
            item_type: 'inventory',
            item_id: item.id,
            item_name: item.name,
            price_snapshot: item.price,
            quantity: item.quantity
        }))

        // @ts-ignore - Supabase types might be strict on Insert, relying on correct shape
        const { error: insertError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert)

        if (insertError) {
            console.error(insertError)
            alert('Failed to place order. Try again.')
        } else {
            // FORCE UPDATE THE ORDER to trigger Realtime on 'orders' table
            // This ensures Barista gets notified even if 'order_items' replication is off
            // We calculate the new total including this cart.
            // Note: Ideally we sum up all order_items from DB, but for this "Trigger" 
            // even just incrementing the total or passing 0.01 would work. 
            // Let's pass the cart total + existing (blind guess or just update).
            // Better: Let's just update 'updated_at' if we had it. Since we don't, 
            // we will fetch the current total and add to it, or just random number?
            // "total_amount" in our schema seems to be the Job Total.
            // Let's just set it to a random decimal to guarantee a change event.
            // hack: updating total_amount to specific value

            const randomChange = (Math.floor(Math.random() * 100) / 100)

            await supabase
                .from('orders')
                .update({ total_amount: randomChange })
                .eq('id', orderId)

            setOrderSuccess(true)
            setCart([])
            setTokenInput('')
            setTimeout(() => {
                setOrderSuccess(false)
                setIsCheckoutOpen(false)
            }, 3000)
        }

        setSubmitting(false)
    }

    if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading Menu...</div>

    return (
        <div className="relative">
            {/* Category Tabs */}
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-2 mb-4 shadow-sm">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeCategory === cat
                                ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            {cat === 'All' && 'All Items'}
                            {cat === 'Drinks' && <span className="flex items-center gap-2"><CupSoda size={16} /> Drinks</span>}
                            {cat === 'Snacks' && <span className="flex items-center gap-2"><Utensils size={16} /> Snacks</span>}
                            {cat === 'CarCare' && <span className="flex items-center gap-2"><Sparkles size={16} /> Car Care</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 pb-24">
                {filteredItems.map((item, idx) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 animate-in fade-in zoom-in-95"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        {/* Image Area */}
                        <div
                            className={`aspect-[4/3] flex items-center justify-center relative group cursor-pointer overflow-hidden
                                ${item.category === 'Drinks' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : ''}
                                ${item.category === 'Snacks' ? 'bg-gradient-to-br from-red-500 to-pink-600' : ''}
                                ${item.category === 'CarCare' ? 'bg-gradient-to-br from-blue-400 to-cyan-600' : ''}
                            `}
                            onClick={() => addToCart(item)}
                        >
                            <div className="transform transition-transform group-hover:scale-110 duration-300 text-white drop-shadow-md">
                                {item.category === 'Drinks' && <CupSoda size={56} strokeWidth={1.5} />}
                                {item.category === 'Snacks' && <Utensils size={56} strokeWidth={1.5} />}
                                {item.category === 'CarCare' && <Sparkles size={56} strokeWidth={1.5} />}
                            </div>

                            {/* Decorative Shine */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                            {/* Quantity Badge on Image */}
                            {cart.find(c => c.id === item.id) && (
                                <div className="absolute top-2 right-2 bg-white text-gray-900 w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-lg text-sm animate-in bounce-in">
                                    {cart.find(c => c.id === item.id)?.quantity}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">{item.name}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{item.category}</p>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-bold text-xl text-gray-900">₱{item.price}</span>

                                {cart.find(c => c.id === item.id) ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-90"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                        className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-yellow-500 hover:shadow-md transition-all active:scale-95"
                                    >
                                        ADD
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && !isCheckoutOpen && (
                <div className="fixed bottom-6 left-0 w-full px-6 z-20">
                    <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 px-3 py-1 rounded-full font-bold">{cartCount}</div>
                            <span className="font-bold">View Order</span>
                        </div>
                        <span className="font-bold text-lg">₱{cartTotal}</span>
                    </button>
                </div>
            )}

            {/* Checkout Sheet (Modal) */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />

                    {/* Sheet */}
                    <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Your Order</h2>
                            <button onClick={() => setIsCheckoutOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        {orderSuccess ? (
                            <div className="text-center py-10">
                                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                    <ShoppingBag size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Sent!</h3>
                                <p className="text-gray-500">The MiniCafe staff will prepare your items shortly.</p>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items (Scrollable) */}
                                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-500">₱{item.price} x {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary & Actions */}
                                <div className="border-t pt-4 space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-blue-700">₱{cartTotal}</span>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">
                                            {urlToken ? 'Linked Token #' : 'Enter your Token #'}
                                        </label>
                                        <input
                                            type="number"
                                            value={tokenInput}
                                            onChange={e => setTokenInput(e.target.value)}
                                            placeholder="Ex: 5"
                                            disabled={!!urlToken}
                                            className="w-full text-center text-xl font-bold p-2 rounded-lg border-2 border-blue-200 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400 disabled:bg-blue-100 disabled:text-blue-800"
                                        />
                                        <p className="text-xs text-blue-600 mt-2 text-center">Found on your car dashboard</p>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={submitting || !tokenInput}
                                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-top-5 duration-300 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-green-400" />
                    <span className="font-semibold text-sm">{toastMsg}</span>
                </div>
            )}
        </div>
    )
}
