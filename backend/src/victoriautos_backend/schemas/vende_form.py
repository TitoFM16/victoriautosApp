from victoriautos_backend.schemas.oferta_form import OfertaFormFields


class VendeFormCreate(OfertaFormFields):
    """Simpler entry point into the same offers pipeline as `/api/ofertas`: a raw
    JSON body, no reCAPTCHA, no photo upload."""
