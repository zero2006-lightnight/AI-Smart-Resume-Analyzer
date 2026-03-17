import os
import fitz
from docx import Document


def extract_text_from_any(file_path):
    """
    Extract text from multiple resume formats.
    Supported: PDF, DOCX, TXT
    """

    if not os.path.exists(file_path):
        raise ValueError("File does not exist.")

    ext = os.path.splitext(file_path)[1].lower()

    try:
        # PDF parsing
        if ext == ".pdf":
            text = ""
            doc = fitz.open(file_path)

            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text += page_text

            return text.strip()

        # DOCX parsing
        elif ext == ".docx":
            doc = Document(file_path)
            text = []

            for para in doc.paragraphs:
                if para.text:
                    text.append(para.text)

            return "\n".join(text).strip()

        # TXT parsing
        elif ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()

        else:
            raise ValueError(
                "Unsupported file format. Please upload PDF, DOCX, or TXT."
            )

    except Exception as e:
        raise ValueError(f"Unable to read resume file: {str(e)}")