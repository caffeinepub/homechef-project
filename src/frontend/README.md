# HomeChef Kitchen - Frontend

A React + TypeScript frontend for a home-kitchen food ordering and chef booking platform built on the Internet Computer.

## Features

- **Internet Identity Authentication**: Secure login with Internet Computer's identity system
- **Menu Browsing**: Browse available dishes by category
- **Shopping Cart**: Add items, adjust quantities, and checkout
- **Order Tracking**: View order status and history with real-time updates
- **Chef Booking**: Request chef services for home parties and events
- **Admin Dashboard**: Manage menu items, orders, and bookings (admin-only)
- **Razorpay Payments**: Secure payment processing for orders and bookings

## Payment Provider

**Important:** This application uses **Razorpay** as the payment provider. Stripe is not supported in this build.

To configure payments:
1. Log in as an admin
2. Navigate to the Admin Dashboard
3. Enter your Razorpay secret key when prompted
4. Configure allowed countries for payments

Get your Razorpay credentials from the [Razorpay Dashboard](https://dashboard.razorpay.com/).

## Tech Stack

- React 19 + TypeScript
- TanStack Router for routing
- TanStack Query for server state management
- Tailwind CSS + shadcn/ui for styling
- Internet Identity for authentication
- Razorpay for payments

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- DFX (Internet Computer SDK)

### Installation

1. Install dependencies:
