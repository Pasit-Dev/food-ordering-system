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
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
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
        nextUrl.searchParams.set('orderId', storedOrderId.value);
        return NextResponse.redirect(nextUrl);
      }
    } else {
      console.log('Takeaway creating new order ID');
      const newOrderId = nanoid(8);
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('orderId', newOrderId);
      const responseWithNewOrderId = NextResponse.redirect(nextUrl);
      responseWithNewOrderId.cookies.set('orderId', newOrderId, { sameSite: 'None' });
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
        if (orderIdFromUrl) {
          const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          console.log(`Order Status: ${orderStatus.data.order_status}`)
          if (orderStatus.data.order_status === 'Paid' || orderStatus.data.order_status === 'Cancelled') {
            const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
            response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
            return response;
          } else {
            if (storedOrderId) {
              const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
              console.log(`Order Status from cookie : ${orderStatus.data.order_status}`)
              if (!orderStatus.data.order_status) {
                return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin))
              } else {
                if (orderStatus.data.order_status === 'Paid' || orderStatus.data.order_status === 'Cancelled') {
                  const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
                  response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
                  return response;
                } else {
                  return NextResponse.next();
                }
              }
              
            } else {
              console.log("not found cookie")
              return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin))
            }
          }
        } else {
          if (storedOrderId) {
            console.log("Stored Order ID : ", storedOrderId);
            const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
            console.log(`Order Status from cookie : ${orderStatus.data.order_status}`)
            if (!orderStatus.data.order_status) {
              return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin))
            } else {
              if (orderStatus.data.order_status === 'Paid' || orderStatus.data.order_status === 'Cancelled') {
                const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
                response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
                return response;
              } else {
                const nextUrl = new URL(url);
                nextUrl.searchParams.set('orderId', storedOrderId.value);
                return NextResponse.redirect(nextUrl);
              }
            }
            
          } else {
            console.log("not found cookie")
            return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin))
          }
        }
      }

      if (tableStatus === 'Available') {
        if (orderIdFromUrl) {
          const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          if (orderStatus.data.order_status === 'Paid' || orderStatus.data.order_status === 'Cancelled') {
            const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
            response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
            return response;
          } else {
            // if (orderIdFromUrl === storedOrderId) {
            //   const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
            //   if (orderStatus.data.order_status === 'Paid' || orderStatus.data.order_status === 'Cancelled') {
            //     const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
            //     response.cookies.set('orderId', '', { expires: new Date(0) }); // ✅ แก้ไขการลบ cookie
            //     return response;
            //   } else {
            //     return NextResponse.next();
            //   }
            // } else {
            //   return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin))
            // }
            return NextResponse.next()
          }
        } else {
          console.log("Table is Available, creating new order ID");
          response.cookies.set('orderId', '', { expires: new Date(0) });
        const newOrderId = nanoid(8);
        const nextUrl = new URL(url);
        nextUrl.searchParams.set('orderId', newOrderId);
        const responseWithNewOrderId = NextResponse.redirect(nextUrl);
        responseWithNewOrderId.cookies.set('orderId', newOrderId, { sameSite: 'None'});
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
