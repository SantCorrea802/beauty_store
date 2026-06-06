import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/public/HomePage";
import { ProductDetailPage } from "./pages/public/ProductDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
    </Routes>
  );
}

export default App;