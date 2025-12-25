import zipfile
import re
import sys

DOCX_PATH = "AI_Soil_Quality_Standards_and_Guidelines.docx"

def get_docx_text(path):
    text = []
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf-8')
        # Replace xml tags with line breaks to get simple text flow
        xml = re.sub(r'<w:p[^>]*>', '\n', xml)
        xml = re.sub(r'<[^>]+>', '', xml)
        return xml

if __name__ == '__main__':
    try:
        txt = get_docx_text(DOCX_PATH)
    except Exception as e:
        print('ERROR: Could not read DOCX:', e)
        sys.exit(1)

    # Look for lines that mention Nitrogen, Phosphorus, Potassium, and pH
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    keywords = ['nitrogen', 'phosphorus', 'potassium', 'pH']

    results = {k: [] for k in keywords}

    for l in lines:
        low = l.lower()
        for k in keywords:
            if k.lower() in low:
                results[k].append(l)

    # Print candidate lines
    for k in keywords:
        print('----', k, '----')
        for r in results[k]:
            print(r)
        print('\n')

    # Attempt to extract numeric ranges and thresholds
    num_re = re.compile(r'(?:<|<=|<=|less than|higher than|>|>=|=)?\s*(\d+(?:\.\d+)?)')
    range_re = re.compile(r'(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)')

    def find_numbers(text):
        out = []
        for m in range_re.finditer(text):
            out.append((float(m.group(1)), float(m.group(2))))
        for m in num_re.finditer(text):
            out.append(float(m.group(1)))
        return out

    print('---- Extracted numeric hints ----')
    for k in keywords:
        nums = []
        for r in results[k]:
            nums.extend(find_numbers(r))
        print(k, nums)

    print('\nIf you see plausible thresholds above, confirm and I will apply them to `scripts/train_model.py`.')
