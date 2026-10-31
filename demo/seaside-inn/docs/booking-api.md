# Seaside Inn booking API

Booking sites send us reservations here.

## Book a room

`POST /reservations`

- Header `Request-Id`: a unique id for each booking. If you send a booking again because the first try timed out, send the same `Request-Id` and we will not book it twice.
- Body: `guest`, `check_in` and `check_out` as `MM/DD/YYYY`, and `partner_ref`, your own booking number.

Replies `201` with `reservation_id`, `nights` and `total` in US dollars, or `409` with `{"error": "sold_out"}`.

## Cancel a booking

`POST /reservations/cancel`

- Body: either our `reservation_id` or your `partner_ref`.

Cancelling is free. A cancelled booking is never charged.
