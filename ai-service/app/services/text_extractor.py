import io
import re
from pypdf import PdfReader


def clean_extracted_text(text: str) -> str:
    """Cleans raw extracted text by removing abnormal characters and excessive whitespace."""
    if not text:
        return ""
    # Replace non-breaking spaces and tabs
    text = text.replace('\xa0', ' ').replace('\t', ' ')
    # Normalize bullet points
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF]', '\n- ', text)
    # Remove multiple spaces
    text = re.sub(r'[ ]{2,}', ' ', text)
    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text content from PDF file bytes using pypdf with robust fallbacks."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text)
        
        full_text = "\n".join(extracted_pages)
        return clean_extracted_text(full_text)
    except Exception as e:
        print(f"Error parsing PDF with pypdf: {e}")
        # Fallback to UTF-8 / latin-1 plain text decoding if applicable
        try:
            return clean_extracted_text(file_bytes.decode('utf-8', errors='ignore'))
        except Exception:
            return ""


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extracts text from plain text or utf-8 encoded files."""
    try:
        return clean_extracted_text(file_bytes.decode('utf-8', errors='ignore'))
    except Exception:
        return clean_extracted_text(file_bytes.decode('latin-1', errors='ignore'))
