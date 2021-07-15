const PREC = {
  COMMENT: -100, // /* */ //
  SEQUENCE: -10, // ,
  ASSIGNMENT: -2, // = += -= *=
  SELECTION: -1, // ?:
  DEFAULT: 0,
  LOGICAL_OR: 1, // ||
  LOGICAL_AND: 2, // &&
  INCLUSIVE_OR: 3, // |
  EXCLUSIVE_OR: 4, // ^
  BITWISE_AND: 5, // &
  EQUALITY: 6, // == !=
  RELATIONAL: 7, // >= <= < >
  SHIFT: 9, // >> <<
  ADDDITIVE: 10, // + -
  MULTIPLICATIVE: 11, // *
  UNARY: 15, // !a
  PREFIX: 15, // --a
  POSTFIX: 18, // a--
  SUBSCRIPT: 18, // []
  CALL: 18, // func()
  FIELD: 18, // .
  GROUPING: 20, // ()
};
module.exports = grammar({
  name: 'glsl',

  word: ($) => $.identifier,

  extras: ($) => [/\s+/, $.comment],
  rules: {
    // TRANSLATION_UNIT        : DECLARATION | FUNCTION_DEFINITON
    translation_unit: ($) => repeat1($._external_declaration),

    _external_declaration: ($) =>
      choice(
        field('declarator', $.function_definition),
        field('body', $.declaration)
      ),

    declaration: ($) =>
      choice(
        seq($.function_prototype, ';'),
        seq($._init_declarator_list, ';'),
        seq('precision', $.precision_qualifier, $.type_qualifier, ';'),
        seq(
          $.type_qualifier,
          field('declarator', $.identifier),
          field('body', seq('{', $.struct_declaration_list, '}')),
          optional(
            field(
              'declarator',
              seq($.identifier, optional($._array_specifier_list))
            )
          ),
          ';'
        ),
        seq(
          $.type_qualifier,
          optional(
            seq(
              field('type', $.identifier),
              commaSep(field('declarator', $.identifier))
            )
          ),
          ';'
        )
      ),

    _init_declarator_list: ($) =>
      choice(
        // Single declarator
        seq(
          $.fully_specified_type,
          optional(
            field('declarator', $.identifier),
            optional($._array_specifier_list),
            optional(seq('=', $.initializer))
          )
        ),
        seq(
          commaSep1(field('declarator', $.identifier)),
          optional($._array_specifier_list),
          optional(seq('=', $.initializer))
        )
      ),

    initializer: ($) =>
      choice(
        $._expression,
        seq('{', commaSep1($.initializer), optional(','), '}')
      ),

    // FUNCTION_DEFINITION     : FUNCTION_DECLARATION STATEMENT_LIST
    function_definition: ($) =>
      choice(
        seq(
          field('declarator', $.function_prototype),
          optional(field('body', $.compound_statement)) // TODO
        )
      ),

    compound_statement: ($) => seq('{', optional($.statement_list), '}'),

    statement_list: ($) => repeat1($.statement),

    statement: ($) =>
      choice(
        $.compound_statement,
        $.declaration,
        $.expression_statement, // TODO
        $.selection_statement, // TODO
        $.switch_statement, // TODO
        $.case_label, // TODO
        $.iteration_statement, // TODO
        $.jump_statement // TODO
      ),

    function_prototype: ($) => seq($.function_declaration, ')'),

    // FUNCTION_DECLARATION    : FUNCTION_HEADER FUNCTION_PARAMETER_LIST
    // FUNCTION_HEADER         : FULLY_SPECIFIED_TYPE IDENTIFIER
    function_declaration: ($) =>
      seq(
        field('type', $.fully_specified_type),
        field('name', $.identifier),
        '(',
        optional(field('parameters', $.function_parameter_list))
      ),

    fully_specified_type: ($) =>
      seq(optional($.type_qualifier_list), $.type_specifier),

    // FUNCTION_PARAMETER_LIST : PARAMETER_DECLARATION ...
    function_parameter_list: ($) => commaSep1($.parameter_declaration),
    // PARAMETER_DECLARATION   : TYPE_QUALIFIER_LIST PARAMETER_DECLARATOR
    parameter_declaration: ($) =>
      seq(
        optional(field('type', $.type_qualifier_list)),
        field('declarator', choice($.parameter_declarator, $.type_specifier))
      ),
    // PARAMETER_DECLARATOR    : TYPE_SPECIFIER IDENTIFIER ARRAY_SPECIFIER_LIST
    parameter_declarator: ($) =>
      seq(
        field('type', $.type_specifier),
        field('declarator', $._field_declarator)
      ),

    _array_specifier_list: ($) =>
      repeat1(choice('[]', seq('[', $._constant_expression, ']'))),

    _field_declarator: ($) => choice($.identifier, $.array_declarator),

    array_declarator: ($) =>
      seq(field('declarator', $.identifier), $._array_specifier_list),

    type_specifier: ($) =>
      seq($.primitive_type, optional($._array_specifier_list)),

    _type_specifier_nonarray: ($) =>
      choice(
        $.primitive_type,
        seq(
          'struct',
          optional(field('declarator', $.identifier)),
          '{',
          field('body', $.struct_declaration_list),
          '}'
        ),
        $.identifier
      ),

    primitive_type: ($) =>
      choice(
        'void',
        'float',
        'double',
        'int',
        'uint',
        'bool',
        'vec2',
        'vec3',
        'vec4',
        'dvec2',
        'dvec3',
        'dvec4',
        'bvec2',
        'bvec3',
        'bvec4',
        'ivec2',
        'ivec3',
        'ivec4',
        'uvec2',
        'uvec3',
        'uvec4',
        'mat2',
        'mat3',
        'mat4',
        'mat2x2',
        'mat2x3',
        'mat2x4',
        'mat3x2',
        'mat3x3',
        'mat3x4',
        'mat4x2',
        'mat4x3',
        'mat4x4',
        'dmat2',
        'dmat3',
        'dmat4',
        'dmat2x2',
        'dmat2x3',
        'dmat2x4',
        'dmat3x2',
        'dmat3x3',
        'dmat3x4',
        'dmat4x2',
        'dmat4x3',
        'dmat4x4',
        'atomic_uint',
        'sampler1d',
        'sampler2d',
        'sampler3d',
        'samplercube',
        'sampler1DShadow',
        'sampler2DShadow',
        'samplerCubeShadow',
        'sampler1DArray',
        'sampler2DArray',
        'sampler1DArrayShadow',
        'sampler2DArrayShadow',
        'samplerCubeArray',
        'samplerCubeArrayShadow',
        'isampler1D',
        'isampler2D',
        'isampler3D',
        'isamplerCube',
        'isampler1DArray',
        'isampler2DArray',
        'isamplerCubeArray',
        'usampler1D',
        'usampler2D',
        'usampler3D',
        'usamplerCube',
        'usampler1DArray',
        'usampler2DArray',
        'usamplerCubeArray',
        'sampler2DRect',
        'sampler2DRectshadow',
        'isampler2DRect',
        'usampler2DRect',
        'samplerBuffer',
        'isamplerBuffer',
        'usamplerBuffer',
        'sampler2DMS',
        'isampler2DMS',
        'usampler2DMS',
        'sampler2DMSArray',
        'isampler2DMSArray',
        'usampler2DMSArray',
        'image1D',
        'iimage1D',
        'uimage1D',
        'image2D',
        'iimage2D',
        'uimage2D',
        'image3D',
        'iimage3D',
        'uimage3D',
        'image2DRect',
        'iimage2DRect',
        'uimage2DRect',
        'imageCube',
        'iimageCube',
        'uimageCube',
        'imageBuffer',
        'iimageBuffer',
        'uimageBuffer',
        'image1DArray',
        'iimage1DArray',
        'uimage1DArray',
        'image2DArray',
        'iimage2DArray',
        'uimage2DArray',
        'imageCubeArray',
        'iimageCubeArray',
        'uimageCubeArray',
        'image2DMS',
        'iimage2DMS',
        'uimage2DMS',
        'image2DMSArray',
        'iimage2DMSArray',
        'uimage2DMSArray'
      ),

    struct_declaration_list: ($) => repeat1($.struct_declaration),

    struct_declaration: ($) =>
      seq(
        optional($.type_qualifier_list),
        field('type', $.type_specifier),
        field('declarator', $.struct_declarator_list),
        ';'
      ),
    struct_declarator_list: ($) => commaSep1($.struct_declarator),
    // seq($.struct_declarator, optional(seq(',', $.struct_declarator_list))),

    struct_declarator: ($) => $._field_declarator,

    type_qualifier_list: ($) => repeat1($.type_qualifier),

    type_qualifier: ($) =>
      choice(
        $.storage_qualifier,
        $.layout_qualifier,
        $.precision_qualifier,
        $.interpolation_qualifier,
        $.invariant_qualifier,
        $.precise_qualifier
      ),
    storage_qualifier: ($) =>
      choice(
        'const',
        'inout',
        'in',
        'out',
        'centroid',
        'patch',
        'sample',
        'uniform',
        'buffer',
        'shared',
        'coherent',
        'volatile',
        'restrict',
        'readonly',
        'writeonly',
        'subroutine',
        seq('subroutine', '(', $.type_name_list, ')')
      ),
    type_name_list: ($) => commaSep1($.identifier),

    layout_qualifier: ($) =>
      seq(
        'LAYOUT',
        '(',
        seq($.layout_qualifier_id, repeat(seq(',', $.layout_qualifier_id))),
        ')'
      ),
    layout_qualifier_id: ($) =>
      choice(
        seq(
          field('declarator', $.identifier),
          optional(seq('=', field('value', $._constant_expression)))
        ),
        'shared'
      ),
    precision_qualifier: ($) => choice('highp', 'mediump', 'lowp'),
    interpolation_qualifier: ($) => choice('smooth', 'flat', 'noperspective'),
    invariant_qualifier: ($) => 'invariant',
    precise_qualifier: ($) => 'precise',

    binary_expression: ($) =>
      choice(
        ...[
          ['>', PREC.RELATIONAL],
          ['<', PREC.RELATIONAL],
          ['>=', PREC.RELATIONAL],
          ['<=', PREC.RELATIONAL],
          ['==', PREC.EQUALITY],
          ['!=', PREC.EQUALITY],
          ['&&', PREC.LOGICAL_AND],
          ['||', PREC.LOGICAL_OR],
          ['+', PREC.ADDDITIVE],
          ['-', PREC.ADDDITIVE],
          ['*', PREC.MULTIPLICATIVE],
          ['/', PREC.MULTIPLICATIVE],
          ['&', PREC.BITWISE_AND],
          ['|', PREC.INCLUSIVE_OR],
          ['^', PREC.EXCLUSIVE_OR],
          ['%', PREC.MULTIPLICATIVE],
          ['<<', PREC.SHIFT],
          ['>>', PREC.SHIFT],
        ].map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field('left', $._expression),
              field('operator', operator),
              field('right', $._expression)
            )
          )
        )
      ),

    unary_expression: ($) =>
      choice(
        ...[
          ['+', PREC.UNARY],
          ['-', PREC.UNARY],
          ['!', PREC.UNARY],
          ['~', PREC.UNARY],
        ].map(([operator, precedence]) =>
          prec.right(
            precedence,
            seq(field('operator', operator), field('operand', $._expression))
          )
        )
      ),

    update_expression: ($) =>
      choice(
        prec.right(
          PREC.PREFIX,
          choice(seq('++', $._expression), seq('--', $._expression))
        ),
        prec.left(
          PREC.POSTFIX,
          choice(seq($._expression, '++'), seq($._expression, '--'))
        )
      ),
    sequence_expression: ($) =>
      prec(PREC.SEQUENCE, seq('(', $.comma_expression, ')')),

    parenthesized_expression: ($) =>
      prec(PREC.GROUPING, seq('(', $._expression, ')')),

    subscript_expression: ($) =>
      prec.left(
        PREC.SUBSCRIPT,
        seq(
          field('array', $._expression),
          '[',
          field('index', $.comma_expression),
          ']'
        )
      ),

    field_expression: ($) =>
      prec.left(
        PREC.FIELD,
        seq(field('argument', $._expression), '.', field('field', $.identifier))
      ),

    call_expression: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field('function', choice($.type_specifier, $._expression)),
          '(',
          optional('void', $.function_call_parameter_list),
          ')'
        )
      ),

    comma_expression: ($) => commaSep1($._expression),

    function_call_parameter_list: ($) => commaSep1($._expression),

    assignment_expression: ($) =>
      prec.right(
        PREC.ASSIGNMENT,
        seq(
          field('left', $._assignment_left_expression),
          field(
            'operator',
            choice(
              '=',
              '+=',
              '-=',
              '*=',
              '/=',
              '%=',
              '<<=',
              '>>=',
              '&=',
              '^=',
              '|='
            )
          ),
          field('right', $._expression)
        )
      ),
    conditional_expression: ($) =>
      prec.right(
        PREC.SELECTION,
        seq(
          field('condition', $._expression),
          '?',
          field('consequence', $._expression),
          ':',
          field('alternative', $._expression)
        )
      ),

    _expression: ($) => choice($.assignment_expression, $._constant_expression),

    _constant_expression: ($) =>
      choice(
        $.unary_expression,
        $.update_expression,
        $.binary_expression,
        $.call_expression,
        $.field_expression,
        $.conditional_expression,
        $.subscript_expression,
        $.parenthesized_expression,
        $.sequence_expression,
        $.identifier,
        $.number_literal,
        'true',
        'false'
      ),
    _assignment_left_expression: ($) =>
      choice(
        $.call_expression,
        $.field_expression,
        $.subscript_expression,
        $.unary_expression,
        $.update_expression,
        $.parenthesized_expression,
        $.identifier,
        $.number_literal,
        'true',
        'false'
      ),

    // https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#integers
    // https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#floats
    number_literal: ($) =>
      choice(
        /[1-9][0-9]*[uU]?/,
        /[0-7]+[uU]?/,
        /0[xX][0-9a-fA-F]+/,
        /[0-9]\.[0-9]([eE][-+]?[0-9]+)?([lL]?[fF])?/,
        /[0-9]\.([eE][-+]?[0-9]+)?([lL]?[fF])?/,
        /\.[0-9]([eE][-+]?[0-9]+)?([lL]?[fF])?/
      ),

    // floating_constant: ($) => /[0-9]+\.[0-9]+/,

    // https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#comments
    comment: ($) =>
      token(
        prec(
          PREC.COMMENT,
          choice(
            seq('//', /(.*?\\\n|.*)*/),
            seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
            seq('#', /.*/) // TODO add preprocessor
          )
        )
      ),
    identifier: ($) => /[_a-zA-Z][_a-zA-Z0-9]*/,
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSepTrailing(recurSymbol, rule) {
  return choice(rule, seq(recurSymbol, ',', rule));
}
