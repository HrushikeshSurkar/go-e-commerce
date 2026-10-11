package main

import (
	"log"
	"os"

	"backend/config"
	"backend/models"
	"backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load environment variables
	config.LoadEnv()

	// Connect Database
	db := config.ConnectDB()
	if db != nil {
		log.Println("Running AutoMigrate for database models...")
		err := db.AutoMigrate(
			&models.User{},
			&models.Category{},
			&models.Product{},
			&models.Order{},
			&models.OrderItem{},
			&models.EmailOTP{},
		)
		if err != nil {
			log.Fatalf("Database auto-migration failed: %v", err)
		}
		log.Println("Database migration completed successfully.")
		config.SeedDatabase(db)
	} else {
		log.Println("Running in offline/mock database mode (PostgreSQL instance not connected).")
	}

	// Initialize Gin engine
	r := gin.Default()

	// Setup routes
	routes.SetupRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
