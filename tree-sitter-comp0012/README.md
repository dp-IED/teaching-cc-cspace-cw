# COMP0012 Coursework 1

## Design Document

### Motivation

Modern programming languages increasingly favor concision without sacrificing clarity. The single-expression block syntax addresses a common pattern in functional and object-oriented programming: functions and methods that simply evaluate and return a single expression. Without this feature, developers must write verbose boilerplate, explicitly returning values even when the intent is immediately clear from the expression itself.

Consider a language that requires explicit return statements for all functions. A simple getter method becomes `fn getValue() { return x }` rather than the more elegant `fn getValue() { x }`. This verbosity compounds in functional programming patterns where many functions are pure transformations: `list.map {|n| n * 2}` reads more naturally than `list.map {|n| return n * 2}`. The single-expression block syntax eliminates this redundancy, allowing the grammar itself to express the developer's intent more directly.

This syntactic choice aligns with the principle that the language should get out of the developer's way. When a block contains only an expression, the return is implicit and unambiguous. The grammar enforces this clarity by restricting expression blocks to pure expressions, preventing statements that would introduce side effects or control flow. This design creates a natural boundary: expression blocks for pure computations, statement blocks for imperative code. The distinction helps both the parser and the developer understand the block's semantics at a glance.

The feature integrates seamlessly with method chaining and functional composition. When combined with higher-order functions, expression blocks enable fluent APIs where transformations read left-to-right: `data.filter {|x| x > 0}.map {|x| x * 2}.reduce {|a, b| a + b}`. Each block clearly communicates its role as a pure transformation, making the code's intent transparent.

### Implementation

The grammar implements single-expression blocks through a dual-block system that distinguishes between expression and statement contexts. The `block` rule uses Tree-sitter's `choice` to select between `_expression_block` and `_statement_block`, with expression blocks given higher precedence via `prec(1)` to ensure they are attempted first during parsing.

The `_expression_block` rule matches the pattern `{ expression }` where the expression must be a pure expression—currently values (numbers, booleans, strings) or identifiers. This restriction is enforced structurally: the rule directly references `$._expression`, which excludes statements like assignments, method calls, or control flow. When an expression block is parsed, Tree-sitter captures the expression in a named field, producing an AST node that clearly indicates this is an expression block rather than a statement block.

The `_statement_block` rule serves as the fallback, matching any block that contains statements. It uses `repeat($._statement)` to allow zero or more statements, enabling empty blocks `{ }` which are valid in the language. Statement blocks can contain assignments, method calls, nested blocks, or expressions used as statements.

A key implementation challenge arises from Tree-sitter's handling of whitespace. Since newlines are included in the `extras` configuration (along with comments and other whitespace), they are automatically skipped during parsing. This means the grammar cannot directly detect whether a newline appears immediately after the opening brace, which is the semantic distinction in Wren's original design. Instead, the implementation relies on content-based disambiguation: expression blocks only match when the content is a pure expression, while statement blocks match everything else. This approach maintains the semantic distinction while working within Tree-sitter's parsing model.

The identifier pattern was extended from `/[A-Za-z_]+/` to `/[A-Za-z_][A-Za-z0-9_]*/` to support identifiers containing digits (like `abc123`), aligning with common language conventions. This change ensures expression blocks can reference variables with alphanumeric names.

Error handling for incomplete expression blocks is handled naturally by Tree-sitter: when a closing brace is missing, the parser produces a partial AST with a `MISSING "}"` node, allowing negative tests to verify that malformed syntax is correctly rejected. Similarly, attempting to use a statement in an expression block context will fail to match the `_expression_block` rule and fall through to `_statement_block`, but if the statement itself is invalid in that context, an appropriate error is generated.

The test suite validates both positive cases (valid expression blocks with various expression types) and negative cases (incomplete blocks, syntax errors). This coverage ensures the grammar correctly accepts intended syntax while rejecting invalid constructs, maintaining the language's syntactic integrity.
