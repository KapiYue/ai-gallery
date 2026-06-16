MIT License  ·  2025


README

Overview
creem-payment is a production-ready starter kit that demonstrates how to integrate Creem — a modern payment infrastructure provider — into a Next.js 15 application backed by Supabase Auth and a PostgreSQL database managed through Drizzle ORM. The template supports both one-time purchases and recurring subscription billing out of the box, including secure webhook handling, order tracking, and per-user subscription status queries.
This project answers four common developer questions:
How do I create products using the Creem Payment API?
How do I quickly sell things using simple link-based payments?
How do I implement standard checkout flows for one-time payments and subscriptions?
How do I retrieve subscription status for authenticated users without writing complex backend logic?

Technology Stack

Project Structure

Quick Start
Prerequisites
Node.js 18 or later
pnpm (recommended) — or npm / yarn
A Supabase project
A Creem merchant account with at least one product created

1. Clone the repository
2. Configure environment variables
Rename .env.example to .env.local and populate every variable:
3. Run database migrations
4. Start the development server
The application is now available at http://localhost:3000.

Environment Variables Reference

Payment Flow
The end-to-end payment flow follows these steps:
User authenticates via Supabase Auth and lands on the protected dashboard (/protected).
User clicks a pricing card. The client calls POST /api/checkout with the productId, productName, amount, and type (onetime or recurring).
The Route Handler authenticates the request via Supabase, creates a Creem checkout session, persists a checkout_sessions row in Postgres, and returns the checkout_url.
The user is redirected to the Creem-hosted checkout page to complete payment.
On success, Creem fires a checkout.completed webhook to POST /api/payment/webhook. The handler verifies the HMAC-SHA256 signature, updates the checkout session status to completed, and inserts an order record.
The user is redirected to /payment/success (or /payment/fail) where the client polls GET /api/checkout/status to confirm the session state.

Database Schema
checkout_sessions
Tracks every checkout session initiated from the frontend.

orders
Persisted after a successful checkout.completed webhook event.

API Reference
POST /api/checkout
Creates a Creem checkout session for the authenticated user.
Request body:
Response (200):

GET /api/orders
Returns all orders for the authenticated user, ordered by creation date descending.
Response (200):

GET /api/subscriptions
Fetches live subscription data from the Creem API for all recurring orders associated with the user. Returns isSubscribed: true if any subscription is active or trialing (or canceled but still within the billing period).

POST /api/subscriptions/cancel
Cancels an active subscription by calling the Creem cancellation endpoint.

POST /api/payment/webhook
Handles Creem webhook events. The middleware excludes this route from Supabase session refresh so the raw body is available for signature verification.
Supported event types:
checkout.completed — marks checkout session as completed and inserts an order
subscription.paid — updates subscription order status to paid
refund.created — updates order status to refunded

Webhook
