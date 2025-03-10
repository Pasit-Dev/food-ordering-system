import axios from 'axios';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const url = req.nextUrl;
  const tableId = url.searchParams.get('tableId');
  const orderIdFromUrl = url.searchParams.get('orderId'); // ดึงจาก URL
  console.log('Table id:', tableId);

  if (!tableId) {
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }

  // ใช้ orderId จาก URL (แทนที่จาก cookies)
  if (tableId === 'takeaway') {
    if (orderIdFromUrl) {
      // ทำงานกับ orderId ที่มาจาก URL
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
      if (orderRes.data.order_status === 'Paid' || orderRes.data.order_status === 'Cancelled') {
        const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
        return response;
      } else {
        return NextResponse.next();
      }
    } else {
      const newOrderId = nanoid(8);
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('orderId', newOrderId);
      const responseWithNewOrderId = NextResponse.redirect(nextUrl);
      return responseWithNewOrderId;
    }
  } else {
    // handle other table statuses
    try {
      const response = await axios.get(`https://api.pasitlab.com/tables/${tableId}`);
      const tableStatus = response.data.table_status;

      if (tableStatus === 'Reserved') {
        return NextResponse.redirect(new URL('/reserved', req.nextUrl.origin));
      }

      if (tableStatus === 'Occupied' || tableStatus === 'Available') {
        if (orderIdFromUrl) {
          const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          if (orderStatus.data.order_status !== 'Not Paid') {
            const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
            return response;
          }
          return NextResponse.next();
        } else {
          const newOrderId = nanoid(8);
          const nextUrl = new URL(url);
          nextUrl.searchParams.set('orderId', newOrderId);
          const responseWithNewOrderId = NextResponse.redirect(nextUrl);
          return responseWithNewOrderId;
        }
      }

      return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
    } catch (err) {
      console.error(`Error fetching table status:`, err);
      return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
    }
  }
}
