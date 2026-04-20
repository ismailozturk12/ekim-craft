from django.urls import path

from .views import OrderViewSet

urlpatterns = [
    path(
        "",
        OrderViewSet.as_view({"get": "list", "post": "create"}),
        name="order-list",
    ),
    path(
        "<str:number>/",
        OrderViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "put": "update",
            }
        ),
        name="order-detail",
    ),
    path(
        "<str:number>/cancel/",
        OrderViewSet.as_view({"post": "cancel"}),
        name="order-cancel",
    ),
]
