CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');
CREATE TYPE "PaymentProvider" AS ENUM ('MIDTRANS', 'XENDIT', 'TRIPAY', 'DUITKU', 'MANUAL');
CREATE TYPE "PaymentMethod" AS ENUM ('QRIS', 'EWALLET', 'VIRTUAL_ACCOUNT', 'BANK_TRANSFER', 'CARD', 'MANUAL');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'PENDING', 'CLOSED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PAYMENT', 'ORDER', 'TICKET');

ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

CREATE TABLE "PasswordResetToken" ("id" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL, "consumed" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Service" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "priceFrom" INTEGER NOT NULL, "features" TEXT[], "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Service_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Portfolio" ("id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "summary" TEXT NOT NULL, "image" TEXT, "url" TEXT, "tags" TEXT[], "featured" BOOLEAN NOT NULL DEFAULT false, "published" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Order" ("id" TEXT NOT NULL, "orderNumber" TEXT NOT NULL, "userId" TEXT NOT NULL, "serviceId" TEXT, "title" TEXT NOT NULL, "description" TEXT NOT NULL, "status" "OrderStatus" NOT NULL DEFAULT 'PENDING', "amount" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'IDR', "files" TEXT[], "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Order_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OrderNote" ("id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "content" TEXT NOT NULL, "isPrivate" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Payment" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "orderId" TEXT NOT NULL, "provider" "PaymentProvider" NOT NULL, "method" "PaymentMethod" NOT NULL, "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING', "amount" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'IDR', "externalId" TEXT, "checkoutUrl" TEXT, "paidAt" TIMESTAMP(3), "rawPayload" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"));
CREATE TABLE "TransactionLog" ("id" TEXT NOT NULL, "paymentId" TEXT NOT NULL, "event" TEXT NOT NULL, "payload" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TransactionLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Invoice" ("id" TEXT NOT NULL, "invoiceNumber" TEXT NOT NULL, "userId" TEXT NOT NULL, "orderId" TEXT NOT NULL, "paymentId" TEXT, "amount" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'IDR', "pdfUrl" TEXT, "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "dueAt" TIMESTAMP(3), CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Ticket" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "subject" TEXT NOT NULL, "status" "TicketStatus" NOT NULL DEFAULT 'OPEN', "priority" TEXT NOT NULL DEFAULT 'normal', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id"));
CREATE TABLE "TicketMessage" ("id" TEXT NOT NULL, "ticketId" TEXT NOT NULL, "userId" TEXT NOT NULL, "message" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Notification" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" "NotificationType" NOT NULL DEFAULT 'INFO', "title" TEXT NOT NULL, "message" TEXT NOT NULL, "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");
CREATE UNIQUE INDEX "Payment_externalId_key" ON "Payment"("externalId");
CREATE INDEX "Payment_status_provider_idx" ON "Payment"("status", "provider");
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE UNIQUE INDEX "Invoice_paymentId_key" ON "Invoice"("paymentId");
CREATE INDEX "Ticket_userId_status_idx" ON "Ticket"("userId", "status");
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionLog" ADD CONSTRAINT "TransactionLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
