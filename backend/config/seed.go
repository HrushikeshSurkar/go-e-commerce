package config

import (
	"log"

	"backend/models"
	"backend/utils"

	"gorm.io/gorm"
)

func SeedDatabase(db *gorm.DB) {
	if db == nil {
		return
	}

	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("Database already seeded. Skipping initial seed.")
		return
	}

	log.Println("Seeding initial database demo data...")

	// 1. Seed Demo Users
	adminPassword, _ := utils.HashPassword("Admin@123")
	customerPassword, _ := utils.HashPassword("Customer@123")

	admin := models.User{
		Name:     "Admin Store Manager",
		Email:    "admin@ecommerce.com",
		Password: adminPassword,
		Role:     models.RoleAdmin,
	}

	customer := models.User{
		Name:     "John Doe",
		Email:    "customer@ecommerce.com",
		Password: customerPassword,
		Role:     models.RoleCustomer,
	}

	db.Create(&admin)
	db.Create(&customer)

	// 2. Seed Categories
	electronics := models.Category{
		Name:        "Electronics",
		Description: "Smart gadgets, premium audio, and modern workstations.",
	}
	apparel := models.Category{
		Name:        "Apparel & Wearables",
		Description: "Minimalist fashion, lifestyle apparel, and smart accessories.",
	}
	home := models.Category{
		Name:        "Home & Living",
		Description: "Curated modern home essentials and workspace decor.",
	}

	db.Create(&electronics)
	db.Create(&apparel)
	db.Create(&home)

	// 3. Seed Products
	products := []models.Product{
		{
			Name:        "SonicPro Wireless ANC Headphones",
			Description: "High-fidelity spatial audio, 45-hour battery life, and active noise cancellation.",
			Price:       299.99,
			Stock:       45,
			ImageURL:    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
			CategoryID:  electronics.ID,
		},
		{
			Name:        "UltraMechanical Wireless Keyboard",
			Description: "Custom mechanical switches, CNC machined aluminum chassis, RGB backlighting.",
			Price:       159.50,
			Stock:       30,
			ImageURL:    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
			CategoryID:  electronics.ID,
		},
		{
			Name:        "Precision Ergonomic Laser Mouse",
			Description: "Hyper-fast scroll wheel, 8K DPI darkfield sensor, rechargeable USB-C battery.",
			Price:       89.00,
			Stock:       60,
			ImageURL:    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
			CategoryID:  electronics.ID,
		},
		{
			Name:        "AeroFit Minimalist Merino Hoodie",
			Description: "100% sustainably sourced breathable Merino wool with water-resistant coating.",
			Price:       120.00,
			Stock:       25,
			ImageURL:    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
			CategoryID:  apparel.ID,
		},
		{
			Name:        "Urban Commuter Waterproof Backpack",
			Description: "Padded 16-inch laptop compartment, weather-sealed zippers, and hidden passport pocket.",
			Price:       110.00,
			Stock:       40,
			ImageURL:    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
			CategoryID:  apparel.ID,
		},
		{
			Name:        "Artisan Ceramic Coffee Dripper & Mug",
			Description: "Handcrafted matte ceramic coffee brewer set designed for smooth pour-over extraction.",
			Price:       48.00,
			Stock:       80,
			ImageURL:    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
			CategoryID:  home.ID,
		},
	}

	for _, p := range products {
		db.Create(&p)
	}

	// 4. Seed an Initial Demo Order for Customer
	initialOrder := models.Order{
		UserID:      customer.ID,
		TotalAmount: 299.99,
		Status:      models.StatusPaid,
		Items: []models.OrderItem{
			{
				ProductID: products[0].ID,
				Quantity:  1,
				UnitPrice: products[0].Price,
			},
		},
	}
	db.Create(&initialOrder)

	log.Println("Initial PostgreSQL database seed completed successfully!")
}
