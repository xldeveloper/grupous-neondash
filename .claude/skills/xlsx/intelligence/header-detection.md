# Intelligent Header Detection in Spreadsheets

Accurate header row detection is the first critical step in data import. Real-world spreadsheets rarely follow the ideal "first row = header" format.

## Detection Strategies

### 1. Semantic Analysis

Do not rely solely on exact matching. Use semantic analysis to identify header candidates.

#### Normalization

Before comparing, normalize the text:

- **Remove Accents**: `comercial` == `comercial`
- **Lowercase**: `NAME` == `name`
- **Trim**: `Name` == `Name`
- **Special Characters**: `E-mail` == `Email`

#### String Similarity

Use distance algorithms to tolerate typos:

- **Levenshtein**: For typos (e.g., "Telefome" vs "Telefone")
- **Jaro-Winkler**: Better for short strings and common prefixes
- **Threshold**: Recommended to accept similarity > 0.85

#### Synonyms and Variations

Maintain a dictionary of common synonyms:

- **CPF**: "Document", "CPF/CNPJ", "Doc", "Tax ID"
- **Phone**: "Cell Phone", "Mobile", "Zap", "WhatsApp", "Phone", "Tel"
- **Email**: "Electronic Mail", "E-mail", "Mail"
- **Name**: "Client", "Student", "Lead", "Full Name"

### 2. Data Pattern Analysis

Often, the header row is the only _text_ row followed by rows of _formatted data_.

#### Common Regex Patterns

Analyze the first 5-10 data rows below each header candidate:

- **CPF**: `^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$`
- **Email**: `^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$`
- **Brazilian Phone**: `^(\(?\d{2}\)?\s?)?(9\s?)?\d{4}-?\d{4}$`
- **Date**: `^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$` or Excel Serial (float > 10000)
- **Monetary**: `^R?\$?\s?\d{1,3}(\.?\d{3})*,\d{2}$`

#### Type Heuristic

If Row X contains "Birth Date" and rows X+1, X+2 contain valid dates (or integers that look like dates), the confidence that X is the header increases drastically.

### 3. Contextual Analysis

The spreadsheet's context provides valuable clues.

#### Density

- Header rows tend to have more filled columns than metadata rows (titles, generation dates).
- Header rows rarely have vertically merged cells (although horizontal merges do occur).

#### Format Consistency

- Headers are almost always Text/String.
- Data columns tend to have consistent types (only numbers, only dates).
- If a row contains numbers or dates, it is probably **not** the header.

#### Position

- Usually located in the first third of the file.
- Frequently preceded by empty rows or rows with only 1 filled column (report title).

### Suggested Scoring Algorithm

For each row `L` in the first 20 rows:

1.  **Base Score**: +10 if it is the first non-empty row.
2.  **Density**: +1 per non-empty column.
3.  **Type**: -50 if it contains dates or complex floats (probably data).
4.  **Keyword Matches**: +20 for each match with a known header keyword (e.g., "Name", "Email").
5.  **Subsequent Data**: +30 if the row below contains data that semantically matches the expected types (e.g., "Email" column has emails below).

The row with the highest score > Threshold is the header.
