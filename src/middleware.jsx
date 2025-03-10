import axios from 'axios';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  if (req.nextUrl.pathname.startsWith('/order')) {
    return orderMiddleware(req);
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(req);
  }

  return NextResponse.next();
}

async function orderMiddleware(req) {
  console.log('Middleware for /order');
  const url = req.nextUrl;
  const tableId = url.searchParams.get('tableId');
  const orderIdFromUrl = url.searchParams.get('orderId'); // รับ orderId จาก URL

  if (!tableId) {
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }

  if (tableId === 'takeaway') {
    if (orderIdFromUrl) {
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
      if (['Paid', 'Cancelled'].includes(orderRes.data.order_status)) {
        return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
      }
      return NextResponse.next();
    } else {
      // สร้าง orderId ใหม่ และให้ client จัดการ localStorage เอง
      const newOrderId = nanoid(8);
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('orderId', newOrderId);
      return NextResponse.redirect(nextUrl);
    }
  }

  try {
    const response = await axios.get(`https://api.pasitlab.com/tables/${tableId}`);
    const tableStatus = response.data.table_status;

    if (tableStatus === 'Reserved') {
      return NextResponse.redirect(new URL('/reserved', req.nextUrl.origin));
    }

    if (tableStatus === 'Occupied') {
      if (!orderIdFromUrl) {
        return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin));
      }
      return NextResponse.next();
    }

    if (tableStatus === 'Available') {
      if (!orderIdFromUrl) {
        const newOrderId = nanoid(8);
        const nextUrl = new URL(url);
        nextUrl.searchParams.set('orderId', newOrderId);
        return NextResponse.redirect(nextUrl);
      }
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  } catch (err) {
    console.error('Error fetching table status:', err);
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }
}

async function adminMiddleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/order/:path*', '/admin/:path*'],
};
