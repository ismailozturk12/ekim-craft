from django_filters import rest_framework as filters

from .models import Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category__slug")
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    customizable = filters.BooleanFilter()
    tag = filters.CharFilter(method="filter_tag")
    on_sale = filters.BooleanFilter(method="filter_on_sale")
    color = filters.CharFilter(method="filter_color")
    size = filters.CharFilter(method="filter_size")
    brand = filters.CharFilter(field_name="artisan")
    in_stock = filters.BooleanFilter(method="filter_in_stock")

    class Meta:
        model = Product
        fields = [
            "category",
            "customizable",
            "min_price",
            "max_price",
            "tag",
            "on_sale",
            "color",
            "size",
            "brand",
            "in_stock",
        ]

    def filter_tag(self, queryset, name, value):
        return queryset.filter(tags__contains=[value])

    def filter_on_sale(self, queryset, name, value):
        if value is True:
            return queryset.exclude(old_price__isnull=True)
        return queryset

    def filter_color(self, queryset, name, value):
        # Virgül ile birden fazla renk — varyantlara bak
        colors = [c.strip() for c in value.split(",") if c.strip()]
        if not colors:
            return queryset
        return queryset.filter(variants__color_name__in=colors).distinct()

    def filter_size(self, queryset, name, value):
        sizes = [s.strip() for s in value.split(",") if s.strip()]
        if not sizes:
            return queryset
        return queryset.filter(variants__size_label__in=sizes).distinct()

    def filter_in_stock(self, queryset, name, value):
        if value is True:
            return queryset.filter(variants__stock__gt=0).distinct()
        return queryset
