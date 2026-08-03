import io

from pypdf import PdfReader, PdfWriter

from victoriautos_backend.core.config import settings
from victoriautos_backend.models.compra_form import CompraForm


def fill_purchase_contract(compra_form: CompraForm) -> bytes:
    """Fill the purchase contract PDF template with buyer + car details.

    Ported from compraRouter.js's generate-pdf endpoint (pdf-lib -> pypdf). Only
    sets a field if it actually exists in the template, same defensive check as
    the original.
    """
    reader = PdfReader(settings.contract_template_path)
    writer = PdfWriter()
    writer.append(reader)

    fields = reader.get_fields() or {}
    values: dict[str, str] = {}

    if "NOMBRE_COMPRADOR" in fields:
        values["NOMBRE_COMPRADOR"] = f"{compra_form.nombre} {compra_form.apellido}"

    car = compra_form.car
    if car is not None:
        if "CLASE" in fields:
            values["CLASE"] = car.tipo
        if "TIPO" in fields:
            values["TIPO"] = car.linea
        if "COLOR" in fields:
            values["COLOR"] = car.color
        if "MOTOR_NO" in fields:
            values["MOTOR_NO"] = car.motor_no or "N/A"
        if "CHASIS_NO" in fields:
            values["CHASIS_NO"] = car.chasis_no or "N/A"
        if "PLACA" in fields:
            values["PLACA"] = car.placa
        if "PRICE" in fields:
            values["PRICE"] = f"${car.price:,.0f}"

    for page in writer.pages:
        writer.update_page_form_field_values(page, values)

    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()
