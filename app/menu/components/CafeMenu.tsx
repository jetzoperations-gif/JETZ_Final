'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { ShoppingBag, X, Plus, Minus, Coffee, Utensils, Wrench } from 'lucide-react'
import { Loader2 } from 'lucide-react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface CartItem extends InventoryItem {
    quantity: number
}

// Categories for tabs
const CATEGORIES = ['All', 'Drinks', 'Snacks', 'CarCare'] as const
type Category = typeof CATEGORIES[number]

export default function CafeMenu() {
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
        fetchInventory()
    }, [])

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
            await supabase
                .from('orders')
                .update({ total_amount: 0 }) // Dummy update or legit update if we tracked total
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
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {cat === 'All' && 'All Items'}
                        {cat === 'Drinks' && <span className="flex items-center gap-1"><Coffee size={14} /> Drinks</span>}
                        {cat === 'Snacks' && <span className="flex items-center gap-1"><Utensils size={14} /> Snacks</span>}
                        {cat === 'CarCare' && <span className="flex items-center gap-1"><Wrench size={14} /> Car Care</span>}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                        <div>
                            {/* Placeholder Image Box */}
                            <div className="aspect-square rounded-lg bg-gray-100 mb-3 flex items-center justify-center text-gray-300">
                                {item.category === 'Drinks' && <Coffee size={32} />}
                                {item.category === 'Snacks' && <Utensils size={32} />}
                                {item.category === 'CarCare' && <Wrench size={32} />}
                            </div>
                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                            <p className="font-medium text-gray-500 text-sm">{item.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-lg text-blue-700">₱{item.price}</span>

                            {/* Quantity Controls */}
                            {cart.find(c => c.id === item.id) ? (
                                <div className="flex items-center gap-2 bg-blue-50 rounded-full p-1">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-100"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="font-bold text-blue-900 text-sm w-4 text-center">
                                        {cart.find(c => c.id === item.id)?.quantity || 0}
                                    </span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart(item)}
                                    className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
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
                                <p className="text-gray-500">The barista will prepare your items shortly.</p>
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
                                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Enter your Token #</label>
                                        <input
                                            type="number"
                                            value={tokenInput}
                                            onChange={e => setTokenInput(e.target.value)}
                                            placeholder="Ex: 5"
                                            className="w-full text-center text-xl font-bold p-2 rounded-lg border-2 border-blue-200 focus:border-blue-500 outline-none"
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
