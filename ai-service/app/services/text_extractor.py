import io
import re
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader


def clean_extracted_text(text: str) -> str:
    """Cleans raw extracted text by removing abnormal characters, ligatures, and excessive whitespace."""
    if not text:
        return ""
    # Normalize common ligatures & quotes
    text = text.replace('\xa0', ' ').replace('\t', ' ')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\ufb01', 'fi').replace('\ufb02', 'fl')
    # Normalize bullet points to markdown list markers
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF\u25CB\u25AA\u25AB\u2044\u2013\u2014]', '\n- ', text)
    # Remove multiple spaces on same line
    text = re.sub(r'[ ]{2,}', ' ', text)
    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text content from PDF file bytes using pypdf with robust fallbacks."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes), strict=False)
        if reader.is_encrypted:
            try:
                reader.decrypt('')
            except Exception:
                pass

        extracted_pages = []
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    extracted_pages.append(page_text.strip())
            except Exception as page_err:
                print(f"Warning: Failed to extract page {i} of PDF: {page_err}")

        full_text = "\n\n".join(extracted_pages)
        cleaned = clean_extracted_text(full_text)
        if cleaned:
            return cleaned

        # Fallback to UTF-8 / latin-1 plain text decoding if no text was found from PDF structure
        try:
            return clean_extracted_text(file_bytes.decode('utf-8', errors='ignore'))
        except Exception:
            return ""
    except Exception as e:
        print(f"Error parsing PDF with pypdf: {e}")
        try:
            return clean_extracted_text(file_bytes.decode('utf-8', errors='ignore'))
        except Exception:
            return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from Word .docx file bytes using standard zipfile and XML parsing."""
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            if 'word/document.xml' not in z.namelist():
                return ""
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            paragraphs = []
            for elem in tree.iter():
                if elem.tag.endswith('p'):
                    texts = [child.text for child in elem.iter() if child.tag.endswith('t') and child.text]
                    if texts:
                        paragraphs.append(''.join(texts))
            
            full_text = "\n".join(paragraphs)
            return clean_extracted_text(full_text)
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extracts text from plain text or utf-8 encoded files."""
    try:
        return clean_extracted_text(file_bytes.decode('utf-8', errors='ignore'))
    except Exception:
        return clean_extracted_text(file_bytes.decode('latin-1', errors='ignore'))

