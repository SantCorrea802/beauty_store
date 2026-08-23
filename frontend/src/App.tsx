import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerProtectedRoute } from "./auth/CustomerProtectedRoute";
import { AppHeader } from "./components/AppHeader";
import { CustomerLoginPage } from "./pages/auth/CustomerLoginPage";
import { CustomerRegisterPage } from "./pages/auth/CustomerRegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { ChangePasswordPage } from "./pages/customer/ChangePasswordPage";
import { CustomerCartPage } from "./pages/customer/CustomerCartPage";
import { CustomerFavoritesPage } from "./pages/customer/CustomerFavoritesPage";
import { CustomerProfilePage } from "./pages/customer/CustomerProfilePage";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AdminProtectedRoute } from "./admin/AdminProtectedRoute";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProductCreatePage } from "./pages/admin/AdminProductCreatePage";
import { AdminProductEditPage } from "./pages/admin/AdminProductEditPage";

function App() {
  return (
    <div className="app-shell">
      <AppHeader />

      <Routes>
        <Route index element={<HomePage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />

        <Route path="register" element={<CustomerRegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="login" element={<CustomerLoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        <Route
          path="me"
          element={
            <CustomerProtectedRoute>
              <CustomerProfilePage />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="me/password"
          element={
            <CustomerProtectedRoute>
              <ChangePasswordPage />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="me/favorites"
          element={
            <CustomerProtectedRoute>
              <CustomerFavoritesPage />
            </CustomerProtectedRoute>
          }
        />



        <Route
          path="me/cart"
          element={
            <CustomerProtectedRoute>
              <CustomerCartPage />
            </CustomerProtectedRoute>
          }
        />

        <Route path="admin/login" element={<AdminLoginPage />} />

        <Route
          path="admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="admin/products"
          element={
            <AdminProtectedRoute>
              <AdminProductsPage />
            </AdminProtectedRoute>
          }
        />


        <Route
          path="admin/products/new"
          element={
            <AdminProtectedRoute>
              <AdminProductCreatePage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="admin/products/:id/edit"
          element={
            <AdminProtectedRoute>
              <AdminProductEditPage />
            </AdminProtectedRoute>
          }
        />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;