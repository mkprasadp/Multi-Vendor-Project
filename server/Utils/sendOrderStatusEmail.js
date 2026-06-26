
import transporter from "../config/mailConfig.js";

const sendOrderStatusEmail = async (email,customerName,orderId,status) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Status Updated - ${status}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>📦 Order Status Updated</h2>

          <p>Hello <b>${customerName}</b>,</p>

          <p>Your order status has been updated.</p>

          <table border="1" cellpadding="10" cellspacing="0">
            <tr>
              <td><b>Order ID</b></td>
              <td>${orderId}</td>
            </tr>
            <tr>
              <td><b>Status</b></td>
              <td>${status}</td>
            </tr>
          </table>

          <br/>

          <p>Thank you for shopping with us.</p>
        </div>
      `,
    });
  } catch (error) {
    console.log("Email Error:", error.message);
  }
};

export default sendOrderStatusEmail;