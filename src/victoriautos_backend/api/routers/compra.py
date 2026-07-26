import uuid

from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy import select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.models.compra_form import CompraForm
from victoriautos_backend.schemas.compra_form import CompraFormCreate, CompraFormPublic
from victoriautos_backend.services.pdf_contract import fill_purchase_contract
from victoriautos_backend.services.recaptcha import verify_recaptcha_token

router = APIRouter(prefix="/api/compra", tags=["compra"])


@router.get("/", response_model=list[CompraFormPublic])
async def list_pending_compra_forms(db: DbSession, _admin: AdminUser) -> list[CompraForm]:
    """Admin-only: the original endpoint had no auth check at all, publicly
    exposing buyer PII (cedula, celular, email) - fixed here."""
    result = await db.execute(select(CompraForm).where(CompraForm.status == "PENDING"))
    return list(result.scalars().all())


@router.post("/", response_model=CompraFormPublic, status_code=status.HTTP_201_CREATED)
async def create_compra_form(
    payload: CompraFormCreate, request: Request, db: DbSession
) -> CompraForm:
    remote_ip = request.client.host if request.client else None
    await verify_recaptcha_token(payload.recaptcha_token, remote_ip)

    compra_form = CompraForm(**payload.model_dump(exclude={"recaptcha_token"}))
    db.add(compra_form)
    await db.commit()
    await db.refresh(compra_form)
    return compra_form


@router.delete("/{compra_id}")
async def delete_compra_form(compra_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> dict:
    compra_form = await db.get(CompraForm, compra_id)
    if compra_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CompraForm not found")
    await db.delete(compra_form)
    await db.commit()
    return {"success": True, "message": "CompraForm deleted"}


@router.get("/generate-pdf/{compra_id}")
async def generate_purchase_contract_pdf(
    compra_id: uuid.UUID, db: DbSession, _admin: AdminUser
) -> Response:
    compra_form = await db.get(CompraForm, compra_id)
    if compra_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CompraForm not found")

    pdf_bytes = fill_purchase_contract(compra_form)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Contrato_Compra.pdf"},
    )
