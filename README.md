# Royal Heritage

A polished, responsive storefront prototype for premium acrylic frames and heritage art.

## Run locally

From this folder:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Demo features

- Responsive product catalogue and category filters
- Size-wise pricing and product detail modal
- Persistent cart, quantity controls, delivery fee, and `ROYAL10` demo coupon
- Custom photograph upload form
- Address, UPI/Razorpay-style demo checkout, and order confirmation
- Supplier enquiry and marketplace-ready catalogue pitch
- Admin dashboard with order summary and CSV report download
- WhatsApp order shortcut and PWA manifest

Data is stored locally in the browser for this frontend prototype. Replace the demo payment and local storage layer with Razorpay and Supabase/Firebase for production.
