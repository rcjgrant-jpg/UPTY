import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class NumberAndSpecialCharacterValidator:
    def validate(self, password, user=None):
        if not re.search(r"\d", password):
            raise ValidationError(
                _("Password must contain at least one digit."),
                code="password_no_digit",
            )

        if not re.search(r"[^\w\s]", password):
            raise ValidationError(
                _("Password must contain at least one special character."),
                code="password_no_special_character",
            )

    def get_help_text(self):
        return _("Password must contain at least one digit and one special character.")