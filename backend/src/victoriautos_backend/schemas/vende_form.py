from victoriautos_backend.schemas.common import PrivacyConsentIn
from victoriautos_backend.schemas.oferta_form import OfertaFormFields


class VendeFormCreate(OfertaFormFields, PrivacyConsentIn):
    """Simpler entry point into the same offers pipeline as `/api/ofertas`: a raw
    JSON body, no reCAPTCHA, no photo upload."""
