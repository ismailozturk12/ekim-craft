from rest_framework.routers import DefaultRouter

from .admin_views import (
    AdminCategoryViewSet,
    AdminProductImageViewSet,
    AdminProductVariantViewSet,
    AdminProductViewSet,
)
from .views import CategoryViewSet, ProductViewSet, WishlistViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"admin/categories", AdminCategoryViewSet, basename="admin-category")
router.register(r"admin/products", AdminProductViewSet, basename="admin-product")
router.register(r"admin/images", AdminProductImageViewSet, basename="admin-image")
router.register(r"admin/variants", AdminProductVariantViewSet, basename="admin-variant")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")
router.register(r"products", ProductViewSet, basename="product")

urlpatterns = router.urls
