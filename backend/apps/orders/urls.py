from django.urls import path

from .views import OrderViewSet, ReturnRequestViewSet

urlpatterns = [
    path(
        "",
        OrderViewSet.as_view({"get": "list", "post": "create"}),
        name="order-list",
    ),
    path(
        "returns/",
        ReturnRequestViewSet.as_view({"get": "list", "post": "create"}),
        name="return-list",
    ),
    path(
        "returns/<str:number>/",
        ReturnRequestViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "put": "update",
            }
        ),
        name="return-detail",
    ),
    path(
        "returns/<str:number>/cancel/",
        ReturnRequestViewSet.as_view({"post": "cancel"}),
        name="return-cancel",
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
