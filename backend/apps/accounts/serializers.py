from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Address, PaymentMethod

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "birth_date",
            "marketing_opt_in",
            "is_staff",
            "date_joined",
        )
        read_only_fields = ("id", "is_staff", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "phone", "password", "marketing_opt_in")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class EkimTokenSerializer(TokenObtainPairSerializer):
    """JWT response içine kullanıcı bilgisi ekle."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "label",
            "name",
            "phone",
            "line",
            "district",
            "city",
            "postal_code",
            "country",
            "is_default",
        )


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = (
            "id",
            "card_alias",
            "last4",
            "brand",
            "exp_month",
            "exp_year",
            "is_default",
        )
        read_only_fields = ("id",)
