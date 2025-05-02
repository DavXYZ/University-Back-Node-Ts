import nodemailer, { Transporter } from "nodemailer";

class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Активация аккаунта на ${process.env.API_URL}`,
      text: "",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f7f7f7;">
          <img src="https://your-website.com/logo.png" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #333; font-size: 24px;">Добро пожаловать в нашу платформу!</h1>
          <p style="font-size: 18px; color: #555;">Для активации вашего аккаунта перейдите по следующей ссылке:</p>
          <a href="${link}" style="display: inline-block; padding: 15px 25px; font-size: 18px; color: white; background-color: #3498db; border-radius: 5px; text-decoration: none; margin-top: 20px;">Активировать аккаунт</a>
        </div>
      `,
    });
  }

  async sendResetPasswordMail(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f7f7f7;">
          <img src="https://your-website.com/logo.png" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #333; font-size: 24px;">We Received a Request to Reset Your Password</h1>
          <p style="font-size: 18px; color: #555;">If you requested a password reset, click the link below:</p>
          <a href="${link}" style="display: inline-block; padding: 15px 25px; font-size: 18px; color: white; background-color: #e74c3c; border-radius: 5px; text-decoration: none; margin-top: 20px;">Reset Your Password</a>
          <p style="font-size: 16px; color: #777; margin-top: 20px;">If you didn’t make this request, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendVerificationCodeMail(to: string, verificationCode: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Verification Code for Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f7f7f7;">
          <img src="https://your-website.com/logo.png" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #333; font-size: 24px;">Your Password Reset Verification Code</h1>
          <p style="font-size: 18px; color: #555;">Use the following code to verify your password reset request:</p>
          <h2 style="font-size: 30px; color: #3498db; font-weight: bold;">${verificationCode}</h2>
          <p style="font-size: 16px; color: #777; margin-top: 20px;">This code will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmationMail(
    to: string,
    orderId: string,
    items: { name: string; size: string; quantity: number; price: number }[],
    totalPrice: number
  ): Promise<void> {
    console.log(totalPrice);
    
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.size}</td>
          <td>${item.quantity}</td>
          <td>$${item.price}</td>
        </tr>
      `
      )
      .join("");
  
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Order Confirmation - Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f7f7f7;">
          <img src="https://your-website.com/logo.png" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #333; font-size: 24px;">Thank You for Your Order!</h1>
          <p style="font-size: 18px; color: #555;">Your order has been successfully placed.</p>
          <h2 style="color: #3498db;">Order #${orderId}</h2>
  
          <table width="100%" border="1" cellspacing="0" cellpadding="10" style="margin-top: 20px; background: white; text-align: left;">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
  
          <h2 style="color: #e74c3c; margin-top: 20px;">Total: $${totalPrice}</h2>
  
          <p style="font-size: 16px; color: #777; margin-top: 20px;">We will notify you when your order is shipped.</p>
        </div>
      `,
    });
  }
  
}

export const mailService = new MailService();
export default mailService;
