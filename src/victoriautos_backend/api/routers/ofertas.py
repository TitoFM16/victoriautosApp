import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy import select

from victoriautos_backend.api.deps import AdminUser, DbSession
from victoriautos_backend.core.config import settings
from victoriautos_backend.models.oferta_form import OfertaForm
from victoriautos_backend.schemas.oferta_form import (
    OfertaFormCreate,
    OfertaFormPublic,
    OfertaFormUpdate,
)
from victoriautos_backend.services.image_processing import delete_image_folder, process_images
from victoriautos_backend.services.recaptcha import verify_recaptcha_token

router = APIRouter(prefix="/api/ofertas", tags=["ofertas"])


@router.get("/", response_model=list[OfertaFormPublic])
async def list_pending_ofertas(db: DbSession, _admin: AdminUser) -> list[OfertaForm]:
    result = await db.execute(select(OfertaForm).where(OfertaForm.status == "PENDING"))
    return list(result.scalars().all())


async def _oferta_form_create_form(
    nombre: Annotated[str, Form()],
    apellido: Annotated[str, Form()],
    celular: Annotated[str, Form()],
    email: Annotated[str, Form()],
    marca: Annotated[str, Form()],
    linea: Annotated[str, Form()],
    modelo: Annotated[int, Form()],
    km: Annotated[str, Form()],
    matricula: Annotated[str, Form()],
    price: Annotated[str, Form()],
    recaptcha_token: Annotated[str, Form()],
    wpp_check: Annotated[bool, Form()] = False,
) -> OfertaFormCreate:
    # See admin.py's `_car_admin_create_form` - FastAPI can't bind a `Form()`-wrapped
    # Pydantic model alongside a separate `File()` list parameter, so fields are
    # declared individually here instead.
    return OfertaFormCreate(
        nombre=nombre,
        apellido=apellido,
        celular=celular,
        email=email,
        wpp_check=wpp_check,
        marca=marca,
        linea=linea,
        modelo=modelo,
        km=km,
        matricula=matricula,
        price=price,
        recaptcha_token=recaptcha_token,
    )


@router.post("/", response_model=OfertaFormPublic, status_code=status.HTTP_201_CREATED)
async def create_oferta(
    request: Request,
    db: DbSession,
    oferta_in: Annotated[OfertaFormCreate, Depends(_oferta_form_create_form)],
    car_images: Annotated[list[UploadFile], File(default_factory=list)],
) -> OfertaForm:
    remote_ip = request.client.host if request.client else None
    await verify_recaptcha_token(oferta_in.recaptcha_token, remote_ip)

    oferta_id = uuid.uuid4()
    images = []
    if car_images:
        upload_dir = settings.ofertas_images_dir / str(oferta_id)
        images = await process_images(car_images, upload_dir)

    oferta = OfertaForm(
        id=oferta_id, **oferta_in.model_dump(exclude={"recaptcha_token"}), images=images
    )
    db.add(oferta)
    await db.commit()
    await db.refresh(oferta)
    return oferta


@router.get("/{oferta_id}", response_model=OfertaFormPublic)
async def get_oferta(oferta_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> OfertaForm:
    oferta = await db.get(OfertaForm, oferta_id)
    if oferta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta not found")
    return oferta


@router.put("/{oferta_id}", response_model=OfertaFormPublic)
async def update_oferta(
    oferta_id: uuid.UUID, payload: OfertaFormUpdate, db: DbSession, _admin: AdminUser
) -> OfertaForm:
    oferta = await db.get(OfertaForm, oferta_id)
    if oferta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(oferta, field, value)
    await db.commit()
    await db.refresh(oferta)
    return oferta


@router.delete("/{oferta_id}", response_model=OfertaFormPublic)
async def delete_oferta(oferta_id: uuid.UUID, db: DbSession, _admin: AdminUser) -> OfertaForm:
    oferta = await db.get(OfertaForm, oferta_id)
    if oferta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta not found")
    await delete_image_folder(settings.ofertas_images_dir, oferta.id)
    await db.delete(oferta)
    await db.commit()
    return oferta
