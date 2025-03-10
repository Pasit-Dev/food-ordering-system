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
  const orderIdFromUrl = url.searchParams.get('orderId');

  console.log('Table id:', tableId);

  if (!tableId) {
    console.log('Redirection to 404 not found');
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }

  if (tableId === 'takeaway') {
    console.log('Processing Takeaway Order');

    if (orderIdFromUrl) {
      console.log('Existing orderId found in URL:', orderIdFromUrl);
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
      if (orderRes.data.order_status === 'Paid' || orderRes.data.order_status === 'Cancelled') {
        const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
        response.headers.set('Clear-OrderId', 'true'); // ให้ Client ลบ orderId ออกจาก localStorage
        return response;
      }
      return NextResponse.next();
    } else {
      console.log('Creating new order ID for takeaway');
      const newOrderId = nanoid(8);
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('orderId', newOrderId);

      const responseWithNewOrderId = NextResponse.redirect(nextUrl);
      responseWithNewOrderId.headers.set('Set-OrderId', newOrderId); // ให้ Client เก็บค่า orderId
      return responseWithNewOrderId;
    }
  }

  try {
    const response = await axios.get(`https://api.pasitlab.com/tables/${tableId}`);
    const tableStatus = response.data.table_status;
    console.log(`Table Status: ${tableStatus}`);

    if (tableStatus === 'Reserved') {
      return NextResponse.redirect(new URL('/reserved', req.nextUrl.origin));
    }

    if (tableStatus === 'Occupied' || tableStatus === 'Available') {
      if (orderIdFromUrl) {
        const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
        if (!orderStatus.data.status == 404) {
          if (orderStatus.data.order_status !== 'Not Paid') {
            const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
            response.headers.set('Clear-OrderId', 'true'); // ให้ Client ลบ orderId
            return response;
          }
        }  
        return NextResponse.next();
      } else {
        console.log('Creating new order ID for dine-in');
        const newOrderId = nanoid(8);
        const nextUrl = new URL(url);
        nextUrl.searchParams.set('orderId', newOrderId);

        const responseWithNewOrderId = NextResponse.redirect(nextUrl);
        responseWithNewOrderId.headers.set('Set-OrderId', newOrderId); // ให้ Client เก็บค่า orderId
        return responseWithNewOrderId;
      }
    }

    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  } catch (err) {
    console.error(`Error fetching table status:`, err);
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }
}

async function adminMiddleware(req) {
  console.log('Middleware for /admin');
  return NextResponse.next();
}

export const config = {
  matcher: ['/order/:path*', '/admin/:path*'],
};
