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
  const tableId = String(url.searchParams.get('tableId'));
  const orderIdFromUrl = url.searchParams.get('orderId');

  // ✅ Debugging Cookies
  console.log('Cookies:', req.cookies);
  const storedOrderId = req.cookies.get('orderId');
  console.log('Stored Order ID:', storedOrderId);

  // 🛠 เพิ่ม Headers เพื่อให้ Cookie ทำงานบนมือถือ
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');

  if (!tableId) {
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }

  if (tableId === 'takeaway') {
    if (storedOrderId) {
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
      if (['Paid', 'Cancelled'].includes(orderRes.data.order_status)) {
        response.cookies.set('orderId', '', { expires: new Date(0) });
        return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
      }
      return NextResponse.next();
    } else {
      const newOrderId = nanoid(8);
      url.searchParams.set('orderId', newOrderId);
      response.cookies.set('orderId', newOrderId, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sameSite: 'None',
        secure: true,
        path: '/',
      });
      return NextResponse.redirect(url);
    }
  } else {
    try {
      const tableRes = await axios.get(`https://api.pasitlab.com/tables/${tableId}`);
      const tableStatus = tableRes.data.table_status;

      if (tableStatus === 'Reserved') {
        return NextResponse.redirect(new URL('/reserved', req.nextUrl.origin));
      }

      if (tableStatus === 'Occupied') {
        if (orderIdFromUrl) {
          const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          if (orderRes.data.order_status !== 'Not Paid') {
            response.cookies.delete('orderId');
            return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
          }
          return NextResponse.next();
        } else if (storedOrderId) {
          const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
          if (orderRes.data.order_status !== 'Not Paid') {
            response.cookies.delete('orderId');
            return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
          }
          url.searchParams.set('orderId', storedOrderId.value);
          return NextResponse.redirect(url);
        }
        return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin));
      }

      if (tableStatus === 'Available') {
        if (orderIdFromUrl) {
          const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          if (orderRes.data.order_status !== 'Not Paid') {
            response.cookies.delete('orderId');
            return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
          }
          return NextResponse.next();
        } else {
          const newOrderId = nanoid(8);
          url.searchParams.set('orderId', newOrderId);
          response.cookies.set('orderId', newOrderId, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            sameSite: 'None',
            secure: true,
            path: '/',
          });
          return NextResponse.redirect(url);
        }
      }

      return NextResponse.redirect(new URL('/error', req.nextUrl.origin));
    } catch (err) {
      console.error('Error fetching table status:', err);
      return NextResponse.redirect(new URL('/error', req.nextUrl.origin));
    }
  }
}

async function adminMiddleware(req) {
  console.log('Middleware for /admin');
  return NextResponse.next();
}

export const config = {
  matcher: ['/order/:path*', '/admin/:path*'],
};
