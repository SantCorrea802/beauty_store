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
import { AdminProductImagesPage } from "./pages/admin/AdminProductImagesPage";
import { AppFooter } from "./components/AppFooter";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminCategoryCreatePage } from "./pages/admin/AdminCategoryCreatePage";
import { AdminCategoryEditPage } from "./pages/admin/AdminCategoryEditPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminUserCreatePage } from "./pages/admin/AdminUserCreatePage";
import { AdminAcceptInvitationPage } from "./pages/admin/AdminAcceptInvitationPage";
import { AdminSessionWatcher } from "./admin/AdminSessionWatcher";

function App() {
  return (
    <div className="app-shell">
      <AdminSessionWatcher />
      <AppHeader />

      <div className="app-content">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="categories" element={<CategoriesPage />} />
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
            path="admin/accept-invitation"
            element={<AdminAcceptInvitationPage />}
          />

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

          <Route
            path="admin/products/:id/images"
            element={
              <AdminProtectedRoute>
                <AdminProductImagesPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="admin/categories"
            element={
              <AdminProtectedRoute>
                <AdminCategoriesPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="admin/categories/new"
            element={
              <AdminProtectedRoute>
                <AdminCategoryCreatePage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="admin/categories/:id/edit"
            element={
              <AdminProtectedRoute>
                <AdminCategoryEditPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsersPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="admin/users/new"
            element={
              <AdminProtectedRoute>
                <AdminUserCreatePage />
              </AdminProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>

        <AppFooter />

    </div>
  );
}

export default App;