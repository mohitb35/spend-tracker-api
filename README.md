# spend-tracker-api

API server for spend-trackr, a simple spend tracking app that allows users to track spends, and view spends by month.

Frontend repo - https://github.com/mohitb35/spend-tracker

Base URL - http://spend-tracker-35-api.herokuapp.com/

## Routes

### 1. Register User

Creates a user account, responding with status 201 and a user object (with token for authentication) on success.

**_Endpoint:_**

```bash
Method: POST
Type: RAW
URL: {{url}}/register/
```

**_Headers:_**

| Key          | Value            | Description |
| ------------ | ---------------- | ----------- |
| Content-Type | application/json |             |

**_Body:_**

```js
{
	"name":"Mohit",
	"email":"mohit200@mailinator.com",
	"password":"qwerty"
}
```

### 2. Login

Allows the user to log in with email and password, responding with status 200 and a user object (with token for authentication) on success.

**_Endpoint:_**

```bash
Method: POST
Type: RAW
URL: {{url}}/login/
```

**_Headers:_**

| Key          | Value            | Description |
| ------------ | ---------------- | ----------- |
| Content-Type | application/json |             |

**_Body:_**

```js
{
	"email":"mohit200@mailinator.com",
	"password": "qwerty"
}
```

### 3. Logout

Logs the user out of the app and clears the token. Returns status 200 on success.

**_Endpoint:_**

```bash
Method: GET
Type: RAW
URL: {{url}}/logout/
```

**_Body:_**

```js
{
	"userId":"6",
	"token": "4I56d-3zW56DB-4DHjXdklERfELwXg4sII2tcPQzoO4="
}
```

### 4. Get Spend List

Returns a list of spends for the user based on min and max date. Returns status 200 on success.

**_Endpoint:_**

```bash
Method: GET
Type: RAW
URL: {{url}}/spend/
```

**_Headers:_**

| Key          | Value            | Description |
| ------------ | ---------------- | ----------- |
| Content-Type | application/json |             |

**_Body:_**

```js
{
	"token":"{{token}}",
	"minDate": "2020-01-01",
	"maxDate": "2020-01-30"
}
```

### 5. Add Spend

Adds a spend, returning status 201 on success.

**_Endpoint:_**

```bash
Method: POST
Type: RAW
URL: {{url}}/spend/
```

**_Headers:_**

| Key          | Value            | Description |
| ------------ | ---------------- | ----------- |
| Content-Type | application/json |             |

**_Body:_**

```js
{
	"token":"{{token}}",
	"name":"do re mi fa so la ti do",
	"amount":1000,
	"categoryId":1,
	"subCategoryId":1,
	"purchaseDate":"2017-06-15"
}
```

### 6. Edit Spend

Edits a spend, returning status 200 on success

**_Endpoint:_**

```bash
Method: PUT
Type: RAW
URL: {{url}}/spend/:id
```

**_Headers:_**

| Key          | Value            | Description |
| ------------ | ---------------- | ----------- |
| Content-Type | application/json |             |

**_Path variables:_**

| Key | Value | Description |
| --- | ----- | ----------- |
| id  | 3     |             |

**_Body:_**

```js
{
	"token": "Is3vsSnug52+eeUi3xV4dA==",
    "purchase_date": "2017-06-11T18:30:00.000Z",
    "name": "eggs",
    "amount": "90.00",
    "category_id": "1",
    "sub_category_id": "1"
}
```

### 7. Delete Spend

Deletes a spend, if authenticated. Returns status 200 on success.

**_Endpoint:_**

```bash
Method: DELETE
Type: RAW
URL: {{url}}/spend/:id
```

**_Headers:_**

| Key          | Value            | Description |
| ------------ | ---------------- | ----------- |
| Content-Type | application/json |             |

**_Path variables:_**

| Key | Value | Description |
| --- | ----- | ----------- |
| id  | 4     |             |

**_Body:_**

```js
{
	"token": "Is3vsSnug52+eeUi3xV4dA=="
}
```

### 8. Get Category List

Returns the full list of spend categories. Returns status 200 on success.

**_Endpoint:_**

```bash
Method: GET
Type:
URL: {{url}}/spend/categories
```

### 9. Get Subcategory List

Returns the full list of subcategories for a given category (specified with categoryId). Returns status 200 on success.

**_Endpoint:_**

```bash
Method: GET
Type:
URL: {{url}}/spend/categories/:categoryId
```

**_URL variables:_**

| Key        | Value | Description |
| ---------- | ----- | ----------- |
| categoryId | 1     |             |

### 10. Get Spend Date Range

Returns dates of a users first and last spends. Returns status 200 on success.

**_Endpoint:_**

```bash
Method: GET
Type:
URL: {{url}}/spend/:token/daterange
```

**_Path variables:_**

| Key   | Value     | Description |
| ----- | --------- | ----------- |
| token | {{token}} |             |

### 11. Get Spend Summary

Returns a category/subcategory wise breakup of spends for a user based on provided dates. Returns status 200 on success.

**_Endpoint:_**

```bash
Method: GET
Type:
URL: {{url}}/spend/:token/summary/:categoryId
```

**_Query params:_**

| Key     | Value      | Description |
| ------- | ---------- | ----------- |
| minDate | 2022-01-01 |             |
| maxDate | 2022-01-31 |             |

**_Path variables:_**

| Key        | Value     | Description                                            |
| ---------- | --------- | ------------------------------------------------------ |
| token      | {{token}} |                                                        |
| categoryId | 0         | Leave 0 for all categories, otherwise send category Id |
