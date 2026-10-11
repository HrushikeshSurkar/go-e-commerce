package com.goecommerce.app.data.network

import com.goecommerce.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

data class OrderItemRequest(
    val product_id: Long,
    val quantity: Int
)

data class CreateOrderRequest(
    val items: List<OrderItemRequest>
)

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<User>

    @GET("products")
    suspend fun getProducts(
        @Query("category_id") categoryId: Long? = null,
        @Query("search") search: String? = null
    ): Response<List<Product>>

    @GET("products/{id}")
    suspend fun getProductById(@Path("id") id: Long): Response<Product>

    @GET("categories")
    suspend fun getCategories(): Response<List<Category>>

    @POST("orders")
    suspend fun createOrder(
        @Header("Authorization") token: String,
        @Body request: CreateOrderRequest
    ): Response<Order>

    @GET("orders/my-orders")
    suspend fun getMyOrders(
        @Header("Authorization") token: String
    ): Response<List<Order>>
}
