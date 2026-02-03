module.exports = grammar({
	name: "COMP0012Language",

	extras: ($) => [
		$.comment,
		/\s|\\\r?\n/,
	],

	word: ($) => $.identifier,

	rules: {
		source_file: ($) => repeat($._statement),

		block: ($) => choice(
			$._expression_block,
			$._statement_block,
		),

		// Single-expression block: { expression } (no newline after {)
		// Auto-returns the expression value
		// Matches when content is a simple expression (not a statement keyword)
		_expression_block: ($) =>
			prec(1, seq(
				"{",
				// Match expression that's not a statement-starting keyword
				field("expression", $._expression),
				"}",
			)),

		// Multi-statement block: { statements } (with newline or statements)
		// Returns null unless explicit return statement
		// This matches blocks that contain statements or have newlines
		_statement_block: ($) =>
			seq(
				"{",
				repeat($._statement),
				"}",
			),

		_value: ($) =>
			choice(
				$.bool,
				$.num,
				$.string,
			),

		argument_list: ($) => seq("(", repeat($._expression), ")"),
		method_call: ($) =>
			seq(
				field("receiver", $.identifier),
				".",
				field("name", $.identifier),
				$.argument_list,
			),

		_expression: ($) =>
			choice(
				$._value,
				$.identifier,
			),

		assignment: ($) =>
			seq("var", field("name", $.identifier), "=", field("value", $._value)),

		_statement: ($) =>
			choice(
				$._expression,
				$.block,
				$.assignment,
				$.method_call,
			),

		_newline: (_$) => /\s*\n/,
		identifier: (_$) => /[A-Za-z_][A-Za-z0-9_]*/,
		bool: (_$) => choice("true", "false"),
		num: (_$) => /[0-9]+/,
		string: (_$) => seq('"', /[^"]+/, '"'),

		// http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
		comment: (_$) =>
			token(choice(
				seq("//", /(\\(.|\r?\n)|[^\\\n])*/),
				seq(
					"/*",
					/[^*]*\*+([^/*][^*]*\*+)*/,
					"/",
				),
			)),
	},
});
