# EnteKSRTC Backend API Documentation

This document outlines all the current REST API endpoints configured in the backend of the Ente KSRTC project.

**Base URL**: `/api`

---

## 1. Authentication (`/api/auth`)
*Handles user registration, login, session validation, and OTP verification.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user & get token | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP for phone/email | No |
| `GET`  | `/api/auth/me` | Get current logged-in user profile | **Yes** |
| `POST` | `/api/auth/logout` | Logout user & clear cookies | **Yes** |

---

## 2. Dashboard (`/api/dashboard`)
*Handles retrieval of user-specific dashboard metrics and data.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/` | Get dashboard overview data | **Yes** |

---

## 3. Trips (`/api/trips`)
*Handles searching for available buses and viewing seat layouts.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips/search` | Search for trips by origin, destination, & date | No |
| `GET` | `/api/trips/:tripId/seats` | Get seat availability and layout for a specific trip | No |

---

## 5. Bookings & Cancellation (`/api/bookings`)
*Handles the core reservation workflow, seat hold locking, payment verification, cancellations, and refunds.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings/checkout` | Create seat hold & payment order (returns gateway key) | **Yes** |
| `POST` | `/api/bookings/verify-payment` | Verify payment provider's success signature | **Yes** |
| `GET` | `/api/bookings/my-bookings` | List all bookings for the authenticated user | **Yes** |
| `GET` | `/api/bookings/:bookingId` | Get details of a specific booking | **Yes** |
| `GET` | `/api/bookings/:bookingId/cancel-preview` | Get cancellation refund & fee policy preview | **Yes** |
| `POST` | `/api/bookings/:bookingId/cancel` | Cancel an active booking and process refund | **Yes** |
| `POST` | `/api/bookings/webhook` | External Payment Provider Webhook handler | No |
| `POST` | `/api/bookings/admin/cleanup-holds` | Manually clean up expired seat holds | **Yes** (Admin) |

---

## 6. Stops & Autocomplete (`/api/stops`)
*Handles dynamic stop and station searching across Kerala.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stops/search` | Search stops by keyword/name (`?q=term`) | No |

---

## 7. Passenger Wallet & Refunds (`/api/wallet`)
*Handles user wallet balance, transaction ledger, and automated cancellation credits.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wallet/balance` | Get current wallet balance in Rupees and Paise | **Yes** |
| `GET` | `/api/wallet/transactions` | Paginated ledger of credit/debit transactions | **Yes** |

---

## 8. Notifications (`/api/notifications`)
*Multi-channel notification dispatch system (In-App, SMS, Email).*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/` | List user in-app notifications | **Yes** |
| `PUT` | `/api/notifications/:id/read` | Mark a notification as read | **Yes** |

---

## 9. Station Master (`/api/station-master`)
*Handles depot-level operations for fleet, staff, and trip management. Secured by `checkDepotAssignment`.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/station-master/dashboard` | Get dashboard overview data for the assigned depot | **Yes** (Station Master) |
| `GET` | `/api/station-master/staff` | List all conductors and drivers for the depot | **Yes** (Station Master) |
| `POST` | `/api/station-master/staff` | Add a new staff member to the depot | **Yes** (Station Master) |
| `PUT` | `/api/station-master/staff/:id` | Update staff status (Active/Suspended) | **Yes** (Station Master) |
| `GET` | `/api/station-master/fleet` | List all buses assigned to the depot | **Yes** (Station Master) |
| `PUT` | `/api/station-master/fleet/:id` | Update bus status (Active/Maintenance/Retired) | **Yes** (Station Master) |
| `GET` | `/api/station-master/trips` | View today's trips for the depot | **Yes** (Station Master) |
| `PUT` | `/api/station-master/trips/:id` | Update trip status and assign conductor | **Yes** (Station Master) |
| `GET` | `/api/station-master/trips/:id/manifest` | Get passenger booking manifest for a trip | **Yes** (Station Master) |

---

## 10. Admin (`/api/admin`)
*System-wide management of users, fleet, financial analytics, and comprehensive activity tracking.*

| HTTP Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List all platform users with filtering | **Yes** (Admin) |
| `POST` | `/api/admin/users` | Create new users (including Station Masters) | **Yes** (Admin) |
| `PUT` | `/api/admin/users/:id` | Update user details, role, or status | **Yes** (Admin) |
| `GET` | `/api/admin/fleet` | Retrieve system-wide fleet and route data | **Yes** (Admin) |
| `POST` | `/api/admin/fleet` | Add new bus with custom totalCapacity and depot | **Yes** (Admin) |
| `PUT` | `/api/admin/fleet/:id` | Update existing bus capacity or type | **Yes** (Admin) |
| `GET` | `/api/admin/revenue` | Paginated revenue and payment transactions | **Yes** (Admin) |
| `POST` | `/api/admin/revenue/refund/:id` | Process payment refunds | **Yes** (Admin) |
| `GET` | `/api/admin/bookings` | System-wide booking records | **Yes** (Admin) |
| `GET` | `/api/admin/activity` | Audit logs of platform activity | **Yes** (Admin) |

---
**Note:** All endpoints marked as **Protected** require a valid JSON Web Token (JWT) either passed via cookies or `Authorization: Bearer <token>` header depending on the `authMiddleware` configuration.
