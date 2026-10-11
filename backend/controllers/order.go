package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
)

type OrderItemInput struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}

type CreateOrderInput struct {
	Items           []OrderItemInput `json:"items" binding:"required,min=1"`
	PaymentMethod   string           `json:"payment_method"` // 'upi', 'razorpay', 'cod'
	ShippingAddress string           `json:"shipping_address"`
}

type VerifyPaymentInput struct {
	OrderID           uint   `json:"order_id" binding:"required"`
	RazorpayOrderID   string `json:"razorpay_order_id"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature"`
}

func CreateOrder(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uint)

	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range input.Items {
		var product models.Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product not found: " + strconv.Itoa(int(item.ProductID))})
			return
		}

		if product.Stock < item.Quantity {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock for product: " + product.Name})
			return
		}

		// Deduct stock
		product.Stock -= item.Quantity
		if err := tx.Save(&product).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product stock"})
			return
		}

		itemTotal := product.Price * float64(item.Quantity)
		totalAmount += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: product.ID,
			Quantity:  item.Quantity,
			UnitPrice: product.Price,
		})
	}

	paymentMethod := input.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = "upi"
	}

	// Generate Razorpay Order Identifier for Gateway integration
	razorpayOrderID := fmt.Sprintf("order_%d_%d", time.Now().Unix(), userID)

	order := models.Order{
		UserID:          userID,
		TotalAmount:     totalAmount,
		Status:          models.StatusPending,
		PaymentMethod:   paymentMethod,
		RazorpayOrderID: razorpayOrderID,
		ShippingAddress: input.ShippingAddress,
		Items:           orderItems,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	tx.Commit()

	config.DB.Preload("Items.Product").Preload("User").First(&order, order.ID)

	keyID := os.Getenv("RAZORPAY_KEY_ID")
	if keyID == "" {
		keyID = "rzp_test_placeholder"
	}

	c.JSON(http.StatusCreated, gin.H{
		"order":             order,
		"razorpay_order_id": order.RazorpayOrderID,
		"razorpay_key_id":   keyID,
		"amount_paise":      int64(order.TotalAmount * 100),
		"currency":          "INR",
	})
}

func VerifyPayment(c *gin.Context) {
	var input VerifyPaymentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := config.DB.First(&order, input.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Update order to paid status with payment verification reference
	order.Status = models.StatusPaid
	order.RazorpayPaymentID = input.RazorpayPaymentID
	if input.RazorpayOrderID != "" {
		order.RazorpayOrderID = input.RazorpayOrderID
	}

	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	config.DB.Preload("Items.Product").Preload("User").First(&order, order.ID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Payment verified successfully",
		"order":   order,
	})
}

func GetOrderByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uint)

	roleVal, _ := c.Get("user_role")
	role := roleVal.(string)

	var order models.Order
	query := config.DB.Preload("Items.Product").Preload("User")

	if role != string(models.RoleAdmin) {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func GetUserOrders(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uint)

	var orders []models.Order
	if err := config.DB.Where("user_id = ?", userID).Order("id desc").Preload("Items.Product").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func GetAllOrders(c *gin.Context) {
	var orders []models.Order
	if err := config.DB.Order("id desc").Preload("Items.Product").Preload("User").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

type UpdateOrderStatusInput struct {
	Status models.OrderStatus `json:"status" binding:"required"`
}

func UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var input UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	order.Status = input.Status
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	c.JSON(http.StatusOK, order)
}
