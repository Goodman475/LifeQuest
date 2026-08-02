import hashlib

from app.utils.security import hash_password, verify_password


def test_password_hashing_and_verification_work():
    password = "strong-password-123"

    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_verify_password_supports_legacy_sha256_hashes():
    password = "password123"
    legacy_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

    assert verify_password(password, legacy_hash) is True
    assert verify_password("wrong-password", legacy_hash) is False


def test_verify_password_supports_prefixed_sha256_hashes():
    password = "password123"
    prefixed_hash = hash_password(password)

    assert verify_password(password, prefixed_hash) is True
    assert verify_password("wrong-password", prefixed_hash) is False
