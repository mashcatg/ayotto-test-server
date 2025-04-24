# Backend Documentation

## 📌 About This File
This document serves as the official backend documentation for the Ayotto . It will include details about the backend architecture, API endpoints, and other important information for developers.

## 🚀 Getting Started




 ## 🔗 API Endpoints

 ### 🔒 Register
 
**POST** `/api/auth/register`  
 **Request:**  
```py
{ "name", "phone" ,"password" }
```
**Response:**  
```py
{
    "success": true,
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6I......",
    "student": {
        "id": "67a02b2218f247effa32a84c",
        "name": "Mashraf Aiman",
        "phone": 8801724373117,
        "role": "user"
    }
}
```
### 🔒 Login
 
**POST** `/api/auth/login`  
 **Request:**  
```py
{ "phone" ,"password" }
```
**Response:**  
```py
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cC....."
}
```  
### 💁 Forgot Password
 
**POST** `/api/auth/forgot-password`  
 **Request:**  
```py
{ "phone" }
```
**Response:**  
```py
{
    "success": true,
    "message": "OTP sent successfully"
}
```

### 🔃 Reset Password
 
**POST** `/api/auth/reset-password`  
 **Request:**  
```py
{ "phone", "otp", "newPassword" }
```
**Response:**  
```py
{
    "success": true,
    "message": "Password reset successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
}
```

### ➕ Create Batch
 
**POST** `/api/batch/`  
 **Request:**  
```py
{ "name" }
```
**Response:**  
```py
{
    "name": "SSC2028",
    "createdBy": "67a02b2218f247effa32a84c",
    "_id": "67a0e6185f0cc1d78349e875",
    "createdAt": "2025-02-03T15:51:52.508Z",
    "updatedAt": "2025-02-03T15:51:52.508Z",
}
```
### 👀 Fetch Batches
 
**GET** `/api/batch`  
**Response:**  
```py
[
    {
        "_id": "67a0812a6c2378d288299a64",
        "name": "HSC2024",
        "createdBy": "67a02b2218f247effa32a84c",
        "createdAt": "2025-02-03T08:41:14.541Z",
        "updatedAt": "2025-02-03T08:41:14.541Z",
        "__v": 0
    },
    {
        "_id": "67a08162e3a749ba06868677",
        "name": "HSC2025",
        "createdBy": "67a02b2218f247effa32a84c",
        "createdAt": "2025-02-03T08:42:10.026Z",
        "updatedAt": "2025-02-03T08:42:10.026Z",
        "__v": 0
    }
]
```
### 🔃 Update Batch
 
**PUT** `/api/batch/:id`  
 **Request:**  
```py
{ "name" }
```
**Response:**  
```py
{
    "_id": "67a08168e3a749ba0686867a",
    "name": "SSC2026",
    "createdBy": "67a02b2218f247effa32a84c",
    "createdAt": "2025-02-03T08:42:16.105Z",
    "updatedAt": "2025-02-03T08:43:30.111Z",
    "__v": 0
}
```

### 🔃 Delete Batch
 
**DELETE** `/api/batch/:id`  
**Response:**  
```py
{ "message": "Batch deleted successfully" }
```

## 🛠️ Development Guidelines
 

---
> ✍️ **Note:** This file is a work in progress. Developers should update it as they add new features or changes to the backend.
