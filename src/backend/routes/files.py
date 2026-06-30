from fastapi import APIRouter, UploadFile, File, Form
import os
from dotenv import load_dotenv
from memory.memory import memory_bank
from datetime import datetime

load_dotenv()

router = APIRouter()

try:
    import base64
    import io
    from PIL import Image
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    HAS_GEMINI_VISION = True
except Exception:
    HAS_GEMINI_VISION = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except Exception:
    HAS_PDFPLUMBER = False

@router.post("/analyze-file")
async def analyze_file(file: UploadFile = File(...), message: str = Form(...)):
    try:
        file_content = await file.read()
        file_type = file.content_type or ""
        filename = file.filename or "uploaded"

        if file_type.startswith("image/"):
            if not HAS_GEMINI_VISION:
                return {"reply": "Image analysis requires Pillow and google-generativeai.", "status": "error"}

            image = Image.open(io.BytesIO(file_content))
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()

            response = model.generate_content([
                f"User message: {message}\n\nPlease analyze this image.",
                {"type": "image", "image": img_base64}
            ])

            reply = response.text
            memory_bank.add_conversation(
                user_message=f"[Image Upload] {message}",
                ai_response=reply,
                context={"file_type": "image", "file_name": filename}
            )

            return {"reply": reply, "status": "success", "file_type": "image", "file_name": filename}

        elif file_type == "application/pdf":
            if not HAS_PDFPLUMBER:
                return {"reply": "PDF analysis requires pdfplumber.", "status": "error"}

            pdf_text = ""
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        pdf_text += text + "\n"

            if not pdf_text.strip():
                return {"reply": "Could not extract text from this PDF.", "status": "warning"}

            if len(pdf_text) > 50000:
                pdf_text = pdf_text[:50000] + "\n\n[Content truncated...]"

            prompt = f"User message: {message}\n\nPDF Content:\n{pdf_text}\n\nAnalyze and answer."
            response = model.generate_content(prompt)
            reply = response.text

            memory_bank.add_conversation(
                user_message=f"[PDF Upload] {message}",
                ai_response=reply,
                context={"file_type": "pdf", "file_name": filename}
            )

            return {"reply": reply, "status": "success", "file_type": "pdf", "file_name": filename}

        elif file_type == "text/plain" or filename.lower().endswith('.txt'):
            text_content = file_content.decode('utf-8')

            if len(text_content) > 50000:
                text_content = text_content[:50000] + "\n\n[Content truncated...]"

            prompt = f"User message: {message}\n\nFile Content:\n{text_content}\n\nAnalyze and answer."
            response = model.generate_content(prompt)
            reply = response.text

            memory_bank.add_conversation(
                user_message=f"[TXT Upload] {message}",
                ai_response=reply,
                context={"file_type": "txt", "file_name": filename}
            )

            return {"reply": reply, "status": "success", "file_type": "txt", "file_name": filename}

        else:
            return {"reply": f"Unsupported file type: {file_type}", "status": "error"}

    except Exception as e:
        return {"reply": f"Error: {str(e)}", "status": "error"}

@router.post("/chat-with-file")
async def chat_with_file(file: UploadFile = File(...), message: str = Form(...)):
    return await analyze_file(file, message)

