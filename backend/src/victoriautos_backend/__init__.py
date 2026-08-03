def main() -> None:
    import uvicorn

    uvicorn.run("victoriautos_backend.main:app", host="0.0.0.0", port=3005, reload=True)
