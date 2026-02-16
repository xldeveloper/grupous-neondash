# Intelligent Column Mapping

After identifying the header row, the next challenge is mapping the spreadsheet columns (Source) to the system fields (Target).

## Multi-Factor Scoring System

Do not use a binary decision (match/no-match). Calculate a **Confidence Score** (0-100%) for each possible mapping based on multiple factors.

### Suggested Weights

| Factor                      | Weight | Description                                           |
| -------------------------- | ------ | ----------------------------------------------------- |
| **Semantic Similarity**    | 40%    | Does the column name resemble the target field?       |
| **Data Pattern**           | 30%    | Does the data in the column match the expected type?  |
| **Contextual Position**    | 15%    | Does the column order make sense?                     |
| **Usage Frequency**        | 15%    | Is this column name common for this field?            |

### Factor 1: Semantic Similarity (0-100)

Compare the normalized column name with the field's keyword list.

- Exact match (normalized): 100 points
- Known synonym: 90 points
- Levenshtein > 0.8: 70-80 points
- Contains the word (e.g., "Home Phone" contains "Phone"): 60 points

### Factor 2: Data Pattern (0-100)

Sample 5 non-empty values from the column.

- Exact regex match (e.g., valid CPF): 100 points
- Compatible format (e.g., numeric for an Age field): 50 points
- Incompatible format (e.g., text for a Numeric field): -100 points (veto factor)

### Factor 3: Position (0-100)

If "Name" was found in Column A and "Last Name" in Column B, the probability that Column C is "Email" increases if that is a common pattern.

### Factor 4: Frequency (0-100)

Based on import history. If 90% of users use "Cel" for "Cell Phone", that match gets extra points.

## Decision and Fallback

### Confidence Classification

1.  **High (Score > 85)**: Automatic Mapping. No need to ask the user.
2.  **Medium (Score 60-85)**: Strongly Recommended Suggestion. "We think X is Y, confirm?"
3.  **Ambiguous (Close scores)**: If "Phone 1" and "Phone 2" could both be "Main Phone", request clear disambiguation.
4.  **Low (Score < 60)**: Do not map automatically. Suggest "Ignore" or mark as unknown.

## Expanded Knowledge Base

For maximum effectiveness, the system must know variations.

### Example: "Phone" Field

- **EN**: Phone, Mobile, Cell, Cellphone, Tel
- **PT-BR**: Telefone, Celular, Tel, Fone, Movel, Contato, Wpp, Whats, WhatsApp, Zap
- **Common Errors**: Telefome, Celuar, Tlf
- **Abbreviations**: Cel, Tel, T.

### Example: "Value" Field

- **Keywords**: Price, Value, Cost, Total, R$, Amount, Price
- **Variations**: Total Value, Unit Value, Final Cost

## Disambiguation Strategies

### Duplicate Columns

If the spreadsheet has "Phone" and "Cell Phone", and the system only has 1 "phone" field:

1.  Check which has more filled data (density).
2.  Check which has more recent data (if dates exist).
3.  Combine them if the system allows multiple phone numbers.
4.  Otherwise, prioritize "Cell Phone" over "Phone" in B2C contexts.

### Unmapped Columns

Always alert the user about columns in the spreadsheet that were **not** mapped to anything, to avoid accidental data loss.
