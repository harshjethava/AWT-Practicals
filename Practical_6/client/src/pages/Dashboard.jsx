import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { http } from '../api/http'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useOtpTimer } from '../hooks/useOtpTimer'

function formatMoney(n) {
  return `₹${Number(n || 0).toFixed(0)}`
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { cartItems, add, setQty, remove, clear } = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit')

  const [otpStep, setOtpStep] = useState('idle')
  const [orderId, setOrderId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [otp, setOtp] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { secondsLeft, expired } = useOtpTimer(expiresAt)

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0)
  }, [cartItems])

  const cartPayload = useMemo(() => {
    return cartItems.map((ci) => ({ productId: ci.product._id, quantity: ci.quantity }))
  }, [cartItems])

  useLayoutEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await http.get('/products')
      setProducts(res.data.items || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const seedProducts = useCallback(async () => {
    await http.post('/products/seed')
    await fetchProducts()
  }, [fetchProducts])

  const requestOtp = useCallback(async () => {
    setCheckoutLoading(true)
    setCheckoutError('')
    setSuccessMsg('')
    try {
      const res = await http.post('/checkout/request-otp', {
        cartItems: cartPayload,
        paymentMethod,
      })
      setOrderId(res.data.orderId)
      setExpiresAt(res.data.expiresAt)
      setOtpStep('otp')
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Failed to request OTP')
    } finally {
      setCheckoutLoading(false)
    }
  }, [cartPayload, paymentMethod])

  const verifyOtp = useCallback(async () => {
    setCheckoutLoading(true)
    setCheckoutError('')
    setSuccessMsg('')
    try {
      await http.post('/checkout/verify-otp', { orderId, otp })
      clear()
      setOtp('')
      setOrderId('')
      setExpiresAt('')
      setOtpStep('idle')
      setDrawerOpen(false)
      setSuccessMsg('Order placed successfully')
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'OTP verification failed')
    } finally {
      setCheckoutLoading(false)
    }
  }, [orderId, otp, clear])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setCheckoutError('')
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-lg font-semibold">E-Cart</div>
            <div className="text-xs text-slate-400">Hi, {user?.name || 'User'}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Cart ({cartItems.length})
            </button>
            <button onClick={logout} className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={seedProducts}
              className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Seed Products
            </button>
            <button
              onClick={fetchProducts}
              className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Refresh
            </button>
          </div>
        </div>

        {successMsg ? <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">{successMsg}</div> : null}
        {error ? <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</div> : null}

        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p._id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-800">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-slate-400 line-clamp-2">{p.description}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-semibold">{formatMoney(p.price)}</div>
                      <button
                        onClick={() => add(p)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {drawerOpen ? (
        <div className="fixed inset-0 z-20">
          <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-800 bg-slate-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Your Cart</div>
              <button onClick={closeDrawer} className="rounded-lg border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900">
                Close
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-slate-400">Your cart is empty.</div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((ci) => (
                  <div key={ci.product._id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ci.product.title}</div>
                        <div className="text-sm text-slate-400">{formatMoney(ci.product.price)} each</div>
                      </div>
                      <button
                        onClick={() => remove(ci.product._id)}
                        className="rounded-lg border border-slate-800 px-2 py-1 text-xs hover:bg-slate-900"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(ci.product._id, ci.quantity - 1)}
                          className="h-8 w-8 rounded-lg border border-slate-800 hover:bg-slate-900"
                        >
                          -
                        </button>
                        <div className="min-w-8 text-center">{ci.quantity}</div>
                        <button
                          onClick={() => setQty(ci.product._id, ci.quantity + 1)}
                          className="h-8 w-8 rounded-lg border border-slate-800 hover:bg-slate-900"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-semibold">{formatMoney(ci.product.price * ci.quantity)}</div>
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">Subtotal</div>
                    <div className="text-lg font-semibold">{formatMoney(subtotal)}</div>
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-slate-300">Payment method</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={otpStep === 'otp'}
                    >
                      <option value="credit">Credit Card</option>
                      <option value="debit">Debit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  {checkoutError ? (
                    <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-sm">{checkoutError}</div>
                  ) : null}

                  {otpStep !== 'otp' ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={clear}
                        className="flex-1 rounded-lg border border-slate-800 py-2 text-sm hover:bg-slate-900"
                        disabled={checkoutLoading}
                      >
                        Clear
                      </button>
                      <button
                        onClick={requestOtp}
                        className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? 'Sending OTP...' : 'Checkout'}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="text-sm text-slate-400">
                        Enter OTP sent to your email. {expired ? 'OTP expired.' : `Time left: ${secondsLeft}s`}
                      </div>
                      <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        inputMode="numeric"
                        className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="6-digit OTP"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setOtpStep('idle')
                            setOrderId('')
                            setExpiresAt('')
                            setOtp('')
                          }}
                          className="flex-1 rounded-lg border border-slate-800 py-2 text-sm hover:bg-slate-900"
                          disabled={checkoutLoading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={verifyOtp}
                          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-60"
                          disabled={checkoutLoading || expired || otp.length < 4}
                        >
                          {checkoutLoading ? 'Verifying...' : 'Place Order'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
