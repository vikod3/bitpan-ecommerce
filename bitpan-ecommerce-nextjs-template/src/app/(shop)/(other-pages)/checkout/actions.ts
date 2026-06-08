'use server'

import { getCartProducts } from '@/data'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

function parsePrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ''))
  return Number.isFinite(value) ? value : 0
}

export async function createOrder(formData: FormData) {
  const cart = await getCartProducts()

  const firstName = (formData.get('fisrt-name') as string)?.trim() ?? ''
  const lastName = (formData.get('last-name') as string)?.trim() ?? ''
  const customerName = [firstName, lastName].filter(Boolean).join(' ')
  const email = (formData.get('email') as string)?.trim() ?? ''
  const phone = (formData.get('phone') as string)?.trim() ?? ''
  const street = (formData.get('address') as string)?.trim() ?? ''
  const city = (formData.get('city') as string)?.trim() ?? ''
  const region = (formData.get('region') as string)?.trim() ?? ''
  const postalCode = (formData.get('postal-code') as string)?.trim() ?? ''

  const address = [customerName, street, [city, region, postalCode].filter(Boolean).join(', ')].filter(Boolean)

  const subtotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity ?? 1), 0)
  const shipping = 5
  const taxes = Math.round(subtotal * 0.08 * 100) / 100
  const total = Math.round((subtotal + shipping + taxes) * 100) / 100

  const number = Date.now().toString().slice(-6)
  const now = new Date()
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const datetime = now.toISOString().slice(0, 10)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      number,
      status: 'Order placed on ' + date,
      email,
      customer_name: customerName,
      address,
      phone,
      subtotal,
      shipping,
      taxes,
      total,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    throw new Error('Could not create order: ' + (orderError?.message ?? 'unknown error'))
  }

  const items = cart.map((item) => ({
    order_id: order.id,
    name: item.name,
    handle: item.handle,
    description: '',
    price: parsePrice(item.price).toFixed(2),
    status: 'Order placed',
    step: 0,
    date,
    datetime,
    image_src: item.imageSrc,
    image_alt: item.imageAlt,
    quantity: item.quantity ?? 1,
    size: item.size ?? '',
    color: item.color ?? '',
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(items)
  if (itemsError) {
    throw new Error('Could not create order items: ' + itemsError.message)
  }

  redirect('/order-successful?number=' + number)
}
