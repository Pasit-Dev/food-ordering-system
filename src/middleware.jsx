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
  const storedOrderId = req.cookies.get('orderId');

  console.log('Cookie store:', storedOrderId);
  console.log('Table id:', tableId);
  
  if (!tableId) {
    console.log('Redirection to 404 not found');
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }
  console.log('Stored Data: ', storedOrderId);
  if (tableId === 'takeaway') {
    if (storedOrderId) {
      console.log('Takeaway has stored order id');
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId}`);
      if (orderRes.data.order_status === 'Paid' || orderRes.data.order_status === 'Cancelled') {
        const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
        response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
        return response;
      } else {
        if (orderIdFromUrl) {
          console.log("1111")
          const resposne = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          const orderStatus = resposne.data.order_status;
          if (orderStatus) {
            console.log("2222")
            if (orderStatus === 'Paid' || orderStatus === 'Cancelled') {
              console.log('3333')
              const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
              response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
              return response;
            } else {
              console.log("4444")
              return NextResponse.next()
            }
          } else {
            console.log('5555')
            return NextResponse.next()
          }
        } 
        const nextUrl = new URL(url);
        nextUrl.searchParams.set('orderId', storedOrderId);
        return NextResponse.redirect(nextUrl);
      }
    } else {
      console.log('Takeaway creating new order ID');
      const newOrderId = nanoid(8);
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('orderId', newOrderId);
      const responseWithNewOrderId = NextResponse.redirect(nextUrl);
      responseWithNewOrderId.cookies.set('orderId', newOrderId, {
        sameSite: 'None',
        secure: true, // Make sure to use secure if SameSite is None
        path: '/', // Ensure the path is set correctly
      });
      return responseWithNewOrderId; 
    }
  } else {
    try {
      const response = await axios.get(`https://api.pasitlab.com/tables/${tableId}`);
      const tableStatus = response.data.table_status;

      console.log(`Table Status: ${tableStatus}`);

      if (tableStatus === 'Reserved') {
        return NextResponse.redirect(new URL('/reserved', req.nextUrl.origin));
      }
      
      if (tableStatus === 'Occupied') {
        console.log('In Occupied')
        if (orderIdFromUrl) {
          // check order status 
          const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          if (orderStatus.data.order_status !== 'Not Paid') {
            // remove cookie order id 
            const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
            console.log("Remove order id in cookie")
            response.cookies.delete('orderId');
            return response;
          } else {
            return NextResponse.next();
          }
        } else {
          if (storedOrderId) {
            const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId}`);
            console.log("Order Resposne ", orderStatus)
            console.log("Order Status ", orderStatus.data.order_status)
            if (orderStatus.data.order_status != 'Not Paid') {
              const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
              console.log("Delet order id in cookie")
              response.cookies.delete('orderId');
              return response;
            } else {
              const nextUrl = new URL(url);
              nextUrl.searchParams.set('orderId', storedOrderId);
              const responseWithNewOrderId = NextResponse.redirect(nextUrl);
              return responseWithNewOrderId;
            }
          } else {
            return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin));
          }
        }
      }
      
      if (tableStatus === 'Available') {
        console.log('In Available')
        if (orderIdFromUrl) {
          console.log("Have order id in URL")
          const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          if (orderStatus.data.status == 200) {
            console.log("Order Status ", orderStatus.data.status)
            if (orderStatus.data.order_status !== 'Not Paid') {
              const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
              response.cookies.delete('orderId');
              return response;
            } else {
              return NextResponse.next();
            }
          } else {
            console.log('Order Status ', orderStatus.data.status);
            return NextResponse.next();
          }
          
        } else {
          console.log("Haven't order id IN URL")
          const newOrderId = nanoid(8);
          const nextUrl = new URL(url);
          nextUrl.searchParams.set('orderId', newOrderId);
          const responseWithNewOrderId = NextResponse.redirect(nextUrl);
          responseWithNewOrderId.cookies.set('orderId', newOrderId, {
            sameSite: 'None',
            secure: true, // Make sure to use secure if SameSite is None
            path: '/', // Ensure the path is set correctly
          });
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

async function adminMiddleware(req) {
  console.log('Middleware for /admin');
  return NextResponse.next();
}

export const config = {
  matcher: ['/order/:path*', '/admin/:path*'],
};
