package utils

import (
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"math/big"
	"net/smtp"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super-secret-ecommerce-key-change-in-production"
	}
	return []byte(secret)
}

func GenerateToken(userID uint, email string, role string) (string, error) {
	expirationTime := time.Now().Add(24 * 7 * time.Hour) // 7 days
	claims := &JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func ValidateToken(tokenStr string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	return claims, nil
}

func GenerateOTPCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()+100000), nil
}

func SendOTPEmail(toEmail, code string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_FROM")

	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	if smtpPort == "" {
		smtpPort = "587"
	}
	if fromEmail == "" {
		fromEmail = smtpUser
	}

	// If no credentials configured yet, log clearly to terminal
	if smtpUser == "" || smtpPass == "" {
		log.Printf("\n[EMAIL NOTICE] SMTP_USER or SMTP_PASS not set in .env! Logging code to console: %s -> %s\n", toEmail, code)
		return nil
	}

	subject := "Your Go-Commerce Verification Code"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="color: #4f46e5; margin-top: 0; font-size: 22px; font-weight: 800;">Go-Commerce Security</h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested a one-time verification code to sign in to your account.</p>
    <div style="background-color: #eef2ff; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338ca;">%s</span>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.4;">This code is confidential and expires in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
  </div>
</body>
</html>`, code)

	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nSubject: %s\r\n\r\n%s",
		fromEmail, toEmail, subject, body,
	))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, msg)
	if err != nil {
		log.Printf("[SMTP ERROR] Failed to send real email to %s: %v\n", toEmail, err)
		return err
	}

	log.Printf("[SMTP SUCCESS] Real email delivered to %s!\n", toEmail)
	return nil
}
