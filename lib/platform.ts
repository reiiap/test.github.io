export const services = [
  { slug: "saas-mvp", name: "SaaS MVP Build", priceFrom: 18000000, description: "Full-stack SaaS with auth, billing, dashboard, and admin workflows.", features: ["Product strategy", "Next.js engineering", "Auth + database", "Vercel deployment"] },
  { slug: "automation", name: "Automation Platform", priceFrom: 12000000, description: "Operational tools, CRMs, portals, and workflow automation for fast teams.", features: ["Custom dashboards", "API integrations", "Role-based access", "Analytics"] },
  { slug: "commerce", name: "Payment Portal", priceFrom: 15000000, description: "Indonesia-ready payment architecture for QRIS, e-wallet, VA, and bank transfer.", features: ["Midtrans/Xendit ready", "Invoice system", "Webhook logs", "Order tracking"] },
];

export const portfolio = [
  { title: "Vertex Cloud Console", tags: ["SaaS", "Dashboard"], summary: "A command-center UI for cloud usage, billing, and team permissions." },
  { title: "NusaPay Checkout", tags: ["Payments", "QRIS"], summary: "Multi-provider checkout architecture with invoice and reconciliation flows." },
  { title: "FrameOps Studio", tags: ["Automation", "AI"], summary: "Internal tool suite for ticketing, reporting, and delivery operations." },
];

export const pricing = [
  { name: "Launch", price: "IDR 8jt+", description: "Landing page, auth, content, and deployment setup." },
  { name: "Scale", price: "IDR 18jt+", description: "SaaS dashboard, order flows, payments, and admin tools." },
  { name: "Enterprise", price: "Custom", description: "Dedicated product squad for complex platforms and integrations." },
];

export const faqs = [
  ["Berapa lama pengerjaan?", "Landing premium biasanya 1-2 minggu; SaaS/dashboard 3-8 minggu tergantung scope."],
  ["Payment gateway mana yang didukung?", "Arsitektur siap untuk Midtrans, Xendit, Tripay, dan Duitku dengan webhook processing."],
  ["Apakah bisa deploy ke Vercel?", "Ya. Build script menjalankan Prisma generate, migrate deploy, lalu Next build untuk production."],
];
