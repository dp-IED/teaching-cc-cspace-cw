# COMP0012 Coursework 1

## Language Extensions

This grammar extends the base Wren-like language with additional features to support more expressive programming constructs.

### Single-Expression Blocks

**Syntax:** `{ expression }`

Single-expression blocks are a distinctive feature that automatically return the value of the contained expression. This provides a concise syntax for functions and methods that evaluate and return a single expression.

**Examples:**
```wren
{ 42 }           // Returns 42
{ true }         // Returns true
{ "hello" }      // Returns "hello"
{ myVariable }   // Returns the value of myVariable
```

**Key Characteristics:**
- Contains exactly one expression (values, identifiers, or other expressions)
- Automatically returns the expression's value
- Cannot contain statements (like `var`, `if`, `while`, etc.)
- Distinguished from multi-statement blocks by the absence of a newline immediately after the opening brace

**Implementation Details:**
- Expression blocks are parsed with higher precedence than statement blocks
- The grammar distinguishes between expression blocks and statement blocks
- Expression blocks only match when the content is a pure expression (not a statement)

**Test Coverage:**
- Positive tests: Valid expression blocks with various expression types
- Negative tests: Incomplete blocks, empty blocks, and invalid syntax

## Design Decisions

### Single-Expression Blocks
The implementation uses Tree-sitter's precedence system to prioritize expression blocks over statement blocks. Since whitespace (including newlines) is handled in the `extras` configuration, the distinction between expression and statement blocks is made based on the content type rather than explicit newline detection. Expression blocks only match pure expressions, ensuring they cannot contain statements.

## Future Extensions

Planned features for future implementation:
- Control flow statements (if/else, while, for)
- Functions with parameters and return statements
- Operators with proper precedence
- Lists and maps
- Classes and objects
