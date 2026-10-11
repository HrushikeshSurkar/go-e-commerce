package com.goecommerce.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.goecommerce.app.data.model.Product
import com.goecommerce.app.data.network.NetworkClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ProductUiState {
    data object Loading : ProductUiState
    data class Success(val products: List<Product>) : ProductUiState
    data class Error(val message: String) : ProductUiState
}

class ProductViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<ProductUiState>(ProductUiState.Loading)
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()

    init {
        fetchProducts()
    }

    fun fetchProducts(searchQuery: String? = null) {
        viewModelScope.launch {
            _uiState.value = ProductUiState.Loading
            try {
                val response = NetworkClient.apiService.getProducts(search = searchQuery)
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = ProductUiState.Success(response.body()!!)
                } else {
                    _uiState.value = ProductUiState.Error("Server error: ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.localizedMessage ?: "Failed to connect to Go server")
            }
        }
    }
}
