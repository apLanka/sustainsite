import sgMail from '@sendgrid/mail';
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const msg = {
      to: options.to,
      from: options.from || process.env.FROM_EMAIL || 'noreply@sustainsite.com',
      subject: options.subject,
      html: options.html,
    };
    await sgMail.send(msg);
    console.log(`✉️  Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};
export const emailTemplates = {
  lowStockAlert: (materialName: string, currentStock: number, threshold: number, unit: string) => `
    <h2>🚨 Low Stock Alert</h2>
    <p>The following material is running low:</p>
    <ul>
      <li><strong>Material:</strong> ${materialName}</li>
      <li><strong>Current Stock:</strong> ${currentStock} ${unit}</li>
      <li><strong>Threshold:</strong> ${threshold} ${unit}</li>
    </ul>
    <p>Please consider reordering to avoid project delays.</p>
  `,
  projectCreated: (projectName: string, managerName: string) => `
    <h2>🏗️ New Project Created</h2>
    <p>Hello ${managerName},</p>
    <p>You have been assigned as the Project Manager for:</p>
    <h3>${projectName}</h3>
    <p>Please log in to the system to view project details and start planning.</p>
  `,
  sustainabilityReport: (projectName: string, score: number, category: string) => `
    <h2>🌱 Sustainability Report</h2>
    <p>Project: <strong>${projectName}</strong></p>
    <p>Latest Sustainability Score: <strong>${score}/100</strong></p>
    <p>Category: <strong>${category}</strong></p>
    <p>View detailed metrics in the dashboard.</p>
  `,
  safetyInspection: (projectName: string, riskLevel: string, findings: string) => `
    <h2>⚠️ Safety Inspection Alert</h2>
    <p>Project: <strong>${projectName}</strong></p>
    <p>Risk Level: <strong>${riskLevel}</strong></p>
    <p>Findings: ${findings}</p>
    <p>Immediate action may be required.</p>
  `,
  purchaseOrder: (
    materialName: string,
    quantity: number,
    unit: string,
    projectName: string,
    expectedDelivery: string
  ) => `
    <h2>📦 New Purchase Order</h2>
    <p>You have received a new purchase order:</p>
    <ul>
      <li><strong>Material:</strong> ${materialName}</li>
      <li><strong>Quantity:</strong> ${quantity} ${unit}</li>
      <li><strong>Project:</strong> ${projectName}</li>
      <li><strong>Expected Delivery:</strong> ${expectedDelivery}</li>
    </ul>
    <p>Please confirm receipt and update the delivery status in the system.</p>
  `,
};
export default sgMail;
