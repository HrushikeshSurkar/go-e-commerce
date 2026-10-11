package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Enable Global Middlewares
	r.Use(middleware.CORSMiddleware())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "go-e-commerce-api",
		})
	})

	api := r.Group("/api/v1")
	{
		// Authentication & User
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.POST("/forgot-password/request", controllers.RequestForgotPasswordOTP)
			auth.POST("/forgot-password/reset", controllers.ResetPasswordWithOTP)
			auth.GET("/profile", middleware.AuthMiddleware(), controllers.GetProfile)
		}

		// Categories
		categories := api.Group("/categories")
		{
			categories.GET("", controllers.GetCategories)
			categories.POST("", middleware.AuthMiddleware(), middleware.RequireAdmin(), controllers.CreateCategory)
		}

		// Products
		products := api.Group("/products")
		{
			products.GET("", controllers.GetProducts)
			products.GET("/:id", controllers.GetProductByID)
			products.POST("", middleware.AuthMiddleware(), middleware.RequireAdmin(), controllers.CreateProduct)
			products.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireAdmin(), controllers.UpdateProduct)
			products.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireAdmin(), controllers.DeleteProduct)
		}

		// Users (Admin Only Management)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware(), middleware.RequireAdmin())
		{
			users.GET("", controllers.GetAllUsers)
			users.GET("/:id", controllers.GetUserByID)
			users.POST("", controllers.CreateUser)
			users.PUT("/:id", controllers.UpdateUser)
			users.DELETE("/:id", controllers.DeleteUser)
		}

		// Orders
		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware())
		{
			orders.POST("", controllers.CreateOrder)
			orders.POST("/verify-payment", controllers.VerifyPayment)
			orders.GET("/my-orders", controllers.GetUserOrders)
			orders.GET("/:id", controllers.GetOrderByID)
			orders.GET("", middleware.RequireAdmin(), controllers.GetAllOrders)
			orders.PATCH("/:id/status", middleware.RequireAdmin(), controllers.UpdateOrderStatus)
		}
	}
}
