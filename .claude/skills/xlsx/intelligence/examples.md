# Practical Examples of XLS Intelligence

This document illustrates real-world detection and mapping scenarios to guide implementation and testing.

## Scenario 1: Spreadsheet with Report Headers (Metadata)

Many spreadsheets exported from legacy systems (SAPs, old ERPs) contain "print" headers.

### Input

```csv
Row 1: MONTHLY SALES REPORT - 2024
Row 2: Generated on: 10/15/2024 by Admin
Row 3: Filters: All | Status: Active
Row 4:
Row 5: CODE | CLIENT         | SALE DATE  | TOTAL VALUE | STATUS
Row 6: 00152  | PADARIA JOAO   | 10/01/2024 | 1,500.00    | PAID
Row 7: 00153  | MERCADO LIVRE  | 10/02/2024 | 500.00      | PENDING
```

### Detection Process

1.  **Rows 1-3**: Ignored.
    - Contain few filled columns (low density).
    - Do not match known keywords.
2.  **Row 4**: Ignored (empty).
3.  **Row 5**: **DETECTED AS HEADER**.
    - High density (5 filled columns).
    - Strong keywords: "CODE" (ID), "CLIENT" (Name), "SALE DATE" (Date), "VALUE" (Money).
    - Row 6 contains data consistent with the inferred types (Number, Text, Date, Money).

---

## Scenario 2: Ambiguous Headers and Synonyms

### Input

```csv
Full Name     | Zap         | Addr.  | DOB        | Doc.
Maria Silva   | 11999999999 | Rua A  | 1990-01-01 | 12345678900
```

### Mapping Process

| Input Column | Data Analysis              | Semantic Match                           | Final Decision | Confidence  |
| ------------ | -------------------------- | ---------------------------------------- | -------------- | ----------- |
| **Zap**      | Cell phone pattern (11 digits) | Slang synonym for "WhatsApp/Phone"   | **phone**      | High (90%)  |
| **Addr.**    | Free text                  | Abbreviation of "Address"                | **address**    | High (85%)  |
| **DOB**      | ISO date                   | Abbreviation of "Date of Birth"          | **birthdate**  | High (85%)  |
| **Doc.**     | Valid CPF (11 digits)      | Abbreviation of "Document"               | **cpf**        | High (95%)  |

---

## Scenario 3: "Junk" or Unknown Columns

### Input

```csv
ID | Name | Column1 | Check | Internal Notes
1  | Ana  | X       | OK    | VIP Client
```

### Process

1.  **ID** -> `id` (High)
2.  **Name** -> `name` (High)
3.  **Column1** -> ???
    - No semantic match.
    - Data "X" not definitive.
    - **Action**: Mark as `ignored` or ask the user.
4.  **Check** -> ???
    - No clear match with system fields.
    - **Action**: Mark as `ignored`.
5.  **Internal Notes** -> `notes`
    - "Notes" partial match with "Observations/Notes".
    - **Action**: Suggest `notes` with Medium confidence.

---

## Scenario 4: Ambiguous Dates

### Input

```csv
Date
02/05/2024
```

### Problem

Is it May 2nd (DMY) or February 5th (MDY)?

### Intelligence Process

1.  Observe other rows: `02/05/2024`, `15/05/2024`.
2.  `15` cannot be a month. Therefore, the format **must** be DMY.
3.  If all values are ambiguous (e.g., `01/01` through `12/12`), check the system locale or ask.
4.  **Decision**: Infer `DF_DD_MM_YYYY` based on the row `15/05`.

---

## Conceptual Detection Code Example

```typescript
function detectHeader(rows: any[][]): number {
  let bestRowIndex = -1;
  let maxScore = 0;

  rows.slice(0, 20).forEach((row, index) => {
    let score = calculateRowScore(row, rows[index + 1]); // Analyze row + data below
    if (score > maxScore) {
      maxScore = score;
      bestRowIndex = index;
    }
  });

  return maxScore > MIN_THRESHOLD ? bestRowIndex : 0; // Fallback to 0
}
```
