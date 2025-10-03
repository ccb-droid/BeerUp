"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/components/layout/toast-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createOrder } from "@/lib/actions/orders"
import type { Beer } from "@/lib/types"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { ShoppingCart, CheckCircle2 } from "lucide-react"

interface OrderNowDialogProps {
  beer: Beer
  children: React.ReactNode
}

type OrderStep = 'selection' | 'payment' | 'success'

export function OrderNowDialog({ beer, children }: OrderNowDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<OrderStep>('selection')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(beer.moq || 1)
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const handleLoginRedirect = () => {
    router.push(`/login?redirectTo=/beers`)
  }

  const handleProceedToPayment = () => {
    if (!user) {
      showToast("Please log in to place an order", "error")
      return
    }

    // Validate quantity against MOQ
    const minQuantity = beer.moq || 1
    if (quantity < minQuantity) {
      showToast(`Minimum order quantity is ${minQuantity}`, "error")
      return
    }

    setStep('payment')
  }

  const handleConfirmPayment = async () => {
    if (!user) {
      showToast("Please log in to place an order", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createOrder({
        beer_id: beer.id,
        quantity,
        payment_confirmed: true,
      })

      if (result) {
        setStep('success')
      } else {
        showToast("Failed to create order. Please try again later", "error")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      showToast("Something went wrong. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setOpen(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setStep('selection')
      setQuantity(beer.moq || 1)
    }, 300)
  }

  const handleSuccessConfirm = () => {
    handleCloseDialog()
    router.push('/')
  }

  const totalPrice = beer.price ? (beer.price * quantity).toFixed(2) : '0.00'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        handleCloseDialog()
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'selection' && 'Order Details'}
            {step === 'payment' && 'Payment'}
            {step === 'success' && 'Order Confirmed'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Selection */}
        {step === 'selection' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">{beer.name}</h4>
              <p className="text-sm text-muted-foreground">{beer.brewery}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Price per unit</Label>
                <span className="font-semibold">${beer.price?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label>Minimum Order Quantity (MOQ)</Label>
                <span className="font-semibold">{beer.moq || 1} units</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Select
                value={quantity.toString()}
                onValueChange={(value) => setQuantity(parseInt(value))}
                disabled={!user}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const value = (beer.moq || 1) + i
                    return (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Minimum order: {beer.moq || 1} units
              </p>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              {user ? (
                <Button onClick={handleProceedToPayment}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
              ) : (
                <Button onClick={handleLoginRedirect}>
                  Sign in to order
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-center">Scan to Pay</h4>
              <p className="text-sm text-muted-foreground text-center">
                Total amount: <span className="font-semibold">${totalPrice}</span>
              </p>
            </div>

            <div className="flex justify-center py-4">
              <div className="relative w-64 h-64">
                <Image
                  src="/nic_paynow.jpg"
                  alt="PayNow QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Please scan the QR code with your banking app to complete payment
            </p>

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('selection')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Processing..." : "I've Paid - Confirm Order"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg text-center">Order Confirmed!</h4>
              <p className="text-sm text-muted-foreground text-center">
                Your order for {quantity} {quantity === 1 ? 'unit' : 'units'} of {beer.name} has been confirmed.
              </p>
              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll send you updates at {user?.email}
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleSuccessConfirm} className="w-full">
                Back to Home
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
