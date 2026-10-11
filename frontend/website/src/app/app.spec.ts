import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { AuthService } from './core/services/auth.service';
import { ProductService } from './core/services/product.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        ProductService
      ]
    }).compileComponents();
  });

  it('should create the App component instance', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(app.isCartOpen()).toBeFalse();
    expect(app.isAuthModalOpen()).toBeFalse();
  });

  it('should render the brand header logo and text in Navbar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar__brand-title')?.textContent).toContain('NEXUS');
  });
});
