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
  
  // Debugging the searchParams
  console.log('URL Search Params:', url.searchParams);
  
  const orderIdFromUrl = url.searchParams.has('orderId') ? url.searchParams.get('orderId') : null;
  
  console.log("orderIdFromUrl: ", orderIdFromUrl);  // Debugging the orderId
  
  const storedOrderId = req.cookies.get('orderId');
  
  console.log('Cookie store:', storedOrderId);
  console.log('Table id:', tableId);
  
  if (!tableId) {
    console.log('Redirection to 404 not found');
    return NextResponse.redirect(new URL('/404', req.nextUrl.origin));
  }

  if (storedOrderId) {
    try {
      console.log("found order id in cookie and check table id matching ")
      const resposne = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
      const data = resposne.data;
      console.log('fetching check table id matching ')
      if (data.status != 404) {
        console.log("fetch table id stataus not 404", data, tableId);
        if (data.order_status == 'Not Paid') {
          console.log("order status is not paid") 
          if (tableId != 'takeaway' && tableId != data.table_id) {
          if (data.table_id != null) {
            console.log('table id -> table id');
            const nextUrl = new URL(url);
            nextUrl.searchParams.set('tableId', data.table_id)
            nextUrl.searchParams.set('orderId', storedOrderId.value);
            const responseWithOldOrderId = NextResponse.redirect(nextUrl);
            return responseWithOldOrderId;
          } else if (data.table_id == null) {
            console.log('tableid -> takeaway')
            const nextUrl = new URL(url);
            nextUrl.searchParams.set('tableId', 'takeaway');
            nextUrl.searchParams.set('orderId', storedOrderId.value);
            const responseWithOldOrderId = NextResponse.redirect(nextUrl);
            return responseWithOldOrderId;
          }
          } else if (tableId == 'takeaway' && data.table_id != null) {
            console.log('takeaway -> tableid')
          const nextUrl = new URL(url);
          nextUrl.searchParams.set('tableId', data.table_id);
          nextUrl.searchParams.set('orderId', storedOrderId.value);
          const responseWithOldOrderId = NextResponse.redirect(nextUrl);
          return responseWithOldOrderId;
            } 
        }
      } else {
        if (tableId == 'takeaway') {
          console.log("table id is takeaway:", tableId);
          if (orderIdFromUrl) {
            return NextResponse.next();
          } else {
            const nextUrl = new URL(url);
          nextUrl.searchParams.set('orderId', storedOrderId.value);
          return NextResponse.redirect(nextUrl);
          }
        } else {
          console.log('table id is not takeaway', tableId);
        }
      }
    } catch (err) {
      console.error("Error fetching order status:", err);
    }
  }


  if (tableId === 'takeaway') {
    if (storedOrderId) {
      console.log('Takeaway has stored order id');
      const orderRes = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
      if (orderRes.data.order_status != 'Not Paid') {
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
            if (orderStatus != 'Not Paid') {
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
      responseWithNewOrderId.cookies.set('orderId', newOrderId, {
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
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
          console.log("Order ID From Url ", typeof orderIdFromUrl);
          const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${orderIdFromUrl}`);
          console.log("Resposne Order Status ", orderStatus.data)
          if (orderStatus.data.status != 404) {
            if (orderStatus.data.order_status != 'Not Paid') {
              // remove cookie order id 
              const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
              console.log("Remove order id in cookie")
              response.cookies.delete('orderId');
              return response;
            } else {
              return NextResponse.next();
            }
          } else {
            
          }
        } else {
          if (storedOrderId) {
            const orderStatus = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
            const { table_id, order_status } = orderStatus.data;
            console.log("Order Resposne ", orderStatus)
            console.log("Order Status ", order_status)
            if (orderStatus.data.status != 404) {
              console.log('order status is not undefined')
              if (order_status != 'Not Paid') {
                const response = NextResponse.redirect(new URL('/404', req.nextUrl.origin));
                console.log("Delet order id in cookie")
                response.cookies.delete('orderId');
                return response;
              } else {
                // if (table_id == tableId) {
                  const nextUrl = new URL(url)
                nextUrl.searchParams.set('orderId', storedOrderId.value);
                const responseWithNewOrderId = NextResponse.redirect(nextUrl);
                return responseWithNewOrderId;
                // } else {
                //   // clear cookie and create create new order id 
                // }
  
              }
            } else {
              return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin));
            }
          } else {
              
          return NextResponse.redirect(new URL('/occupied', req.nextUrl.origin));
            } 
        } 
      }
      
      if (tableStatus === 'Available') {
        console.log('In Available')
        if (storedOrderId) {
          try {
            console.log("found order id in cookie and check table id matching ")
            const resposne = await axios.get(`https://api.pasitlab.com/orders/status/${storedOrderId.value}`);
            const data = resposne.data;
            console.log('fetching check table id matching ')
            if (data.status != 404) {
              console.log("fetch table id stataus not 404", data, tableId);
              if (data.order_status == 'Not Paid') {
                console.log("order status is not paid") 
                const nextUrl = new URL(url);
                  nextUrl.searchParams.set('tableId', data.table_id);
                  nextUrl.searchParams.set('orderId', storedOrderId.value);
                  const responseWithOldOrderId = NextResponse.redirect(nextUrl);
                  return responseWithOldOrderId;
              }
            }
          } catch (err) {
            console.error("Error fetching order status:", err);
          }
        }
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
            expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
            sameSite: 'None',
            secure: true, // Make sure to use secure if SameSite is None
            path: '/', // Ensure the path is set correctly
          });
          return responseWithNewOrderId;
        }
      }
      console.log("Error ....")
      return NextResponse.redirect(new URL('/error', req.nextUrl.origin));
    } catch (err) {
      console.error(`Error fetching table status:`, err);
      return NextResponse.redirect(new URL('/error', req.nextUrl.origin));
    }
  }
}

async function adminMiddleware(req) {
  console.log('Middleware for /admin');
  
  // Retrieve cookies from the headers using Next.js 'cookies' helper
  const token = req.cookies.get('auth_token');
  // Check if token is missing
  if (!token) {
    if (req.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.next();
    }
    console.log('No token found, redirection to /admin/login');
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl.origin));
  } else {
    if (req.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl.origin))
    }
  }

  console.log("Token found, allowing access to /admin");
  return NextResponse.next();
}

export const config = {
  matcher: ['/order/:path*', '/admin/:path*'],
};
