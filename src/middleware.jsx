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
  console.log('Middleware for /order')
  const url = req.nextUrl;
  const tableId = url.searchParams.get('tableId');
  const orderIdFromUrl = url.searchParams.get('orderId');
  const storedOrderId = req.cookies.get('orderId');

  console.log('Cookie store', storedOrderId);
  console.log('Table id: ', tableId)
  if (!tableId) {
    console.log("Redirection to 404 not found")
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }
  if (orderIdFromUrl) {
    // const orderRes = await axios.get(`http://localhost:8080/orders/not-paid/${orderIdFromUrl}`);
    // const orderResId = orderRes.data.order_id;
    // if (orderResId) {
    //   return NextResponse.next();
    // } else {
    //   return NextResponse.redirect(new URL('/404', req.nextUrl.origin))
    // }
  }
  if (tableId === 'takeaway') {
    // if (orderIdFromUrl) {
    //   const orderRes = await axios.get(`http://localhost:8080/orders/not-paid/${orderIdFromUrl}`)
    //   const orderResId = orderRes.data.order_id;
    //   if (orderResId) {
    //     return NextResponse.next(); // ถ้ามี orderId ใน URL แล้ว ให้ดำเนินการต่อไป
    //   }
    // }
    // if (storedOrderId.value) {
    //   const orderRes = await axios.get(`http://localhost:8080/orders/not-paid/${storedOrderId.value}`)
    //   const orderResId = orderRes.data.order_id;
    //   if (storedOrderId.value == orderResId) {
    //     const nextUrl = new URL(url);
    //     nextUrl.searchParams.set('orderId', orderResId);
    //     const responseWithNewOrderId = NextResponse.redirect(nextUrl);
    //     return responseWithNewOrderId;
    //   } else {
    //     const newOrderId = nanoid(8);
    //     const nextUrl = new URL(url);
    //     nextUrl.searchParams.set('orderId', newOrderId);
  
    //     const responseWithNewOrderId = NextResponse.redirect(nextUrl);
  
    //     responseWithNewOrderId.cookies.delete('orderId');
    //     responseWithNewOrderId.cookies.set('orderId', newOrderId, { httpOnly: true });
    //     return responseWithNewOrderId;
    //   }
     
    // } else {
    //   const newOrderId = nanoid(8);
    //     const nextUrl = new URL(url);
    //     nextUrl.searchParams.set('orderId', newOrderId);
  
    //     const responseWithNewOrderId = NextResponse.redirect(nextUrl);
  
    //     responseWithNewOrderId.cookies.delete('orderId');
    //     responseWithNewOrderId.cookies.set('orderId', newOrderId, { httpOnly: true });
    //     return responseWithNewOrderId;
    // }
    if (orderIdFromUrl) {
      return NextResponse.next()
    }
    
        const newOrderId = nanoid(8);
        const nextUrl = new URL(url);
        nextUrl.searchParams.set('orderId', newOrderId);
  
        const responseWithNewOrderId = NextResponse.redirect(nextUrl);
  
        responseWithNewOrderId.cookies.delete('orderId');
        responseWithNewOrderId.cookies.set('orderId', newOrderId, { httpOnly: true });
        return responseWithNewOrderId;
  } else {
    try {
      const response = await axios.get(`http://localhost:8080/tables/${tableId}`);
      const table = response.data;
      const tableStatus = table.table_status;

      console.log(`Table Status: ${tableStatus}`);

      if (tableStatus === 'Occupied') {
        // ถ้าโต๊ะถูกจับจองแล้ว
        if (orderIdFromUrl === storedOrderId.value) {
          return NextResponse.next();
        } else {
          const orderRes = await axios.get(`http://localhost:8080/tables/order/${tableId}`);
          const orderResId = orderRes.data.order_id;
          if (orderResId === storedOrderId.value) {
            const nextUrl = new URL(url);
            nextUrl.searchParams.set('orderId', orderResId);
            const responseWithNewOrderId = NextResponse.redirect(nextUrl);
            return responseWithNewOrderId;
          } else {
            return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
          }
        }
      } else if (tableStatus === 'Reserved') {
        return NextResponse.redirect(new URL('/reserved', req.nextUrl.origin));
      } else if (tableStatus === 'Available') {
        // เพิ่มการเช็คว่า orderId มีอยู่ใน query หรือยัง
        console.log("Table Status  is Available")
        if (orderIdFromUrl) {
          console.log("Have order id in url")
          return NextResponse.next(); // ถ้ามี orderId ใน URL แล้ว ให้ดำเนินการต่อไป
        }
        console.log("Don't have order id in url")
        const newOrderId = nanoid(8);
        const nextUrl = new URL(url);
        nextUrl.searchParams.set('orderId', newOrderId);

        const responseWithNewOrderId = NextResponse.redirect(nextUrl);

        responseWithNewOrderId.cookies.delete('orderId');
        responseWithNewOrderId.cookies.set('orderId', newOrderId, { httpOnly: true });
        return responseWithNewOrderId;
      } else {
        return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
      }
    } catch (err) {
      console.error(`Error fetching table status: `, err);
      return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
    }
  }
};


async function adminMiddleware(req) {
  console.log('Middleware for /admin');
  return NextResponse.next();
}


export const config = {
  matcher: ['/order/:path*', '/admin/:path*'], // กำหนดเส้นทางที่จะใช้ middleware นี้
};
