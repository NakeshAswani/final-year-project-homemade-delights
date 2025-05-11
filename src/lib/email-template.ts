import { OrderDetails } from "./interfaces";

export const orderEmailTemplate = (orderDetails: OrderDetails, isSeller: boolean) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .order-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 1.2em; font-weight: bold; }
        .status { 
            color: ${orderDetails.status === 'CANCELLED' ? '#dc3545' : '#28a745'};
            padding: 5px 10px;
            border-radius: 3px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>${isSeller ? 'New Order Received' : 'Order Confirmation'}</h2>
        </div>
        
        <div class="order-details">
            <p><strong>Order ID:</strong> #${orderDetails.id}</p>
            <p><strong>Status:</strong> <span class="status">${orderDetails.status}</span></p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <h3>Products:</h3>
        <table>
            <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
            ${orderDetails.items.map((item: any) => `
                <tr>
                    <td>${item.product.name}</td>
                    <td>$${item.product.discounted_price}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.quantity * item.product.discounted_price}</td>
                </tr>
            `).join('')}
        </table>

        <div class="total">
            <p>Total Amount: $${orderDetails.total}</p>
        </div>

        <h3>Shipping Address:</h3>
        <p>
            ${orderDetails.address.address}<br>
            ${orderDetails.address.city}, ${orderDetails.address.state}<br>
            ${orderDetails.address.country} - ${orderDetails.address.pincode}
        </p>
    </div>
</body>
</html>
`;