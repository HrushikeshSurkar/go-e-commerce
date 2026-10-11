package utils

import (
	"testing"
)

func TestHashAndCheckPassword(t *testing.T) {
	password := "SecretPass123!"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("expected no error hashing password, got %v", err)
	}

	if !CheckPasswordHash(password, hash) {
		t.Errorf("expected password to match hash")
	}

	if CheckPasswordHash("WrongPassword", hash) {
		t.Errorf("expected wrong password to fail check")
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	userID := uint(42)
	email := "customer@example.com"
	role := "customer"

	token, err := GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("expected no error generating token, got %v", err)
	}

	if token == "" {
		t.Fatalf("expected non-empty token")
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("expected valid token, got %v", err)
	}

	if claims.UserID != userID || claims.Email != email || claims.Role != role {
		t.Errorf("claims do not match expected values: %+v", claims)
	}
}

func TestValidateInvalidToken(t *testing.T) {
	_, err := ValidateToken("invalid.jwt.token")
	if err == nil {
		t.Errorf("expected error when validating invalid token, got nil")
	}
}
