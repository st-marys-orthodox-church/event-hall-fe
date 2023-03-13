import sendgrid from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgrid.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY as string);

async function sendEmail(req: NextApiRequest, res: NextApiResponse) {
  try {
    // if (process.env.NEXT_PUBLIC_DEV) {
      console.log('REQ.BODY', req.body);
    // } else {
      await sendgrid.send({
        to: 'eventhall@saintmaryro.org', // Your email where you'll receive emails
        from: 'eventhall@saintmaryro.org', // your website email address here
        subject: `Inquiry for Fellowship Event Hall`,
        html: `
          <div>
            <h1>New Inquiry from ${req.body.name}</h1>
            <div style="color: #7f7f7f; font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
              <span>Email Address: ${req.body.email}</span><br />
              <span>Date Sent: ${new Date(
                req.body.date
              ).toLocaleString()}</span>
            </div>
            <div style="display: flex; flex-direction: column; margin-top: 32px; gap: 6px;">
              <span>Capacity: ${req.body.cap}</span><br />
              <span>Message: ${req.body.message}</span>
            </div>
          </div>
        `,
      });
    // }
  } catch (error: any) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ error: '' });
}

export default sendEmail;
