from app.utils.security import hash_password, verify_password


def test_password_hashing_and_verification_work():
    password = "strong-password-123"

    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong-password", hashed) is False
