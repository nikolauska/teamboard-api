# Teamboard API

This package contains the RESTful service of the Teamboard product.

## Installation

Run the following command
```
npm install && npm start
```

## Testing

Run the following command
```
npm test
```
Or alternatively
```
gulp test
```

## API Docs

The root path for the API is `/api/v1`, where `v1` stands for the version.

### Auth

```
GET /auth
```
Returns the user tied to given access-token.

```
POST /auth/login
{
  "email":    "testi",
  "password": "testi"
}
```
Exchanges the given credentials for an access-token. The access token is
returned in the `x-access-token` header.

```
POST /auth/register
{
  "email":    "testi",
  "password": "testi"
}
```
Creates a new user.

```
POST /auth/logout
```
Removes the given token from the matching user, essentially logging the user
out.


### User

```
GET /users
GET /users/:user_id
```
Returns either an array of users or a single user.


### Board

```
GET /boards
GET /boards/:board_id
```
Returns either an array of boards or a single board. When requesting a specific
board identified by the `board_id`, the `tickets` are also returned.

```
POST /boards
{
  "name": "testi",
  "info": "testi"
}
```
Creates a new board, the user making the request is set as the owner.

```
PUT /boards/:board_id
{
  "name": "testi",
  "info": "testi"
}
```
Updates the board `name` and `info` attributes. Also accepts partial updates.
Requires the user making the request to be the `owner` of the board.

```
DELETE /boards/:board_id
```
Deletes the requested board. Requires the user making the request to be the
`owner` of the board.


### Board Members

```
GET /boards/:board_id/users
```
Returns an object contaning the `owner` and `members` attributes. The `members`
field is an array of users.

```
GET /boards/:board_id/users/:user_id
```
Returns a single user from the board, can be either the owner or one of the
members.

```
POST /boards/:board_id/users
{
  "id": "UserIdAttribute"
}
```
Adds the given user to `members` on the board specified by `board_id`. Requires
the user making the request to be the `owner` of the specified board.

```
DELETE /boards/:board_id/users/:user_id
```
Removes the user specified by `user_id` from `members` on the board specified by
`board_id`. Requires the user making the request to be the `owner` of the
specified board.


### Tickets

```
GET /boards/:board_id/tickets
GET /boards/:board_id/tickets/:ticket_id
```
Returns either an array of tickets or a single ticket belonging to the board
specified by `board_id`.

```
POST /boards/:board_id/tickets
{
  "heading":  "cool heading",
  "content":  "super important stuff"
  "position": { "x": 0, "y": 0, "z": 0 }
}
```
Creates a new ticket on the board specified by `board_id`. Requires the user
making the request to be at least a member on the board.

```
DELETE /boards/:board_id/tickets/:ticket_id
```
Deletes the ticket specified by `ticket_id` from the board specified by
`board_id`. Requires the user making the request to be at least a member on the
board.
